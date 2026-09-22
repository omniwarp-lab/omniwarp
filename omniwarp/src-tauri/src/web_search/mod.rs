use scraper::{Html, Selector};
use std::sync::LazyLock;
use tauri_plugin_opener::OpenerExt;

pub mod error;
pub mod icon;
pub use error::WebSearchResult;

pub struct WebSearch;

impl WebSearch {
    pub fn open(app: &tauri::AppHandle, url: &str) -> WebSearchResult<()> {
        app.opener().open_url(url, None::<&str>)?;
        Ok(())
    }
}

pub static CLIENT: LazyLock<reqwest::Client> = LazyLock::new(|| {
    reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(std::time::Duration::from_secs(3))
        .redirect(reqwest::redirect::Policy::limited(3))
        .build()
        .unwrap_or_default()
});

fn extract_title(html: &str) -> Option<String> {
    let doc = Html::parse_document(html);
    let selector = Selector::parse("title").ok()?;
    let title = doc.select(&selector).next()?.text().collect::<String>();

    let name = title
        .split(['·', '•', '|', '—', '–', '-', ':', ','])
        .next()
        .unwrap_or("")
        .trim();

    (!name.is_empty()).then_some(name.to_string())
}

async fn fetch_and_extract(url: &str) -> Option<String> {
    let res = CLIENT.get(url).send().await.ok()?.error_for_status().ok()?;
    extract_title(&res.text().await.ok()?)
}

pub async fn fetch_site_name(raw_url: &str) -> Option<String> {
    let raw = raw_url.trim();
    let url_str = if raw.starts_with("http://") || raw.starts_with("https://") {
        raw.to_string()
    } else {
        format!("https://{raw}")
    };

    let parsed = reqwest::Url::parse(&url_str).ok()?;
    let origin = parsed.origin().ascii_serialization();

    if let Some(name) = fetch_and_extract(&origin).await {
        return Some(name);
    }

    if parsed.path() != "/" {
        let clean_path = url_str.replace("{query}", "").replace("%7Bquery%7D", "");
        return fetch_and_extract(&clean_path).await;
    }

    None
}
