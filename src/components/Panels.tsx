import { useState } from 'react'
import type { BacklogItem, ConfigData, SaveData } from '@/game/types'
import { CHARACTERS, ENDINGS } from '@/game/types'
import { SLOT_COUNT, deleteSave, loadAllSaves, loadEndings } from '@/game/save'
import { speakerName } from './Textbox'
import { audio } from '@/game/audio'

function fmtTime(t: number) {
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// ==================== 存档 / 读档 ====================
export function SaveLoadPanel({
  mode,
  onSave,
  onLoad,
  onClose,
  canSave,
}: {
  mode: 'save' | 'load'
  onSave?: (slot: number) => void
  onLoad: (s: SaveData) => void
  onClose: () => void
  canSave: boolean
}) {
  const [saves, setSaves] = useState(loadAllSaves())
  const [confirmDel, setConfirmDel] = useState<number | null>(null)

  return (
    <PanelShell title={mode === 'save' ? '存档 SAVE' : '读档 LOAD'} onClose={onClose}>
      <div className="grid max-h-[52vh] grid-cols-2 gap-3 overflow-y-auto pr-1 nice-scroll md:grid-cols-3">
        {Array.from({ length: SLOT_COUNT + 1 }, (_, slot) => {
          const s = saves[slot]
          const isAuto = slot === 0
          return (
            <div
              key={slot}
              className={`group relative rounded-xl border p-3 transition-all ${
                s
                  ? 'border-[#4a5590] bg-[#1a1438]/80 hover:border-[#7adce8]/60'
                  : 'border-dashed border-[#3a3a5c] bg-[#120e28]/60'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-xs font-bold tracking-widest ${isAuto ? 'text-[#ffd86b]' : 'text-[#8b93ff]'}`}>
                  {isAuto ? 'AUTO' : `SLOT ${slot}`}
                </span>
                {s && (
                  <button
                    className="text-[10px] text-[#6a6a8c] opacity-0 transition-opacity hover:text-[#ff8a8a] group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirmDel === slot) {
                        deleteSave(slot)
                        setSaves(loadAllSaves())
                        setConfirmDel(null)
                      } else setConfirmDel(slot)
                    }}
                  >
                    {confirmDel === slot ? '确认?' : '✕'}
                  </button>
                )}
              </div>
              {s ? (
                <button
                  className="block w-full text-left"
                  onClick={() => {
                    if (mode === 'load') {
                      audio.ui('confirm')
                      onLoad(s)
                      onClose()
                    } else if (canSave && onSave) {
                      onSave(slot)
                      setSaves(loadAllSaves())
                      audio.ui('confirm')
                    }
                  }}
                >
                  <div className="truncate text-sm font-bold text-[#dcd8ff]">{s.chapter}</div>
                  <div className="mt-1 line-clamp-2 min-h-[2.4em] text-xs leading-relaxed text-[#9aa0c8]">
                    {s.preview || '……'}
                  </div>
                  <div className="mt-1.5 text-[10px] tracking-wider text-[#6a6a8c]">{fmtTime(s.time)}</div>
                </button>
              ) : (
                <button
                  className="flex h-[74px] w-full items-center justify-center text-xs tracking-widest text-[#55557a]"
                  disabled={mode === 'load' || (isAuto && true) || !canSave}
                  onClick={() => {
                    if (mode === 'save' && !isAuto && canSave && onSave) {
                      onSave(slot)
                      setSaves(loadAllSaves())
                      audio.ui('confirm')
                    }
                  }}
                >
                  {mode === 'save' && !isAuto ? '— 空存档位 —' : isAuto ? '自动存档' : 'EMPTY'}
                </button>
              )}
            </div>
          )
        })}
      </div>
      {mode === 'save' && !canSave && (
        <div className="mt-3 text-center text-xs text-[#ff9d8a]">结局播放中无法存档</div>
      )}
    </PanelShell>
  )
}

// ==================== 回想 ====================
export function BacklogPanel({ backlog, onClose }: { backlog: BacklogItem[]; onClose: () => void }) {
  return (
    <PanelShell title="回想 BACKLOG" onClose={onClose}>
      <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-2 nice-scroll">
        {backlog.length === 0 && <div className="py-8 text-center text-sm text-[#6a6a8c]">还没有对白记录</div>}
        {backlog.map((b, i) => {
          const name = speakerName(b.who)
          const color = b.who !== 'narrator' && b.who !== 'player' ? CHARACTERS[b.who].color : '#ffd86b'
          return (
            <div key={i} className="text-sm leading-relaxed">
              {name && (
                <span className="mr-2 font-bold" style={{ color }}>
                  {name}
                </span>
              )}
              <span className={b.who === 'narrator' ? 'text-[#9aa0c8]' : 'text-[#e0dcff]'}>{b.text}</span>
            </div>
          )
        })}
      </div>
    </PanelShell>
  )
}

