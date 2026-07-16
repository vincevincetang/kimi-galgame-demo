import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConfigData, GameState, SaveData } from '@/game/types'
import { CHARACTERS, ENDINGS } from '@/game/types'
import Background from './Background'
import Sprite from './Sprite'
import Textbox from './Textbox'
import ChoiceMenu from './ChoiceMenu'
import EndingScreen from './EndingScreen'
import { BacklogPanel, ConfigPanel, SaveLoadPanel } from './Panels'
import { audio } from '@/game/audio'

interface Props {
  state: GameState
  config: ConfigData
  onConfigChange: (c: ConfigData) => void
  onAdvance: () => void
  onChoose: (opt: Parameters<typeof ChoiceMenu>[0]['options'][number]) => void
  onSave: (slot: number) => boolean
  onLoad: (s: SaveData) => void
  onQuit: () => void
}

type PanelKind = 'save' | 'load' | 'backlog' | 'config' | null

const POS_STYLE: Record<string, string> = {
  left: 'left-[4%] md:left-[12%]',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-[4%] md:right-[12%]',
}

export default function GameScreen({
  state,
  config,
  onConfigChange,
  onAdvance,
  onChoose,
  onSave,
  onLoad,
  onQuit,
}: Props) {
  const [typing, setTyping] = useState(true)
  const [panel, setPanel] = useState<PanelKind>(null)
  const [auto, setAuto] = useState(false)
  const [skip, setSkip] = useState(false)
  const [chapterToast, setChapterToast] = useState<string | null>(null)
  const [affToast, setAffToast] = useState<string | null>(null)
  const prevChapter = useRef(state.chapter)
  const prevAffN = useRef(state.affFxN)
  const prevBg = useRef(state.bg)

  const pending = state.pending
  const isSay = pending?.kind === 'say'
  const isChoice = pending?.kind === 'choice'
  const isEnding = pending?.kind === 'ending'

  // BGM 切换
  useEffect(() => {
    audio.play(state.bgm)
  }, [state.bgm])

  // 章节提示 + 自动存档
  useEffect(() => {
    if (state.chapter !== prevChapter.current) {
      prevChapter.current = state.chapter
      setChapterToast(state.chapter)
      const t = setTimeout(() => setChapterToast(null), 3200)
      onSave(0)
      return () => clearTimeout(t)
    }
  }, [state.chapter, onSave])

  // 好感度提示
  useEffect(() => {
    if (state.affFxN !== prevAffN.current) {
      prevAffN.current = state.affFxN
      if (state.affFx) {
        const c = CHARACTERS[state.affFx.char]
        setAffToast(`${c.name} 好感度 +${state.affFx.delta}`)
        const t = setTimeout(() => setAffToast(null), 2600)
        return () => clearTimeout(t)
      }
    }
  }, [state.affFxN, state.affFx])

  // 新台词出现时重置打字状态
  useEffect(() => {
    if (isSay) setTyping(true)
  }, [state.pc, isSay])

  // 自动播放
  useEffect(() => {
    if (!auto || !isSay || typing || panel) return
    const t = setTimeout(onAdvance, config.autoDelay)
    return () => clearTimeout(t)
  }, [auto, isSay, typing, panel, state.pc, config.autoDelay, onAdvance])

  // 跳过模式
  useEffect(() => {
    if (!skip || panel) return
    if (!isSay) {
      setSkip(false)
      return
    }
    const t = setInterval(() => {
      setTyping(false)
      onAdvance()
    }, 90)
    return () => clearInterval(t)
  }, [skip, isSay, panel, onAdvance])

  // 阻塞在选项/结局时停掉自动与跳过
  useEffect(() => {
    if (!isSay) {
      setAuto(false)
      setSkip(false)
    }
  }, [isSay, state.pc])

  const advanceOrComplete = useCallback(() => {
    if (panel || isChoice || isEnding) return
    if (!isSay) return
    if (typing) {
      setTyping(false)
    } else {
      onAdvance()
    }
  }, [panel, isChoice, isEnding, isSay, typing, onAdvance])

  // 键盘
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        advanceOrComplete()
      }
      if (e.code === 'Escape') setPanel(null)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [advanceOrComplete])

  const speaking = isSay && pending.who !== 'narrator' && pending.who !== 'player' ? pending.who : null
  const bgChanged = state.bg !== prevBg.current
  if (bgChanged) prevBg.current = state.bg

  const endingMeta = isEnding ? ENDINGS.find((e) => e.id === (pending as { id: string }).id) : null

  const hudBtn = (label: string, onClick: () => void, active = false, disabled = false) => (
    <button
      key={label}
      disabled={disabled}
      onClick={onClick}
      className={`hud-btn rounded-lg px-2.5 py-1 text-[11px] tracking-widest text-[#b8bce0] md:text-xs ${
        active ? 'hud-active' : ''
      } ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
    >
      {label}
    </button>
  )

  return (
    <div className="game-root grain vignette relative h-full w-full overflow-hidden bg-black">
      {/* 背景（带切换动画） */}
      <div key={state.bg} className="scene-enter absolute inset-0">
        <Background bg={state.bg} />
      </div>

      {/* 立绘层 */}
      <div className="absolute inset-0" onClick={advanceOrComplete}>
        {state.chars.map((c) => {
          const isSpeaking = speaking === c.char
          const dim = speaking ? !isSpeaking : pending !== null && pending.kind === 'say'
          return (
            <div
              key={c.char}
              className={`sprite-enter absolute bottom-0 h-[68vh] w-[52vw] max-w-[430px] min-w-[240px] transition-all duration-500 md:w-[30vw] ${
                POS_STYLE[c.pos]
              } ${c.char === 'bailu' ? 'sprite-glitch' : ''}`}
              style={{
                zIndex: isSpeaking ? 12 : 10,
                filter: dim ? 'brightness(0.5) saturate(0.75)' : 'brightness(1)',
                transform: c.pos === 'center' ? 'translateX(-50%)' : undefined,
              }}
            >
              <div className={isSpeaking ? 'h-full w-full' : 'h-full w-full'} style={{ animation: isSpeaking ? 'spriteBob 3.2s ease-in-out infinite' : undefined }}>
                <Sprite char={c.char} expr={c.expr} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 顶部 HUD */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-3 py-2 md:px-5">
        <div className="rounded-lg bg-black/30 px-3 py-1 text-[10px] tracking-[0.3em] text-[#8b93ff] backdrop-blur-sm md:text-xs">
          {state.chapter}
        </div>
        <div className="flex items-center gap-0.5 rounded-xl bg-black/35 px-2 py-1 backdrop-blur-sm md:gap-1">
          {hudBtn('存档', () => setPanel('save'), false, isEnding)}
          {hudBtn('读档', () => setPanel('load'))}
          {hudBtn('回想', () => setPanel('backlog'))}
          {hudBtn('自动', () => { setAuto(!auto); setSkip(false) }, auto, !isSay && !auto)}
          {hudBtn('跳过', () => { setSkip(!skip); setAuto(false) }, skip, !isSay && !skip)}
          {hudBtn('设置', () => setPanel('config'))}
          {hudBtn('标题', onQuit)}
        </div>
      </div>

      {/* 章节 Toast */}
      {chapterToast && (
        <div className="pointer-events-none absolute inset-x-0 top-[16%] z-30 flex justify-center">
          <div className="chapter-toast text-lg font-bold tracking-[0.5em] text-[#f0eeff] md:text-2xl" style={{ textShadow: '0 0 24px rgba(122,220,232,0.6)' }}>
            {chapterToast}
          </div>
        </div>
      )}

      {/* 好感度 Toast */}
      {affToast && (
        <div className="pointer-events-none absolute right-4 top-16 z-30 md:right-8">
          <div className="toast-anim rounded-xl border border-[#ff8ab8]/40 bg-[#2a1430]/85 px-4 py-2 text-xs tracking-widest text-[#ffb8d0] backdrop-blur-sm">
            ♥ {affToast}
          </div>
        </div>
      )}

      {/* 自动/跳过指示 */}
      {(auto || skip) && (
        <div className="absolute left-4 top-16 z-30 rounded-lg bg-black/45 px-3 py-1 text-[10px] tracking-[0.3em] text-[#ffd86b] backdrop-blur-sm">
          {skip ? '▶▶ SKIP' : '▶ AUTO'}
        </div>
      )}

      {/* 对话框 */}
      {isSay && pending.kind === 'say' && (
        <Textbox
          who={pending.who}
          text={pending.text}
          textSpeed={skip ? 8 : config.textSpeed}
          typing={typing}
          onComplete={() => setTyping(false)}
          onAdvance={onAdvance}
        />
      )}

      {/* 选择支 */}
      {isChoice && pending.kind === 'choice' && (
        <ChoiceMenu options={pending.options} state={state} onChoose={onChoose} />
      )}

      {/* 结局 */}
      {endingMeta && (
        <EndingScreen meta={endingMeta} onToTitle={onQuit} onLoad={() => setPanel('load')} />
      )}

      {/* 面板 */}
      {panel === 'save' && (
        <SaveLoadPanel mode="save" canSave={!isEnding} onSave={onSave} onLoad={onLoad} onClose={() => setPanel(null)} />
      )}
      {panel === 'load' && (
        <SaveLoadPanel mode="load" canSave={false} onLoad={onLoad} onClose={() => setPanel(null)} />
      )}
      {panel === 'backlog' && <BacklogPanel backlog={state.backlog} onClose={() => setPanel(null)} />}
      {panel === 'config' && <ConfigPanel config={config} onChange={onConfigChange} onClose={() => setPanel(null)} />}
    </div>
  )
}
