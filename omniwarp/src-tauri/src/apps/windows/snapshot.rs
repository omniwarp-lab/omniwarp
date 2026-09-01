use crate::apps::{AppInfo, Apps};
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
    pub fn snapshot_running(&mut self) {
        let Ok(snapshot) = ProcessSnapshot::new() else {
            for app in &mut self.apps {
                app.pids.clear();
            }
            return;
        };

        let mut pids_by_exe: HashMap<String, Vec<u32>> = HashMap::new();
        for entry in snapshot.entries() {
            let len = entry
                .szExeFile
                .iter()
                .position(|&c| c == 0)
                .unwrap_or(entry.szExeFile.len());
            let exe_name = String::from_utf16_lossy(&entry.szExeFile[..len]).to_lowercase();

            if !exe_name.is_empty() {
                pids_by_exe
                    .entry(exe_name)
                    .or_default()
                    .push(entry.th32ProcessID);
            }
        }

        assign_pids_to_base_apps(&mut self.apps, pids_by_exe);
    }
}

fn assign_pids_to_base_apps(apps: &mut [AppInfo], mut pids_by_exe: HashMap<String, Vec<u32>>) {
    for app in apps.iter_mut() {
        app.pids.clear();
    }

    let mut exe_to_app_indices: HashMap<String, Vec<usize>> = HashMap::new();
    for (idx, app) in apps.iter().enumerate() {
        if let Some(exe) =
            extract_target_file_name(&app.target_path).or_else(|| extract_target_file_name(&app.id))
        {
            exe_to_app_indices.entry(exe).or_default().push(idx);
        }
    }

    for (exe_name, candidate_indices) in exe_to_app_indices {
        if let Some(mut pids) = pids_by_exe.remove(&exe_name) {
            if candidate_indices.is_empty() {
                continue;
            }

            let exe_stem = exe_name.strip_suffix(".exe").unwrap_or(&exe_name);

            let &best_idx = candidate_indices
                .iter()
                .min_by_key(|&&idx| {
                    let app = &apps[idx];
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

            pids.sort_unstable();
            pids.dedup();
            apps[best_idx].pids = pids;
        }
    }
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
