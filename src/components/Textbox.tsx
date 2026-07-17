import { useEffect, useMemo, useRef, useState } from 'react'
import type { Speaker } from '@/game/types'
import { CHARACTERS } from '@/game/types'
import { audio } from '@/game/audio'

interface Props {
  who: Speaker
  text: string
  textSpeed: number
  typing: boolean
  onComplete: () => void
  onAdvance: () => void
}

export function speakerName(who: Speaker): string {
  if (who === 'narrator') return ''
  if (who === 'player') return '阿澈'
  return CHARACTERS[who].name
}

export default function Textbox({ who, text, textSpeed, typing, onComplete, onAdvance }: Props) {
  const [shown, setShown] = useState(0)
  const done = shown >= text.length
  const timerRef = useRef<number | null>(null)
  const blipCount = useRef(0)

  useEffect(() => {
    setShown(0)
    blipCount.current = 0
  }, [text, who])

  useEffect(() => {
    if (!typing || done) return
    timerRef.current = window.setInterval(() => {
      setShown((s) => {
        if (s >= text.length) return s
        blipCount.current++
        if (blipCount.current % 2 === 0) audio.blip(who)
        return s + 1
      })
    }, textSpeed)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [typing, done, text, textSpeed, who])

  useEffect(() => {
    if (done && timerRef.current) clearInterval(timerRef.current)
  }, [done])

  const handleClick = () => {
    if (!done) {
      setShown(text.length)
      onComplete()
    } else {
      onAdvance()
    }
  }

  const display = useMemo(() => text.slice(0, shown), [text, shown])
  const isBailu = who === 'bailu'
  const isNarr = who === 'narrator'
  const color = who !== 'narrator' && who !== 'player' ? CHARACTERS[who].color : '#ffd86b'

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-2 pb-2 md:px-8 md:pb-6" onClick={handleClick}>
      {/* 名牌 */}
      {!isNarr && (
        <div
          className="fade-enter-fast relative z-10 ml-1 inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-1 text-xs font-bold tracking-widest md:ml-6 md:rounded-t-xl md:px-5 md:py-1.5 md:text-lg"
          style={{
            background: 'linear-gradient(150deg, rgba(20,14,40,0.92), rgba(34,22,60,0.88))',
            borderColor: 'rgba(160,150,255,0.25)',
            color,
            textShadow: `0 0 14px ${color}66`,
          }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full md:h-2 md:w-2" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          {speakerName(who)}
        </div>
      )}
      <div className="textbox-glass relative min-h-[80px] w-full rounded-xl px-3 py-3 md:min-h-[148px] md:rounded-2xl md:px-10 md:py-6">
        <p
          className={`text-sm leading-relaxed tracking-wide md:text-xl md:leading-loose ${
            isNarr ? 'text-[#b8bce0]' : 'text-[#f0eeff]'
          } ${isBailu ? 'bailu-text' : ''}`}
          style={isBailu ? { color: '#b5f1ff', textShadow: '0 0 12px rgba(79,216,232,0.4)' } : undefined}
        >
          {display}
          {!done && <span className="type-caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-[#7adce8]" />}
        </p>
        {done && (
          <div className="breathe absolute bottom-2 right-3 text-[10px] text-[#7adce8] md:bottom-3 md:right-5 md:text-sm">▼</div>
        )}
      </div>
    </div>
  )
}
