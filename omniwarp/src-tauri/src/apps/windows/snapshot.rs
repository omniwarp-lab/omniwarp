use crate::apps::Apps;
use std::collections::HashMap;
use std::path::Path;
use windows::Win32::Foundation::{CloseHandle, HANDLE};
use windows::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
};

struct ProcessSnapshot(HANDLE);

impl ProcessSnapshot {
    fn new() -> windows::core::Result<Self> {
        unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) }.map(Self)
    }

    fn entries(&self) -> impl Iterator<Item = PROCESSENTRY32W> + '_ {
        let mut entry = PROCESSENTRY32W {
            dwSize: size_of::<PROCESSENTRY32W>() as u32,
            ..Default::default()
        };
        let mut started = false;

        std::iter::from_fn(move || {
            let ok = if !started {
                started = true;
                unsafe { Process32FirstW(self.0, &mut entry) }.is_ok()
            } else {
                unsafe { Process32NextW(self.0, &mut entry) }.is_ok()
            };
            ok.then_some(entry)
        })
    }
}

impl Drop for ProcessSnapshot {
    fn drop(&mut self) {
        unsafe {
            let _ = CloseHandle(self.0);
        }
    }
}

impl Apps {
    pub(crate) fn build_exe_index(&mut self) {
        let mut candidates_by_exe: HashMap<String, Vec<usize>> = HashMap::new();

        for (idx, app) in self.apps.iter().enumerate() {
            if let Some(exe) = extract_target_file_name(&app.target_path)
                .or_else(|| extract_target_file_name(&app.id))
            {
                candidates_by_exe.entry(exe).or_default().push(idx);
            }
        }

        self.exe_index.clear();
        self.exe_index.reserve(candidates_by_exe.len());

        for (exe_name, candidate_indices) in candidates_by_exe {
            if candidate_indices.is_empty() {
                continue;
            }

            let exe_stem = exe_name.strip_suffix(".exe").unwrap_or(&exe_name);

            let &best_idx = candidate_indices
                .iter()
                .min_by_key(|&&idx| {
                    let app = &self.apps[idx];
                    let args_trimmed = app.args.trim();
                    let has_args = !args_trimmed.is_empty();
                    let name_lower = app.name.to_lowercase();
                    let name_exact_stem = name_lower == exe_stem;
                    let name_contains_stem = name_lower.contains(exe_stem);
                    let name_rank = if name_exact_stem {
                        0
                    } else if name_contains_stem {
                        1
                    } else {
                        2
                    };
                    (has_args, name_rank, args_trimmed.len(), idx)
                })
                .expect("candidate_indices is not empty");

            self.exe_index.insert(exe_name, best_idx);
        }
    }

    pub fn snapshot_running(&mut self) {
        for app in &mut self.apps {
            app.pids.clear();
        }

        let Ok(snapshot) = ProcessSnapshot::new() else {
            return;
        };

        let mut name_buf = [0u8; 512];

        for entry in snapshot.entries() {
            if let Some(exe_name) = decode_exe_name(&entry.szExeFile, &mut name_buf) {
                if let Some(&app_idx) = self.exe_index.get(exe_name) {
                    self.apps[app_idx].pids.push(entry.th32ProcessID);
                }
            }
        }

        for app in &mut self.apps {
            if !app.pids.is_empty() {
                app.pids.sort_unstable();
                app.pids.dedup();
            }
        }
    }
}

#[inline]
fn decode_exe_name<'a>(sz_exe_file: &[u16; 260], buf: &'a mut [u8; 512]) -> Option<&'a str> {
    let null_pos = sz_exe_file
        .iter()
        .position(|&c| c == 0)
        .unwrap_or(sz_exe_file.len());
    let wide = &sz_exe_file[..null_pos];
    if wide.is_empty() {
        return None;
    }

    // Fast path: ASCII
    let is_ascii = wide.iter().all(|&c| c < 128);
    if is_ascii && wide.len() <= buf.len() {
        for (i, &c) in wide.iter().enumerate() {
            buf[i] = (c as u8).to_ascii_lowercase();
        }
        return std::str::from_utf8(&buf[..wide.len()]).ok();
    }

    // Fallback: Unicode
    let mut cursor = 0;
    for res in char::decode_utf16(wide.iter().copied()) {
        let ch = res.unwrap_or(char::REPLACEMENT_CHARACTER);
        for lower_ch in ch.to_lowercase() {
            let ch_len = lower_ch.len_utf8();
            if cursor + ch_len > buf.len() {
                break;
            }
            lower_ch.encode_utf8(&mut buf[cursor..cursor + ch_len]);
            cursor += ch_len;
        }
    }

    std::str::from_utf8(&buf[..cursor]).ok()
}

fn extract_target_file_name(target_path: &str) -> Option<String> {
    let trimmed = target_path
        .trim()
        .trim_matches(|c: char| c == '"' || c == '\'')
        .trim();
    if trimmed.is_empty() {
        return None;
    }
    Path::new(trimmed)
        .file_name()
        .and_then(|f| f.to_str())
        .map(|s| s.to_lowercase())
}
