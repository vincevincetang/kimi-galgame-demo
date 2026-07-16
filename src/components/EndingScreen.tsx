import type { EndingMeta } from '@/game/types'
import { audio } from '@/game/audio'
import { useEffect } from 'react'

interface Props {
  meta: EndingMeta
  onToTitle: () => void
  onLoad: () => void
}

export default function EndingScreen({ meta, onToTitle, onLoad }: Props) {
  useEffect(() => {
    audio.ui('unlock')
  }, [])

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 px-6 backdrop-blur-[3px] fade-enter">
      <div className="text-[11px] font-bold tracking-[0.5em]" style={{ color: meta.color }}>
        {meta.no} · {meta.route}
      </div>
      <h1
        className="ending-title mt-4 text-4xl font-bold text-[#f5f2ff] md:text-6xl"
        style={{ textShadow: `0 0 30px ${meta.color}88, 0 0 80px ${meta.color}44` }}
      >
        {meta.title}
      </h1>
      <p className="mt-6 max-w-md text-center text-sm leading-loose tracking-wide text-[#c8ccea] md:text-base">
        {meta.desc}
      </p>
      <div className="mt-4 flex items-center gap-2 text-[10px] tracking-[0.4em] text-[#8b93ff]">
        <span className="inline-block h-px w-10 bg-[#8b93ff]/50" />
        ENDING 已收录图鉴
        <span className="inline-block h-px w-10 bg-[#8b93ff]/50" />
      </div>
      <div className="mt-10 flex gap-4">
        <button
          onClick={() => { audio.ui('confirm'); onLoad() }}
          className="choice-card rounded-xl px-6 py-3 text-sm tracking-widest text-[#dcd8ff]"
        >
          读取存档
        </button>
        <button
          onClick={() => { audio.ui('confirm'); onToTitle() }}
          className="rounded-xl border border-[#7adce8]/50 px-6 py-3 text-sm tracking-widest text-[#9ef3ff] transition-all hover:bg-[#7adce8]/10 hover:shadow-[0_0_24px_rgba(122,220,232,0.25)]"
        >
          回到标题
        </button>
      </div>
    </div>
  )
}
