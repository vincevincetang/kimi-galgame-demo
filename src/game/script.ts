import type { Cmd } from './types'
import { scriptCommon } from './scriptCommon'
import { scriptRoutes } from './scriptRoutes'

export const SCRIPT: Cmd[] = [...scriptCommon, ...scriptRoutes]

// label 名 -> 指令下标
export const LABELS: Record<string, number> = {}
SCRIPT.forEach((c, i) => {
  if (c.t === 'label') LABELS[c.name] = i
})

export function labelIndex(name: string): number {
  const i = LABELS[name]
  if (i === undefined) throw new Error(`label not found: ${name}`)
  return i
}
