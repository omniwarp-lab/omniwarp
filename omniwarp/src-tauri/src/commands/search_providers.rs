use crate::db::{Db, DbResult};
use parking_lot::Mutex;
use rusqlite::params;
use std::collections::{HashMap, VecDeque};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Instant;
use tauri::{AppHandle, Emitter, Manager, State};

const SEARCH_PROVIDERS_UPDATED: &str = "omniwarp://search-providers-updated";

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchProvider {
    pub id: String,
    pub name: String,
    pub url: String,
    pub has_icon: bool,
    pub icon_updated_at: Option<i64>,
    pub is_custom: bool,
    pub enabled: bool,
}

pub enum OriginEntry {
    Hit(String),
    Miss(Instant),
}

#[derive(Default)]
pub struct IconCache {
    pub origins: HashMap<String, OriginEntry>,
    pub keys: HashMap<String, Vec<u8>>,
    pub lru_keys: VecDeque<String>,
}

impl IconCache {
    pub fn put(&mut self, origin: String, key: String, bytes: Vec<u8>) {
        if self.keys.len() >= 32 {
            if let Some(oldest_key) = self.lru_keys.pop_front() {
                self.keys.remove(&oldest_key);
            }
        }
        self.keys.insert(key.clone(), bytes);
        self.lru_keys.push_back(key.clone());
        self.origins.insert(origin, OriginEntry::Hit(key));
    }

