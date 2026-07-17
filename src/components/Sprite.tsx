import type { CharId, Expr } from '@/game/types'

import wanqing_neutral from '@/assets/sprites/wanqing_neutral.png'
import wanqing_smile from '@/assets/sprites/wanqing_smile.png'
import wanqing_sad from '@/assets/sprites/wanqing_sad.png'
import wanqing_angry from '@/assets/sprites/wanqing_angry.png'
import wanqing_surprise from '@/assets/sprites/wanqing_surprise.png'
import wanqing_blush from '@/assets/sprites/wanqing_blush.png'

import xingmian_neutral from '@/assets/sprites/xingmian_neutral.png'
import xingmian_smile from '@/assets/sprites/xingmian_smile.png'
import xingmian_sad from '@/assets/sprites/xingmian_sad.png'
import xingmian_angry from '@/assets/sprites/xingmian_angry.png'
import xingmian_surprise from '@/assets/sprites/xingmian_surprise.png'
import xingmian_blush from '@/assets/sprites/xingmian_blush.png'

import bailu_neutral from '@/assets/sprites/bailu_neutral.png'
import bailu_smile from '@/assets/sprites/bailu_smile.png'
import bailu_sad from '@/assets/sprites/bailu_sad.png'
import bailu_angry from '@/assets/sprites/bailu_angry.png'
import bailu_surprise from '@/assets/sprites/bailu_surprise.png'
import bailu_blush from '@/assets/sprites/bailu_blush.png'

// 立绘素材来源：Blue Archive 社区素材（替换自 Bilibili 差分/立绘分享）
const SPRITES: Record<CharId, Record<Expr, string>> = {
  wanqing: {
    neutral: wanqing_neutral,
    smile: wanqing_smile,
    sad: wanqing_sad,
    angry: wanqing_angry,
    surprise: wanqing_surprise,
    blush: wanqing_blush,
  },
  xingmian: {
    neutral: xingmian_neutral,
    smile: xingmian_smile,
    sad: xingmian_sad,
    angry: xingmian_angry,
    surprise: xingmian_surprise,
    blush: xingmian_blush,
  },
  bailu: {
    neutral: bailu_neutral,
    smile: bailu_smile,
    sad: bailu_sad,
    angry: bailu_angry,
    surprise: bailu_surprise,
    blush: bailu_blush,
  },
}

export default function Sprite({ char, expr }: { char: CharId; expr: Expr }) {
  return (
    <div className="h-full w-full overflow-hidden drop-shadow-[0_10px_36px_rgba(0,0,0,0.5)]">
      <img
        key={expr}
        src={SPRITES[char][expr] ?? SPRITES[char].neutral}
        alt={char}
        draggable={false}
        className="fade-enter-fast mx-auto block h-[167%] w-auto max-w-none"
      />
    </div>
  )
}
