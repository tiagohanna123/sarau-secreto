import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownTimer({ targetDate, label }: { targetDate: Date; label: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const expired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (expired) return null

  return (
    <div className="text-center">
      <p className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
          <div key={unit} className="countdown-unit">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={timeLeft[unit]}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="countdown-value"
              >
                {String(timeLeft[unit]).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className="countdown-label">{unit === 'days' ? 'Dias' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min' : 'Seg'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
