use scraper::{Html, Selector};
use std::net::IpAddr;
use std::str::FromStr;
use url::Url;

use super::CLIENT;

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum DetectedFormat {
    Png,
    Jpeg,
    Gif,
    Webp,
    Ico,
    Svg,
}

pub fn detect_magic_bytes(bytes: &[u8]) -> Option<DetectedFormat> {
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        return Some(DetectedFormat::Png);
    }
    if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        return Some(DetectedFormat::Jpeg);
    }
    if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        return Some(DetectedFormat::Gif);
    }
    if bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        return Some(DetectedFormat::Webp);
    }
    if bytes.starts_with(&[0x00, 0x00, 0x01, 0x00]) {
        return Some(DetectedFormat::Ico);
    }
    // Check for SVG: inspect first up to 512 bytes
    let check_len = std::cmp::min(bytes.len(), 512);
    if let Ok(prefix) = std::str::from_utf8(&bytes[..check_len]) {
        if prefix.to_lowercase().contains("<svg") {
            return Some(DetectedFormat::Svg);
        }
    }
    None
}

pub fn is_private_or_loopback_host(host_str: &str) -> bool {
    if host_str.eq_ignore_ascii_case("localhost") {
        return true;
    }
    if let Ok(ip) = IpAddr::from_str(host_str) {
        match ip {
            IpAddr::V4(ipv4) => ipv4.is_loopback() || ipv4.is_private(),
            IpAddr::V6(ipv6) => ipv6.is_loopback(),
        }
    } else {
        false
    }
}

pub fn extract_origin_and_base(raw_url: &str) -> Option<(Url, String)> {
    let raw = raw_url.trim();
    let url_str = if raw.starts_with("http://") || raw.starts_with("https://") {
        raw.to_string()
    } else {
        format!("https://{raw}")
    };

    let clean = url_str
        .replace("{query}", "test")
        .replace("%7Bquery%7D", "test")
        .replace("%s", "test");

    let parsed = Url::parse(&clean).ok()?;
    let origin = parsed.origin().ascii_serialization();
    Some((parsed, origin))
}

#[derive(Debug, Clone)]
pub struct Candidate {
    pub url: String,
    pub score: i32,
}

fn calculate_score(rel: &str, sizes: Option<&str>, mime_type: Option<&str>, url_str: &str) -> i32 {
    let is_svg = mime_type == Some("image/svg+xml") || url_str.ends_with(".svg");
    if is_svg {
        return 10_000;
    }

    let mut score = 3000;
    if let Some(s) = sizes {
        // e.g. "64x64", "128x128", "any"
        let first_num = s
            .split(['x', 'X', ' '])
            .next()
            .and_then(|v| v.parse::<i32>().ok());
        if let Some(w) = first_num {
            if w >= 64 {
                score = 5000 - (w - 64);
            } else if w > 0 {
                score = 2000 + w;
            }
        }
    }

    if rel.contains("apple-touch-icon") {
        score += 500;
    }

    if url_str.ends_with(".ico")
        || mime_type == Some("image/x-icon")
        || mime_type == Some("image/vnd.microsoft.icon")
    {
        score -= 1000;
    }

    score
}

pub fn extract_and_rank_candidates(html: &str, response_url: &Url, origin: &str) -> Vec<Candidate> {
    let mut candidates = Vec::new();
    let doc = Html::parse_document(html);

    // Check <base href>
    let mut effective_base = response_url.clone();
    if let Ok(base_selector) = Selector::parse("base[href]") {
        if let Some(base_el) = doc.select(&base_selector).next() {
            if let Some(href) = base_el.value().attr("href") {
                if let Ok(joined) = response_url.join(href) {
                    effective_base = joined;
                }
            }
        }
    }

    if let Ok(link_selector) = Selector::parse("link[rel]") {
        for link in doc.select(&link_selector) {
            let rel = link.value().attr("rel").unwrap_or("").to_lowercase();
            let is_icon = rel.split_whitespace().any(|part| {
                part == "icon"
                    || part == "shortcut"
                    || part == "apple-touch-icon"
                    || part == "apple-touch-icon-precomposed"
            });

            if !is_icon {
                continue;
            }

            let Some(href) = link.value().attr("href") else {
                continue;
            };
            let href = href.trim();
            if href.is_empty() {
                continue;
            }

            let resolved_url = if href.starts_with("//") {
                format!("{}:{}", effective_base.scheme(), href)
            } else if let Ok(joined) = effective_base.join(href) {
                joined.to_string()
            } else {
                continue;
            };

            let sizes = link.value().attr("sizes").map(|s| s.trim().to_lowercase());
            let mime_type = link.value().attr("type").map(|s| s.trim().to_lowercase());

            let score =
                calculate_score(&rel, sizes.as_deref(), mime_type.as_deref(), &resolved_url);

            candidates.push(Candidate {
                url: resolved_url,
                score,
            });
        }
    }

    // Always append {origin}/favicon.ico as the last candidate
    candidates.push(Candidate {
        url: format!("{origin}/favicon.ico"),
        score: -2000,
    });

    // Sort descending by score
    candidates.sort_by(|a, b| b.score.cmp(&a.score));

    // Deduplicate by URL while maintaining order and cap at 4
    let mut seen = std::collections::HashSet::new();
    candidates.retain(|c| seen.insert(c.url.clone()));
    candidates.truncate(4);
    candidates
}

