import React from 'react'
import ReactDOM from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import i18n from '@/i18n'
import { syncTrayLabels } from '@/features/tray/commands'
import { routeTree } from './routeTree.gen'
import './App.css'
import { initLanguageSync } from '@/features/settings/sync'

i18n.on('initialized', syncTrayLabels)
syncTrayLabels()
initLanguageSync()

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