    pub fn put_miss(&mut self, origin: String) {
        self.origins.insert(origin, OriginEntry::Miss(Instant::now()));
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IconPreview {
    pub key: String,
}

static PREVIEW_COUNTER: AtomicU64 = AtomicU64::new(1);

#[tauri::command]
#[tracing::instrument(skip_all)]
pub async fn preview_search_provider_icon(
    icon_cache: State<'_, Mutex<IconCache>>,
    url: String,
) -> Result<Option<IconPreview>, String> {
    let (_, origin) = match crate::web_search::icon::extract_origin_and_base(&url) {
        Some(res) => res,
        None => return Ok(None),
    };

    // Check cache
    {
        let guard = icon_cache.lock();
        if let Some(entry) = guard.origins.get(&origin) {
            match entry {
                OriginEntry::Hit(key) => {
                    if guard.keys.contains_key(key) {
                        return Ok(Some(IconPreview { key: key.clone() }));
                    }
                }
                OriginEntry::Miss(time) => {
                    if time.elapsed() < std::time::Duration::from_secs(30) {
                        return Ok(None);
                    }
                }
            }
        }
    }

    // Fetch icon
    if let Some(bytes) = crate::web_search::icon::fetch_icon_for_url(&url).await {
        let key = format!(
            "p_{}_{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis(),
            PREVIEW_COUNTER.fetch_add(1, Ordering::Relaxed)
        );
        let preview = IconPreview { key: key.clone() };
        let mut guard = icon_cache.lock();
        guard.put(origin, key, bytes);
        Ok(Some(preview))
    } else {
        let mut guard = icon_cache.lock();
        guard.put_miss(origin);
        Ok(None)
    }
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn list_search_providers(db: State<'_, Db>) -> DbResult<Vec<SearchProvider>> {
    let conn = db.conn();
    let mut stmt = conn.prepare_cached(
        "SELECT id, name, url, icon_data IS NOT NULL AS has_icon, icon_updated_at, is_custom, enabled FROM search_providers ORDER BY position ASC, rowid ASC",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(SearchProvider {
                id: row.get(0)?,
                name: row.get(1)?,
                url: row.get(2)?,
                has_icon: row.get(3)?,
                icon_updated_at: row.get(4)?,
                is_custom: row.get(5)?,
                enabled: row.get(6)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn set_search_provider_enabled(
    app: AppHandle,
    db: State<'_, Db>,
    id: String,
    enabled: bool,
) -> DbResult<()> {
    db.execute(
        "UPDATE search_providers SET enabled = ?1 WHERE id = ?2",
        params![enabled, id],
    )?;
    let _ = app.emit(SEARCH_PROVIDERS_UPDATED, ());
    Ok(())
}

fn resolve_icon(
    icon_cache: &Mutex<IconCache>,
    url: &str,
) -> (Option<Vec<u8>>, Option<i64>, bool) {
    let origin = crate::web_search::icon::extract_origin_and_base(url).map(|(_, o)| o);
    let cached_icon = origin.as_ref().and_then(|orig| {
        let guard = icon_cache.lock();
        if let Some(OriginEntry::Hit(key)) = guard.origins.get(orig) {
            guard.keys.get(key).cloned()
        } else {
            None
        }
    });

    match cached_icon {
        Some(hit) => {
            let now_secs = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64;
            (Some(hit), Some(now_secs), true)
        }
        None => (None, None, false),
    }
}

fn fetch_and_save_icon_background(app: AppHandle, id: String, url: String) {
    tauri::async_runtime::spawn(async move {
        if let Some(bytes) = crate::web_search::icon::fetch_icon_for_url(&url).await {
            let db = app.state::<Db>();
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64;
            let _ = db.execute(
                "UPDATE search_providers SET icon_data = ?1, icon_updated_at = ?2 WHERE id = ?3",
                params![bytes, now, id],
            );
            let _ = app.emit(SEARCH_PROVIDERS_UPDATED, ());
        }
    });
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub async fn add_search_provider(
    app: AppHandle,
    db: State<'_, Db>,
    icon_cache: State<'_, Mutex<IconCache>>,
    name: String,
    url: String,
) -> DbResult<SearchProvider> {
    let now_millis = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let id = format!("custom_{now_millis}");
    let name = name.trim().to_string();
    let url = url.trim().to_string();

    let (icon_data, icon_updated_at, has_icon) = resolve_icon(&icon_cache, &url);

    db.execute(
        "INSERT INTO search_providers (id, name, url, icon_data, icon_updated_at, is_custom, position) VALUES (?1, ?2, ?3, ?4, ?5, 1, (SELECT COALESCE(MAX(position) + 1, 0) FROM search_providers))",
        params![id, name, url, icon_data, icon_updated_at],
    )?;
    let _ = app.emit(SEARCH_PROVIDERS_UPDATED, ());

    if !has_icon {
        fetch_and_save_icon_background(app, id.clone(), url.clone());
    }

    Ok(SearchProvider {
        id,
        name,
        url,
        has_icon,
        icon_updated_at,
        is_custom: true,
        enabled: true,
    })
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub async fn update_search_provider(
    app: AppHandle,
    db: State<'_, Db>,
    icon_cache: State<'_, Mutex<IconCache>>,
    id: String,
    name: String,
    url: String,
) -> DbResult<SearchProvider> {
    let name = name.trim().to_string();
    let url = url.trim().to_string();

    let conn = db.conn();
    let (old_url, is_custom, enabled, mut has_icon, mut icon_updated_at): (
        String,
        bool,
        bool,
        bool,
        Option<i64>,
    ) = conn.query_row(
        "SELECT url, is_custom, enabled, icon_data IS NOT NULL, icon_updated_at FROM search_providers WHERE id = ?1",
        params![id],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
    )?;

    if old_url == url || !is_custom {
        db.execute(
            "UPDATE search_providers SET name = ?1, url = ?2 WHERE id = ?3",
            params![name, url, id],
        )?;
    } else {
        let (icon_data, updated_at, cached) = resolve_icon(&icon_cache, &url);
        has_icon = cached;
        icon_updated_at = updated_at;

        db.execute(
            "UPDATE search_providers SET name = ?1, url = ?2, icon_data = ?3, icon_updated_at = ?4 WHERE id = ?5",
            params![name, url, icon_data, icon_updated_at, id],
        )?;

        if !has_icon {
            fetch_and_save_icon_background(app.clone(), id.clone(), url.clone());
        }
    }

    let _ = app.emit(SEARCH_PROVIDERS_UPDATED, ());

    Ok(SearchProvider {
        id,
        name,
        url,
        has_icon,
        icon_updated_at,
        is_custom,
        enabled,
    })
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn reorder_search_providers(
    app: AppHandle,
    db: State<'_, Db>,
    ids: Vec<String>,
) -> DbResult<()> {
    for (index, id) in ids.iter().enumerate() {
        db.execute(
            "UPDATE search_providers SET position = ?1 WHERE id = ?2",
            params![index as i64, id],
        )?;
    }
    let _ = app.emit(SEARCH_PROVIDERS_UPDATED, ());
    Ok(())
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn delete_search_provider(
    app: AppHandle,
    db: State<'_, Db>,
    id: String,
) -> DbResult<()> {
    db.execute(
        "DELETE FROM search_providers WHERE id = ?1 AND is_custom = 1",
        params![id],
    )?;
    let _ = app.emit(SEARCH_PROVIDERS_UPDATED, ());
    Ok(())
}
