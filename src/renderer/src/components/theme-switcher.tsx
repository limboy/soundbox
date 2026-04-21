import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
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
        "relative flex h-7 w-[50px] items-center rounded-full border bg-muted/40 p-1 transition-all duration-300 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "group"
      )}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Icons on the track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-muted-foreground/30">
        <Sun className="h-3.5 w-3.5" />
        <Moon className="h-3.5 w-3.5" />
      </div>

      {/* Sliding indicator */}
      <div
        className={cn(
          "relative flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-md transition-all duration-300 ease-in-out",
          theme === 'dark' ? "translate-x-[22px]" : "translate-x-0"
        )}
      >
        {theme === 'light' ? (
          <Sun className="h-3.5 w-3.5 text-foreground transition-all" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-foreground transition-all" />
        )}
      </div>
    </button>
  )
}
