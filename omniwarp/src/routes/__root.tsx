import { Outlet, createRootRoute } from '@tanstack/react-router'

function RootComponent() {
  return (
    <main className='h-screen'>
      <Outlet />
    </main>
  )
}

const Route = createRootRoute({
  component: RootComponent,
})

export { Route }
