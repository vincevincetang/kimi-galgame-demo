import type { CharId, Expr } from '@/game/types'

import wanqing_neutral from '@/assets/sprites/wanqing_neutral.webp'
import wanqing_smile from '@/assets/sprites/wanqing_smile.webp'
import wanqing_sad from '@/assets/sprites/wanqing_sad.webp'
import wanqing_angry from '@/assets/sprites/wanqing_angry.webp'
import wanqing_surprise from '@/assets/sprites/wanqing_surprise.webp'
import wanqing_blush from '@/assets/sprites/wanqing_blush.webp'

import xingmian_neutral from '@/assets/sprites/xingmian_neutral.webp'
import xingmian_smile from '@/assets/sprites/xingmian_smile.webp'
import xingmian_sad from '@/assets/sprites/xingmian_sad.webp'
import xingmian_angry from '@/assets/sprites/xingmian_angry.webp'
import xingmian_surprise from '@/assets/sprites/xingmian_surprise.webp'
import xingmian_blush from '@/assets/sprites/xingmian_blush.webp'

import bailu_neutral from '@/assets/sprites/bailu_neutral.webp'
import bailu_smile from '@/assets/sprites/bailu_smile.webp'
import bailu_sad from '@/assets/sprites/bailu_sad.webp'
import bailu_angry from '@/assets/sprites/bailu_angry.webp'
import bailu_surprise from '@/assets/sprites/bailu_surprise.webp'
import bailu_blush from '@/assets/sprites/bailu_blush.webp'

// 立绘素材来源：OpenGameArt 社区 CC0 公开素材（hue-shift 改色处理）
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
    <img
      key={expr}
      src={SPRITES[char][expr] ?? SPRITES[char].neutral}
      alt={char}
      draggable={false}
      className="fade-enter-fast mx-auto block h-full w-auto max-w-full object-contain drop-shadow-[0_10px_36px_rgba(0,0,0,0.5)]"
    />
  )
}
