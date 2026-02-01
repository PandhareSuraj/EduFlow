import { useEffect, useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export function NavigationProgress() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const previousPath = useRef(location.pathname)

  useEffect(() => {
    // Only trigger on actual route changes
    if (previousPath.current === location.pathname) return
    previousPath.current = location.pathname

    setVisible(true)
    setLoading(true)
    setProgress(0)

    // Animate progress
    const timer1 = setTimeout(() => setProgress(30), 50)
    const timer2 = setTimeout(() => setProgress(60), 150)
    const timer3 = setTimeout(() => setProgress(85), 300)
    const timer4 = setTimeout(() => {
      setProgress(100)
      setLoading(false)
    }, 400)
    const timer5 = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [location.pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
      <div
        className={cn(
          "h-full bg-gradient-to-r from-primary via-primary to-secondary transition-all duration-300 ease-out",
          loading ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          width: `${progress}%`,
          boxShadow: "0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))"
        }}
      />
    </div>
  )
}