pub async fn validate_and_download_candidate(
    candidate_url: &str,
    origin_is_private: bool,
) -> Option<(Vec<u8>, DetectedFormat)> {
    let parsed = Url::parse(candidate_url).ok()?;
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return None;
    }

    let host = parsed.host_str()?;
    if is_private_or_loopback_host(host) && !origin_is_private {
        return None;
    }

    let mut res = CLIENT
        .get(candidate_url)
        .send()
        .await
        .ok()?
        .error_for_status()
        .ok()?;

    let mut bytes = Vec::new();
    while let Some(chunk) = res.chunk().await.ok()? {
        if bytes.len() + chunk.len() > 256 * 1024 {
            return None;
        }
        bytes.extend_from_slice(&chunk);
    }

    if bytes.is_empty() {
        return None;
    }

    let format = detect_magic_bytes(&bytes)?;
    Some((bytes, format))
}

pub async fn normalize_icon(bytes: Vec<u8>, format: DetectedFormat) -> Option<Vec<u8>> {
    if format == DetectedFormat::Svg {
        return Some(bytes);
    }

    tauri::async_runtime::spawn_blocking(move || {
        use std::io::Cursor;
        let mut limits = image::Limits::default();
        limits.max_image_width = Some(2048);
        limits.max_image_height = Some(2048);
        limits.max_alloc = Some(16 * 1024 * 1024);

        let mut reader = image::ImageReader::new(Cursor::new(&bytes));
        reader.limits(limits);
        let dyn_img = reader.with_guessed_format().ok()?.decode().ok()?;
        let resized = dyn_img.resize(64, 64, image::imageops::FilterType::Lanczos3);
        let mut out = Vec::new();
        resized
            .write_to(&mut Cursor::new(&mut out), image::ImageFormat::Png)
            .ok()?;
        Some(out)
    })
    .await
    .ok()
    .flatten()
}

async fn fetch_icon_internal(raw_url: &str) -> Option<Vec<u8>> {
    let (parsed_url, origin) = extract_origin_and_base(raw_url)?;
    let origin_is_private = parsed_url
        .host_str()
        .map(is_private_or_loopback_host)
        .unwrap_or(false);

    // Fetch page HTML to extract link tags
    let mut candidates = Vec::new();
    if let Ok(res) = CLIENT.get(parsed_url.as_str()).send().await {
        if let Ok(mut res) = res.error_for_status() {
            let response_url = res.url().clone();
            let mut html_bytes = Vec::new();
            while let Ok(Some(chunk)) = res.chunk().await {
                if html_bytes.len() + chunk.len() > 512 * 1024 {
                    let remaining = 512 * 1024 - html_bytes.len();
                    html_bytes.extend_from_slice(&chunk[..remaining]);
                    break;
                }
                html_bytes.extend_from_slice(&chunk);
            }
            let html_str = String::from_utf8_lossy(&html_bytes);
            candidates = extract_and_rank_candidates(&html_str, &response_url, &origin);
        }
    }

    if candidates.is_empty() {
        candidates.push(Candidate {
            url: format!("{origin}/favicon.ico"),
            score: -2000,
        });
    }

    for candidate in candidates {
        if let Some((bytes, format)) =
            validate_and_download_candidate(&candidate.url, origin_is_private).await
        {
            if let Some(norm_bytes) = normalize_icon(bytes, format).await {
                return Some(norm_bytes);
            }
        }
    }

    None
}

pub async fn fetch_icon_for_url(raw_url: &str) -> Option<Vec<u8>> {
    tokio::time::timeout(
        std::time::Duration::from_secs(6),
        fetch_icon_internal(raw_url),
    )
    .await
    .ok()
    .flatten()
}
