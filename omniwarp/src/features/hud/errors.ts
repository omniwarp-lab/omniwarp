import i18n from '@/i18n'
import { showHud } from '@/features/hud/commands'

function getErrorMessage(err: unknown): string {
  const key = typeof err === 'string' ? `errors.${err}` : ''
  return key && i18n.exists(key) ? i18n.t(key) : i18n.t('errors.generic')
}

function showAppError(err: unknown): Promise<void> {
  const message = getErrorMessage(err)
  return showHud(message, { description: i18n.t('errors.checkLogs') })
}

export { getErrorMessage, showAppError }
