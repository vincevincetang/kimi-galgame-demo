import { useMemo } from 'react'
import type { BgId } from '@/game/types'

// ============ 程序化场景背景（渐变 + SVG + CSS 动画，无外部图片） ============

function Stars({ n = 90, seed = 7 }: { n?: number; seed?: number }) {
  const stars = useMemo(() => {
    let s = seed
    const rnd = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    return Array.from({ length: n }, (_, i) => ({
      x: rnd() * 100,
      y: rnd() * 62,
      r: rnd() * 1.6 + 0.5,
      d: rnd() * 5,
      big: i % 17 === 0,
    }))
  }, [n, seed])
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.big ? s.r + 1 : s.r}
          fill="#fff"
          className="star-twinkle"
          style={{ animationDelay: `${s.d}s` }}
        />
      ))}
    </svg>
  )
}

function Sea({ color1, color2, lineColor }: { color1: string; color2: string; lineColor: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[38%]">
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${color1}, ${color2})` }} />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M -50 ${30 + i * 45} Q 150 ${18 + i * 45} 350 ${30 + i * 45} T 750 ${30 + i * 45} T 1150 ${30 + i * 45}`}
            stroke={lineColor}
            strokeWidth={2.5 - i * 0.3}
            fill="none"
            opacity={0.5 - i * 0.06}
            className="wave-drift"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
      </svg>
    </div>
  )
}

