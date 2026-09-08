import { invoke } from '@tauri-apps/api/core'
import i18n from '@/i18n.ts'

async function syncTrayLabels() {
  if (!i18n.isInitialized) return

  await invoke('update_tray_menu', {
    labels: {
      quit: i18n.t('tray.quit'),
    },
  }).catch(() => {})
}

export { syncTrayLabels }
