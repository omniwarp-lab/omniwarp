use windows::core::PCWSTR;
use windows::Win32::System::Environment::ExpandEnvironmentStringsW;

pub fn expand_env_vars(input: &str) -> String {
    let wide: Vec<u16> = input.encode_utf16().chain(std::iter::once(0)).collect();
    let src = PCWSTR(wide.as_ptr());

    let needed = unsafe { ExpandEnvironmentStringsW(src, None) };
    if needed == 0 {
        return input.to_string();
    }

    let mut buffer = vec![0u16; needed as usize];
    let written = unsafe { ExpandEnvironmentStringsW(src, Some(&mut buffer)) };
    if written == 0 {
        return input.to_string();
    }

    let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
    String::from_utf16_lossy(&buffer[..len])
}