function Skyline({ color, windows }: { color: string; windows: string }) {
  const buildings = useMemo(() => {
    let s = 13
    const rnd = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    const arr: { x: number; w: number; h: number; wins: { wx: number; wy: number }[] }[] = []
    let x = -2
    while (x < 102) {
      const w = 5 + rnd() * 8
      const h = 12 + rnd() * 26
      const wins = Array.from({ length: Math.floor(h / 4) }, () => ({ wx: rnd() * 80 + 10, wy: rnd() * 80 + 10 }))
      arr.push({ x, w, h, wins })
      x += w + 0.5
    }
    return arr
  }, [])
  return (
    <svg className="absolute inset-x-0 bottom-0 h-[46%] w-full" viewBox="0 0 100 46" preserveAspectRatio="none">
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={46 - b.h} width={b.w} height={b.h} fill={color} />
          {b.wins.map((w, j) => (
            <rect
              key={j}
              x={b.x + (w.wx / 100) * b.w}
              y={46 - b.h + (w.wy / 100) * b.h}
              width={0.45}
              height={0.7}
              fill={windows}
              className="window-flicker"
              style={{ animationDelay: `${(i * 7 + j * 13) % 9}s` }}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

function RadioWaves({ color, cx, cy }: { color: string; cx: string; cy: string }) {
  return (
    <div className="absolute" style={{ left: cx, top: cy }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="radio-ring absolute rounded-full border"
          style={{ borderColor: color, animationDelay: `${i * 1.6}s` }}
        />
      ))}
    </div>
  )
}

function Fireworks() {
  const bursts = useMemo(
    () => [
      { x: '22%', y: '24%', c: '#ff8ab8', d: 0 },
      { x: '68%', y: '18%', c: '#ffd86b', d: 1.4 },
      { x: '48%', y: '32%', c: '#7adce8', d: 2.8 },
      { x: '84%', y: '30%', c: '#c3a6ff', d: 4.2 },
      { x: '12%', y: '38%', c: '#ffb08a', d: 5.4 },
    ],
    [],
  )
  return (
    <>
      {bursts.map((b, i) => (
        <div key={i} className="firework absolute" style={{ left: b.x, top: b.y, animationDelay: `${b.d}s` }}>
          {Array.from({ length: 12 }).map((_, j) => (
            <div
              key={j}
              className="firework-dot absolute rounded-full"
              style={{
                background: b.c,
                boxShadow: `0 0 6px ${b.c}`,
                ['--r' as string]: `${j * 30}deg`,
              }}
            />
          ))}
        </div>
      ))}
    </>
  )
}

function Rain() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="rain-layer" />
      <div className="rain-layer rain-layer-2" />
    </div>
  )
}

export default function Background({ bg }: { bg: BgId }) {
  switch (bg) {
    case 'black':
      return <div className="absolute inset-0 bg-black" />

    case 'title':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0b0620 0%, #231245 38%, #5c2a6e 62%, #c65d7b 82%, #1a1030 82.2%, #0a0618 100%)' }}>
          <Stars n={130} />
          {/* 月亮 */}
          <div className="absolute right-[16%] top-[14%] h-24 w-24 rounded-full" style={{ background: 'radial-gradient(circle at 38% 35%, #fff8e8, #ffe9b8 60%, #e8c88a)', boxShadow: '0 0 60px 18px rgba(255,240,200,0.25)' }} />
          {/* 海 */}
          <div className="absolute inset-x-0 bottom-0 h-[18%]" style={{ background: 'linear-gradient(180deg, #2a1850, #120a28)' }}>
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, #ff9db8, transparent)' }} />
          </div>
          {/* 灯塔 */}
          <svg className="absolute bottom-[16%] left-[10%] h-[42%]" viewBox="0 0 60 120">
            <path d="M 22 120 L 26 30 L 34 30 L 38 120 Z" fill="#150b2e" />
            <rect x="24" y="18" width="12" height="12" fill="#150b2e" />
            <circle cx="30" cy="24" r="4" fill="#ffe9b8" className="beacon" />
            <path d="M 30 24 L 120 10 L 120 38 Z" fill="rgba(255,233,184,0.13)" className="beacon-beam" />
          </svg>
          <RadioWaves color="rgba(122,220,232,0.5)" cx="78%" cy="70%" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, transparent 40%, rgba(5,2,15,0.55))' }} />
        </div>
      )

    case 'cafe_day':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #f7e3c4 0%, #efd3a8 55%, #d9b183 100%)' }}>
          {/* 大窗户（海景） */}
          <div className="absolute left-[8%] top-[10%] h-[52%] w-[38%] overflow-hidden rounded-t-[120px] border-8 border-[#8a5a34] shadow-2xl">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #9fd8f0 0%, #cdeefb 55%, #7ec8e8 55.5%, #4fa8d8 100%)' }} />
            <div className="absolute left-[30%] top-[18%] h-10 w-10 rounded-full bg-[#fff8e0]" style={{ boxShadow: '0 0 30px 10px rgba(255,250,220,0.8)' }} />
            <svg className="absolute inset-x-0 bottom-0 h-[45%] w-full" viewBox="0 0 100 45" preserveAspectRatio="none">
              <path d="M 0 10 Q 25 6 50 10 T 100 10" stroke="#fff" strokeWidth="1" fill="none" opacity="0.6" className="wave-drift" />
              <path d="M 0 24 Q 25 20 50 24 T 100 24" stroke="#fff" strokeWidth="1" fill="none" opacity="0.4" className="wave-drift" style={{ animationDelay: '1.2s' }} />
            </svg>
            <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-[#8a5a34]" />
          </div>
          {/* 吊灯 */}
          {[62, 78, 92].map((x) => (
            <div key={x} className="absolute top-0" style={{ left: `${x}%` }}>
              <div className="mx-auto h-16 w-0.5 bg-[#6b4423]" />
              <div className="h-5 w-10 -translate-x-1/2 rounded-b-full bg-[#6b4423]" style={{ marginLeft: '1px', transform: 'translateX(-40%)' }} />
              <div className="lamp-glow -mt-1 h-6 w-6 -translate-x-1/2 rounded-full" style={{ marginLeft: '1px', transform: 'translateX(-30%)' }} />
            </div>
          ))}
          {/* 吧台 */}
          <div className="absolute bottom-0 right-0 h-[30%] w-[55%] rounded-tl-3xl" style={{ background: 'linear-gradient(180deg, #a06a3c, #7a4c26)' }}>
            <div className="h-3 w-full rounded-tl-3xl bg-[#c89058]" />
          </div>
          {/* 地板 */}
          <div className="absolute bottom-0 h-[14%] w-full" style={{ background: 'linear-gradient(180deg, #b98a5c, #96683e)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,250,230,0.35), transparent 60%)' }} />
        </div>
      )

    case 'cafe_night':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #241430 0%, #38203c 55%, #2c1830 100%)' }}>
          <div className="absolute left-[8%] top-[10%] h-[52%] w-[38%] overflow-hidden rounded-t-[120px] border-8 border-[#5a3a28] shadow-2xl">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0c1030 0%, #232a55 55%, #141a3d 55.5%, #0c1230 100%)' }} />
            <Stars n={24} seed={3} />
            <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-[#5a3a28]" />
          </div>
          {[62, 78, 92].map((x) => (
            <div key={x} className="absolute top-0" style={{ left: `${x}%` }}>
              <div className="mx-auto h-16 w-0.5 bg-[#4a3020]" />
              <div className="h-5 w-10 rounded-b-full bg-[#4a3020]" style={{ marginLeft: '1px', transform: 'translateX(-40%)' }} />
              <div className="lamp-glow -mt-1 h-6 w-6 rounded-full" style={{ marginLeft: '1px', transform: 'translateX(-30%)' }} />
            </div>
          ))}
          <div className="absolute bottom-0 right-0 h-[30%] w-[55%] rounded-tl-3xl" style={{ background: 'linear-gradient(180deg, #5c3a28, #3c2418)' }}>
            <div className="h-3 w-full rounded-tl-3xl bg-[#8a5a38]" />
          </div>
          <div className="absolute bottom-0 h-[14%] w-full" style={{ background: 'linear-gradient(180deg, #4a2e20, #2e1a12)' }} />
          {/* 收音机光点 */}
          <div className="absolute bottom-[31%] right-[18%]">
            <div className="h-2.5 w-2.5 rounded-full bg-[#7adce8]" style={{ boxShadow: '0 0 12px 3px rgba(122,220,232,0.8)' }} />
          </div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 75% 30%, rgba(255,200,120,0.14), transparent 55%)' }} />
        </div>
      )

    case 'beach_dusk':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #3d2a68 0%, #a04a7c 38%, #ff9d6b 62%, #ffd89b 74%, #3d2a55 74.3%, #241840 100%)' }}>
          <Stars n={40} seed={5} />
          {/* 落日 */}
          <div className="absolute left-1/2 top-[52%] h-28 w-28 -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(circle, #fff3d0, #ffb86b 70%)', boxShadow: '0 0 80px 30px rgba(255,170,100,0.45)' }} />
          <Sea color1="rgba(255,180,120,0.35)" color2="#241840" lineColor="rgba(255,220,180,0.7)" />
          {/* 海平线光 */}
          <div className="absolute inset-x-0 top-[73.5%] h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #ffe9c0, transparent)' }} />
          {/* 防波堤 */}
          <div className="absolute bottom-[8%] left-0 h-[9%] w-[34%] rounded-r-lg bg-[#1c1233]" />
          <div className="absolute bottom-0 h-[8%] w-full bg-[#150d28]" />
        </div>
      )

    case 'rooftop_night':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #05081c 0%, #101a45 45%, #27305e 70%, #0a0e28 100%)' }}>
          <Stars n={160} seed={11} />
          {/* 流星 */}
          <div className="shooting-star" />
          <div className="shooting-star shooting-star-2" />
          {/* 银河带 */}
          <div className="absolute -left-[10%] top-0 h-[70%] w-[130%] rotate-[18deg] opacity-40" style={{ background: 'radial-gradient(ellipse at center, rgba(160,170,255,0.18), transparent 55%)' }} />
          <Skyline color="#0a0e24" windows="#ffd86b" />
          {/* 天线 */}
          <svg className="absolute bottom-[30%] right-[14%] h-[38%]" viewBox="0 0 60 140">
            <path d="M 28 140 L 28 20 L 32 20 L 32 140 Z" fill="#1a2145" />
            <path d="M 10 40 L 50 40 M 14 60 L 46 60 M 18 80 L 42 80" stroke="#1a2145" strokeWidth="3" />
            <circle cx="30" cy="16" r="4" fill="#ff6b8a" className="beacon" />
          </svg>
          <RadioWaves color="rgba(139,147,255,0.45)" cx="85%" cy="32%" />
          <div className="absolute bottom-0 h-[16%] w-full" style={{ background: 'linear-gradient(180deg, #181f45, #0c1130)' }} />
        </div>
      )

    case 'street_neon':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0d0a26 0%, #1d1445 40%, #2c1a52 65%, #120c30 100%)' }}>
          <Stars n={50} seed={9} />
          {/* 建筑剪影 */}
          <div className="absolute bottom-[18%] left-0 h-[55%] w-[30%] bg-[#0a0720]" />
          <div className="absolute bottom-[18%] right-0 h-[62%] w-[32%] bg-[#0a0720]" />
          <div className="absolute bottom-[18%] left-[28%] h-[40%] w-[16%] bg-[#0d0a28]" />
          {/* 霓虹招牌 */}
          <div className="neon-sign absolute left-[6%] top-[30%] rounded-lg border-2 border-[#ff5ca8] px-3 py-2 text-lg font-bold tracking-widest text-[#ff8ac4]" style={{ textShadow: '0 0 12px #ff5ca8' }}>喫茶</div>
          <div className="neon-sign absolute right-[8%] top-[24%] rounded-lg border-2 border-[#4fd8e8] px-3 py-2 text-lg font-bold tracking-widest text-[#9ef3ff] neon-delay-1" style={{ textShadow: '0 0 12px #4fd8e8' }}>ラジオ</div>
          <div className="neon-sign absolute right-[14%] top-[46%] rounded-lg border-2 border-[#c3a6ff] px-3 py-2 text-lg font-bold tracking-widest text-[#dcc8ff] neon-delay-2" style={{ textShadow: '0 0 12px #c3a6ff' }}>夜市</div>
          {/* 街道与反光 */}
          <div className="absolute bottom-0 h-[18%] w-full" style={{ background: 'linear-gradient(180deg, #191040, #0a0620)' }}>
            <div className="mx-auto h-full w-[40%] opacity-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,92,168,0.18), rgba(79,216,232,0.18), transparent)' }} />
          </div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(8,5,25,0.5))' }} />
        </div>
      )

    case 'radio_room':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #150a2e 0%, #251343 50%, #1a0d33 100%)' }}>
          {/* 设备墙 */}
          <div className="absolute bottom-[22%] left-[6%] h-[40%] w-[88%] rounded-t-2xl bg-[#0e0722] shadow-2xl">
            {/* 设备灯点 */}
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="equip-light absolute h-1.5 w-1.5 rounded-full"
                style={{
                  left: `${6 + (i % 12) * 7.5}%`,
                  top: `${15 + Math.floor(i / 12) * 28}%`,
                  background: ['#ff6b8a', '#7adce8', '#ffd86b'][i % 3],
                  animationDelay: `${(i * 0.37) % 3}s`,
                }}
              />
            ))}
            {/* 波形屏 */}
            <svg className="absolute left-[30%] top-[12%] h-[34%] w-[40%]" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M 0 15 Q 8 2 16 15 T 32 15 T 48 15 T 64 15 T 80 15 T 96 15" stroke="#7adce8" strokeWidth="1.4" fill="none" className="wave-drift" opacity="0.9" />
            </svg>
          </div>
          {/* 桌面 */}
          <div className="absolute bottom-0 h-[22%] w-full" style={{ background: 'linear-gradient(180deg, #2c1a4a, #170c2e)' }} />
          {/* 悬浮尘埃 */}
          <Stars n={26} seed={21} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(122,220,232,0.08), transparent 55%)' }} />
        </div>
      )

    case 'festival':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #08061e 0%, #1c1245 45%, #3a2060 68%, #0c0824 100%)' }}>
          <Stars n={70} seed={17} />
          <Fireworks />
          <Sea color1="rgba(120,80,180,0.3)" color2="#0c0824" lineColor="rgba(200,170,255,0.5)" />
          {/* 海面烟火倒影 */}
          <div className="absolute inset-x-0 bottom-0 h-[38%] opacity-40" style={{ background: 'linear-gradient(180deg, rgba(255,138,184,0.12), transparent 60%)' }} />
        </div>
      )

    case 'rain_window':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a1226 0%, #14233d 50%, #0c1626 100%)' }}>
          <div className="absolute left-1/2 top-[8%] h-[72%] w-[70%] -translate-x-1/2 overflow-hidden rounded-lg border-[10px] border-[#1c2a42]">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #101c38, #1a2c50)' }} />
            <Stars n={14} seed={31} />
            <Rain />
            {/* 玻璃雨痕 */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(100deg, transparent 0 18px, rgba(180,210,255,0.06) 18px 20px)' }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[20%]" style={{ background: 'linear-gradient(180deg, #0c1626, #060a14)' }} />
          {/* 屋内暖光 */}
          <div className="absolute bottom-[20%] left-[10%] h-16 w-16 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(255,200,120,0.35), transparent 70%)' }} />
        </div>
      )

    case 'dawn_beach':
      return (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #8fb8e8 0%, #f0c8d8 35%, #ffd8a8 58%, #fff0d0 68%, #5a8fc4 68.3%, #2c5a8c 100%)' }}>
          {/* 朝阳 */}
          <div className="absolute left-[30%] top-[48%] h-24 w-24 rounded-full" style={{ background: 'radial-gradient(circle, #fff8e0, #ffd88a 70%)', boxShadow: '0 0 90px 36px rgba(255,220,150,0.5)' }} />
          <Sea color1="rgba(255,230,180,0.4)" color2="#2c5a8c" lineColor="rgba(255,250,230,0.8)" />
          <div className="absolute inset-x-0 top-[67.5%] h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #fff5d8, transparent)' }} />
          {/* 飞鸟 */}
          <svg className="absolute left-[58%] top-[30%] h-12 w-24 opacity-70" viewBox="0 0 100 40">
            <path d="M 10 20 Q 18 10 26 20 Q 34 10 42 20" stroke="#3a5a7c" strokeWidth="2.5" fill="none" className="wave-drift" />
            <path d="M 55 12 Q 62 4 69 12 Q 76 4 83 12" stroke="#3a5a7c" strokeWidth="2" fill="none" className="wave-drift" style={{ animationDelay: '0.7s' }} />
          </svg>
          <div className="absolute bottom-0 h-[10%] w-full bg-[#e8d0a8]" />
        </div>
      )

    default:
      return <div className="absolute inset-0 bg-black" />
  }
}