// ==================== 设置 ====================
export function ConfigPanel({
  config,
  onChange,
  onClose,
}: {
  config: ConfigData
  onChange: (c: ConfigData) => void
  onClose: () => void
}) {
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-6 py-2.5">
      <span className="shrink-0 text-sm tracking-widest text-[#b8bce0]">{label}</span>
      <div className="flex flex-1 items-center justify-end gap-3">{children}</div>
    </div>
  )
  const Slider = ({ value, min, max, step, onInput }: { value: number; min: number; max: number; step: number; onInput: (v: number) => void }) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onInput(Number(e.target.value))}
      className="w-48 accent-[#7adce8]"
    />
  )
  return (
    <PanelShell title="设置 CONFIG" onClose={onClose} narrow>
      <Row label="文字速度">
        <span className="w-10 text-right text-xs text-[#8b93ff]">{config.textSpeed}ms</span>
        <Slider value={config.textSpeed} min={10} max={80} step={2} onInput={(v) => onChange({ ...config, textSpeed: v })} />
      </Row>
      <Row label="自动播放间隔">
        <span className="w-10 text-right text-xs text-[#8b93ff]">{(config.autoDelay / 1000).toFixed(1)}s</span>
        <Slider value={config.autoDelay} min={600} max={4000} step={100} onInput={(v) => onChange({ ...config, autoDelay: v })} />
      </Row>
      <Row label="音乐音量">
        <span className="w-10 text-right text-xs text-[#8b93ff]">{Math.round(config.bgmVolume * 100)}</span>
        <Slider value={config.bgmVolume} min={0} max={1} step={0.05} onInput={(v) => onChange({ ...config, bgmVolume: v })} />
      </Row>
      <Row label="音效音量">
        <span className="w-10 text-right text-xs text-[#8b93ff]">{Math.round(config.sfxVolume * 100)}</span>
        <Slider value={config.sfxVolume} min={0} max={1} step={0.05} onInput={(v) => onChange({ ...config, sfxVolume: v })} />
      </Row>
      <Row label="全部静音">
        <button
          onClick={() => onChange({ ...config, mute: !config.mute })}
          className={`h-6 w-12 rounded-full transition-colors ${config.mute ? 'bg-[#ff8a5c]' : 'bg-[#2c2c4c]'}`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              config.mute ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </Row>
    </PanelShell>
  )
}

// ==================== 结局图鉴 ====================
export function GalleryPanel({ onClose }: { onClose: () => void }) {
  const unlocked = loadEndings()
  return (
    <PanelShell title={`结局图鉴 GALLERY  ${unlocked.length}/${ENDINGS.length}`} onClose={onClose} wide>
      <div className="grid max-h-[54vh] grid-cols-1 gap-3 overflow-y-auto pr-1 nice-scroll md:grid-cols-2">
        {ENDINGS.map((e) => {
          const has = unlocked.includes(e.id)
          return (
            <div
              key={e.id}
              className={`rounded-xl border p-4 ${
                has ? 'ending-card-unlocked border-[#4a5590] bg-[#1a1438]/80' : 'border-dashed border-[#3a3a5c] bg-[#120e28]/50'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-bold tracking-[0.3em]" style={{ color: has ? e.color : '#55557a' }}>
                  {e.no}
                </span>
                <span className="text-[10px] tracking-widest text-[#6a6a8c]">{has ? e.route : '?????'}</span>
              </div>
              <div className={`mt-1.5 text-lg font-bold tracking-widest ${has ? 'text-[#f0eeff]' : 'text-[#55557a]'}`}>
                {has ? e.title : '？？？'}
              </div>
              <div className="mt-1 text-xs leading-relaxed text-[#9aa0c8]">
                {has ? e.desc : `提示：${e.hint}`}
              </div>
            </div>
          )
        })}
      </div>
    </PanelShell>
  )
}

// ==================== 外壳 ====================
function PanelShell({
  title,
  children,
  onClose,
  wide,
  narrow,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
  narrow?: boolean
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm fade-enter-fast" onClick={onClose}>
      <div
        className={`panel-glass panel-enter w-full rounded-2xl p-5 md:p-6 ${
          wide ? 'max-w-3xl' : narrow ? 'max-w-md' : 'max-w-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-[0.3em] text-[#9ef3ff]">{title}</h2>
          <button onClick={() => { audio.ui('back'); onClose() }} className="hud-btn rounded-lg px-3 py-1 text-sm text-[#b8bce0]">
            ✕ 关闭
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
