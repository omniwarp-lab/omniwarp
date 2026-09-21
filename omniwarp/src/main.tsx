import React from 'react'
import ReactDOM from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './App.css'
import { initLanguageSync } from '@/features/settings/sync'
import { initCalculatorSettingsSync } from '@/features/calculator/store'
import { initSearchProvidersSettingsSync } from '@/features/search-providers/store'

initLanguageSync()
initCalculatorSettingsSync()
initSearchProvidersSettingsSync()

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
