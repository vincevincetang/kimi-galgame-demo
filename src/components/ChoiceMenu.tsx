import type { ChoiceOpt, GameState } from '@/game/types'
import { audio } from '@/game/audio'

interface Props {
  options: ChoiceOpt[]
  state: GameState
  onChoose: (opt: ChoiceOpt) => void
}

export function optAvailable(opt: ChoiceOpt, s: GameState): boolean {
  if (opt.reqFlags && !opt.reqFlags.every((f) => s.flags.includes(f))) return false
  if (opt.reqAff && s.affection[opt.reqAff.char] < opt.reqAff.min) return false
  return true
}

export default function ChoiceMenu({ options, state, onChoose }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/45 px-6 backdrop-blur-[2px]">
      {options.map((opt, i) => {
        const ok = optAvailable(opt, state)
        return (
          <button
            key={i}
            disabled={!ok}
            onClick={() => ok && onChoose(opt)}
            onMouseEnter={() => ok && audio.ui('hover')}
            className={`choice-card choice-enter w-full max-w-xl rounded-2xl px-8 py-4 text-left md:py-5 ${
              ok ? '' : 'choice-locked'
            }`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg md:text-xl ${ok ? 'text-[#f0eeff]' : 'text-[#8a8aa8]'}`}>
                {opt.text}
              </span>
              {!ok && <span className="text-xs tracking-widest text-[#8a8aa8]">◇ 未满足条件</span>}
            </div>
            {opt.sub && (
              <div className="mt-1 text-xs tracking-wide text-[#9aa0c8] md:text-sm">{opt.sub}</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
