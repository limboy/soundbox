import {
  Link,
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState
} from '@tanstack/react-router'
import { Home, Music, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type IconType = typeof Home

function NavLink({
  to,
  icon: Icon,
  children
}: {
  to: string
  icon: IconType
  children: React.ReactNode
}): React.JSX.Element {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const active = pathname === to
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

function Layout(): React.JSX.Element {
  return (
    <div className="flex h-screen">
      <aside className="w-56 border-r bg-sidebar p-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Music className="h-5 w-5" />
          <span className="font-semibold">SoundBox</span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" icon={Home}>
            Home
          </NavLink>
          <NavLink to="/library" icon={Music}>
            Library
          </NavLink>
          <NavLink to="/settings" icon={Settings}>
            Settings
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

const rootRoute = createRootRoute({
  component: Layout
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function HomePage() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to SoundBox</CardTitle>
          <CardDescription>
            An Electron + React + Vite + Tailwind + shadcn starter.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </CardContent>
      </Card>
    )
  }
})

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library',
  component: function LibraryPage() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
          <CardDescription>Your tracks will live here.</CardDescription>
        </CardHeader>
      </Card>
    )
  }
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: function SettingsPage() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Preferences and configuration.</CardDescription>
        </CardHeader>
      </Card>
    )
  }
})

const routeTree = rootRoute.addChildren([indexRoute, libraryRoute, settingsRoute])

const router = createRouter({
  routeTree,
  history: createHashHistory()
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App(): React.JSX.Element {
  return <RouterProvider router={router} />
}

export default App
