use crate::sound::{Sound, SoundResult};
use windows::core::Result;
use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
use windows::Win32::Media::Audio::{
    eCapture, eCommunications, eConsole, eRender, EDataFlow, ERole, IMMDevice, IMMDeviceEnumerator,
    MMDeviceEnumerator,
};
use windows::Win32::System::Com::{CoCreateInstance, CLSCTX_ALL};

fn get_default_endpoint_volume(data_flow: EDataFlow, role: ERole) -> Result<IAudioEndpointVolume> {
    unsafe {
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)?;
        let device: IMMDevice = enumerator.GetDefaultAudioEndpoint(data_flow, role)?;
        let endpoint_volume: IAudioEndpointVolume = device.Activate(CLSCTX_ALL, None)?;
        Ok(endpoint_volume)
    }
}

fn toggle_endpoint_mute(data_flow: EDataFlow, role: ERole) -> SoundResult<bool> {
    let endpoint_volume = get_default_endpoint_volume(data_flow, role)?;
    unsafe {
        let is_muted = endpoint_volume.GetMute()?.as_bool();
        let new_state = !is_muted;
        endpoint_volume.SetMute(new_state, std::ptr::null())?;
        Ok(new_state)
    }
}

fn get_endpoint_volume(data_flow: EDataFlow, role: ERole) -> SoundResult<u32> {
    let endpoint_volume = get_default_endpoint_volume(data_flow, role)?;
    unsafe {
        let level = endpoint_volume.GetMasterVolumeLevelScalar()?;
        Ok((level * 100.0).round() as u32)
    }
}

fn set_endpoint_volume(data_flow: EDataFlow, role: ERole, percent: u32) -> SoundResult<()> {
    let endpoint_volume = get_default_endpoint_volume(data_flow, role)?;
    let clamped = percent.min(100);
    unsafe {
        if endpoint_volume.GetMute()?.as_bool() && clamped > 0 {
            endpoint_volume.SetMute(false, std::ptr::null())?;
        }
        endpoint_volume.SetMasterVolumeLevelScalar(clamped as f32 / 100.0, std::ptr::null())?;
    }
    Ok(())
}

impl Sound {
    pub fn toggle_mute() -> SoundResult<()> {
        toggle_endpoint_mute(eRender, eConsole)?;
        Ok(())
    }

    pub fn toggle_microphone_mute() -> SoundResult<bool> {
        toggle_endpoint_mute(eCapture, eCommunications)
    }

    pub fn get_volume() -> SoundResult<u32> {
        get_endpoint_volume(eRender, eConsole)
    }

    pub fn set_volume(percent: u32) -> SoundResult<()> {
        set_endpoint_volume(eRender, eConsole, percent)
    }

    pub fn get_microphone_volume() -> SoundResult<u32> {
        get_endpoint_volume(eCapture, eCommunications)
    }

    pub fn set_microphone_volume(percent: u32) -> SoundResult<()> {
        set_endpoint_volume(eCapture, eCommunications, percent)
    }
}

