use crate::system::System;

const VK_MEDIA_NEXT_TRACK: u8 = 0xB0;
const VK_MEDIA_PREV_TRACK: u8 = 0xB1;
const VK_MEDIA_PLAY_PAUSE: u8 = 0xB3;
const KEYEVENTF_EXTENDEDKEY: u32 = 0x0001;
const KEYEVENTF_KEYUP: u32 = 0x0002;

#[link(name = "user32")]
extern "system" {
    fn keybd_event(b_vk: u8, b_scan: u8, dw_flags: u32, dw_extra_info: usize);
}

fn send_media_key(vk: u8) {
    unsafe {
        keybd_event(vk, 0, KEYEVENTF_EXTENDEDKEY, 0);
        keybd_event(vk, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0);
    }
}

impl System {
    pub fn next_track() {
        send_media_key(VK_MEDIA_NEXT_TRACK);
    }

    pub fn previous_track() {
        send_media_key(VK_MEDIA_PREV_TRACK);
    }

    pub fn play_pause() {
        send_media_key(VK_MEDIA_PLAY_PAUSE);
    }
}
