import { useEffect, useState } from 'react'
import Background from './Background'
import { ConfigPanel, GalleryPanel, SaveLoadPanel } from './Panels'
import type { ConfigData, SaveData } from '@/game/types'
import { ENDINGS } from '@/game/types'
import { latestSave, loadEndings } from '@/game/save'
import { audio } from '@/game/audio'

interface Props {
  config: ConfigData
  onConfigChange: (c: ConfigData) => void
  onStart: () => void
  onContinue: (s: SaveData) => void
}

export default function TitleScreen({ config, onConfigChange, onStart, onContinue }: Props) {
  const [panel, setPanel] = useState<'load' | 'gallery' | 'config' | null>(null)
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [latest, setLatest] = useState<SaveData | null>(null)

  useEffect(() => {
    setUnlocked(loadEndings())
    setLatest(latestSave())
  }, [panel])

  // 首次交互解锁音频并播放标题曲
  useEffect(() => {
    const h = () => {
      audio.unlock()
      audio.play('title')
      window.removeEventListener('pointerdown', h)
    }
    window.addEventListener('pointerdown', h)
    return () => window.removeEventListener('pointerdown', h)
  }, [])

  const MenuItem = ({ label, sub, onClick, disabled }: { label: string; sub: string; onClick: () => void; disabled?: boolean }) => (
    <button
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        audio.ui('confirm')
        onClick()
      }}
      onMouseEnter={() => !disabled && audio.ui('hover')}
      className={`menu-btn text-left text-xl font-bold tracking-[0.2em] text-[#dcd8ff] md:text-2xl ${
        disabled ? 'cursor-not-allowed opacity-30' : ''
      }`}
    >
      {label}
      <span className="ml-3 align-middle text-[10px] font-normal tracking-[0.3em] text-[#6a72a8]">{sub}</span>
    </button>
  )

  return (
    <div className="game-root grain vignette relative h-full w-full overflow-hidden">
      <Background bg="title" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        {/* 标题 */}
        <div className="float-y flex flex-col items-center">
          <div className="text-[10px] font-bold tracking-[0.7em] text-[#7adce8] md:text-xs">
            FM 103.0 · 凌晨三点零三分
          </div>
          <h1 className="title-glow mt-4 text-5xl font-black tracking-[0.12em] text-[#f5f2ff] md:text-7xl">
            星港电波
          </h1>
          <div className="mt-3 text-xs tracking-[0.5em] text-[#c8a6d8] md:text-sm">
            — HOSHIKO RADIO —
          </div>
          <p className="mt-5 max-w-md text-center text-xs leading-relaxed tracking-wider text-[#9aa0c8] md:text-sm">
            一部关于电波、星空与告别的视觉小说
            <br />
            共通线 × 三位女主角 × 七种结局
          </p>
        </div>

        {/* 菜单 */}
        <div className="mt-12 flex flex-col gap-4 md:mt-14">
          <MenuItem label="开始游戏" sub="NEW GAME" onClick={onStart} />
          <MenuItem
            label="继续游戏"
            sub={latest ? 'CONTINUE' : 'NO SAVE'}
            disabled={!latest}
            onClick={() => latest && onContinue(latest)}
          />
          <MenuItem label="读取存档" sub="LOAD" onClick={() => setPanel('load')} />
          <MenuItem label="结局图鉴" sub={`${unlocked.length}/${ENDINGS.length}`} onClick={() => setPanel('gallery')} />
          <MenuItem label="系统设置" sub="CONFIG" onClick={() => setPanel('config')} />
        </div>

        {/* 底部 */}
        <div className="absolute bottom-5 flex w-full items-center justify-between px-6 text-[10px] tracking-[0.3em] text-[#55557a]">
          <span>ver 1.1 · DEMO · 立绘素材 OpenGameArt(CC0)</span>
          <span className="breathe text-[#7adce8]/70">建议使用键盘 空格 / 回车 游玩</span>
          <span>结局收集 {unlocked.length}/{ENDINGS.length}</span>
        </div>
      </div>

      {panel === 'load' && (
        <SaveLoadPanel
          mode="load"
          canSave={false}
          onLoad={(s) => {
            setPanel(null)
            onContinue(s)
          }}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === 'gallery' && <GalleryPanel onClose={() => setPanel(null)} />}
      {panel === 'config' && <ConfigPanel config={config} onChange={onConfigChange} onClose={() => setPanel(null)} />}
    </div>
  )
}
