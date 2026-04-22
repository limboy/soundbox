import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/use-theme'
import { cn } from '@/lib/utils'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex h-5 w-11 items-center rounded-full border bg-muted/40 transition-all duration-300 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "group"
      )}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Icons on the track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-muted-foreground/30">
        <Sun className="h-2.5 w-2.5" />
        <Moon className="h-2.5 w-2.5" />
      </div>

      {/* Sliding indicator */}
      <div
        className={cn(
          "relative flex h-5 w-5 items-center justify-center rounded-full border bg-background transition-all duration-300 ease-in-out",
          theme === 'dark' ? "translate-x-5.5" : "translate-x-0"
        )}
      >
        {theme === 'light' ? (
          <Sun className="h-2.5 w-2.5 text-foreground transition-all" />
        ) : (
          <Moon className="h-2.5 w-2.5 text-foreground transition-all" />
        )}
      </div>
    </button>
  )
}
