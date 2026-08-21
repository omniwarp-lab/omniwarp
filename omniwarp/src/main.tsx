import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import i18n from '@/i18n'
import { syncTrayLabels } from '@/features/tray/commands'

i18n.on('initialized', syncTrayLabels)
syncTrayLabels()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
