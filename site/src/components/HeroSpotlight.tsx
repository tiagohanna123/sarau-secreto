import { useEffect, useRef, useState } from 'react'

export function HeroSpotlight() {
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setPos({ x, y })
      setActive(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setActive(false), 2000)
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      className={`hero-spotlight ${active ? 'active' : ''}`}
      style={{
        background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(220,38,38,0.04), transparent 60%)`,
      }}
    />
  )
}
