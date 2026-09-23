use crate::sound::{Sound, SoundResult};
use windows::core::Result;
use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
use windows::Win32::Media::Audio::{
    eConsole, eRender, IMMDevice, IMMDeviceEnumerator, MMDeviceEnumerator,
};
use windows::Win32::System::Com::{CoCreateInstance, CLSCTX_ALL};

fn get_default_speaker_volume() -> Result<IAudioEndpointVolume> {
    unsafe {
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)?;
        let device: IMMDevice = enumerator.GetDefaultAudioEndpoint(eRender, eConsole)?;
        let endpoint_volume: IAudioEndpointVolume = device.Activate(CLSCTX_ALL, None)?;
        Ok(endpoint_volume)
    }
}

impl Sound {
    pub fn toggle_mute() -> SoundResult<()> {
        unsafe {
            let endpoint_volume = get_default_speaker_volume()?;
            let is_muted = endpoint_volume.GetMute()?;
            endpoint_volume.SetMute(!is_muted.as_bool(), std::ptr::null())?;
        }
        Ok(())
    }
}
