use crate::db::{Db, DbResult};
use rusqlite::params;
use tauri::{AppHandle, Emitter, State};

const SEARCH_PROVIDERS_UPDATED: &str = "omniwarp://search-providers-updated";

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchProvider {
    pub id: String,
    pub name: String,
    pub url: String,
    pub icon: Option<String>,
    pub is_custom: bool,
    pub enabled: bool,
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn list_search_providers(db: State<'_, Db>) -> DbResult<Vec<SearchProvider>> {
    let conn = db.conn();
    let mut stmt = conn.prepare_cached(
        "SELECT id, name, url, icon, is_custom, enabled FROM search_providers ORDER BY rowid ASC",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(SearchProvider {
                id: row.get(0)?,
                name: row.get(1)?,
                url: row.get(2)?,
                icon: row.get(3)?,
                is_custom: row.get(4)?,
                enabled: row.get(5)?,
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

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn add_search_provider(
    app: AppHandle,
    db: State<'_, Db>,
    name: String,
    url: String,
) -> DbResult<SearchProvider> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let id = format!("custom_{now}");
    let name = name.trim().to_string();
    let url = url.trim().to_string();

    db.execute(
        "INSERT INTO search_providers (id, name, url, is_custom) VALUES (?1, ?2, ?3, 1)",
        params![id, name, url],
    )?;
    let _ = app.emit(SEARCH_PROVIDERS_UPDATED, ());

    Ok(SearchProvider {
        id,
        name,
        url,
        icon: None,
        is_custom: true,
        enabled: true,
    })
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
