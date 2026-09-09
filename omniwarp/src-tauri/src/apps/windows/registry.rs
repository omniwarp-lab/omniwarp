use windows::Win32::Foundation::{ERROR_MORE_DATA, ERROR_SUCCESS};
use windows::Win32::System::Registry::{RegEnumKeyW, HKEY};

pub fn enum_subkeys(hkey: HKEY) -> Vec<String> {
    let mut names = Vec::new();
    let mut buffer = [0u16; 256];
    let mut index = 0u32;

    loop {
        let result = unsafe { RegEnumKeyW(hkey, index, Some(&mut buffer)) };
        if result == ERROR_SUCCESS {
            let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
            names.push(String::from_utf16_lossy(&buffer[..len]));
            index += 1;
        } else if result == ERROR_MORE_DATA {
            let mut dynamic_buf = vec![0u16; 1024];
            loop {
                let res = unsafe { RegEnumKeyW(hkey, index, Some(&mut dynamic_buf[..])) };
                if res == ERROR_SUCCESS {
                    let len = dynamic_buf
                        .iter()
                        .position(|&c| c == 0)
                        .unwrap_or(dynamic_buf.len());
                    names.push(String::from_utf16_lossy(&dynamic_buf[..len]));
                    break;
                } else if res == ERROR_MORE_DATA && dynamic_buf.len() < 65536 {
                    dynamic_buf.resize(dynamic_buf.len() * 2, 0);
                } else {
                    break;
                }
            }
            index += 1;
        } else {
            break; // ERROR_NO_MORE_ITEMS in the normal case
        }
    }

    names
}
