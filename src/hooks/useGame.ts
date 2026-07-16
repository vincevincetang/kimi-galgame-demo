import { useCallback, useRef, useState } from 'react'
import { SCRIPT, labelIndex } from '@/game/script'
import type {
  ChoiceOpt,
  DispatchRule,
  GameState,
  SaveData,
} from '@/game/types'
import { markSeen, persistSave, unlockEnding } from '@/game/save'
import { audio } from '@/game/audio'

function checkRule(r: DispatchRule, s: GameState): boolean {
  if (r.reqFlags && !r.reqFlags.every((f) => s.flags.includes(f))) return false
  if (r.reqAff && s.affection[r.reqAff.char] < r.reqAff.min) return false
  return true
}

export function initialState(): GameState {
  return {
    pc: labelIndex('start'),
    affection: { wanqing: 0, xingmian: 0, bailu: 0 },
    flags: [],
    chars: [],
    bg: 'black',
    bgm: null,
    chapter: '序章 · 潮声',
    backlog: [],
    pending: null,
    affFx: null,
    affFxN: 0,
  }
}

// 从当前 pc 执行指令，直到遇到阻塞指令（say / choice / ending）
export function run(gs: GameState): GameState {
  let s: GameState = { ...gs, pending: null, affFx: null }
  for (let guard = 0; guard < 20000; guard++) {
    const cmd = SCRIPT[s.pc]
    if (!cmd) {
      s.pending = { kind: 'ending', id: 'solo' }
      return s
    }
    switch (cmd.t) {
      case 'label':
        if (cmd.chapter) s.chapter = cmd.chapter
        s.pc++
        continue
      case 'bg':
        s.bg = cmd.bg
        s.pc++
        continue
      case 'bgm':
        s.bgm = cmd.track
        s.pc++
        continue
      case 'show': {
        const rest = s.chars.filter((c) => c.char !== cmd.char)
        s.chars = [...rest, { char: cmd.char, expr: cmd.expr ?? 'neutral', pos: cmd.pos }]
        s.pc++
        continue
      }
      case 'expr':
        s.chars = s.chars.map((c) => (c.char === cmd.char ? { ...c, expr: cmd.expr } : c))
        s.pc++
        continue
      case 'hide':
        s.chars = s.chars.filter((c) => c.char !== cmd.char)
        s.pc++
        continue
      case 'clear':
        s.chars = []
        s.pc++
        continue
      case 'aff':
        s.affection = { ...s.affection, [cmd.char]: s.affection[cmd.char] + cmd.delta }
        s.affFx = { char: cmd.char, delta: cmd.delta }
        s.affFxN++
        s.pc++
        continue
      case 'flag':
        if (!s.flags.includes(cmd.key)) s.flags = [...s.flags, cmd.key]
        s.pc++
        continue
      case 'jump':
        s.pc = labelIndex(cmd.label)
        continue
      case 'dispatch': {
        const rule = cmd.rules.find((r) => checkRule(r, s))
        s.pc = rule ? labelIndex(rule.label) : labelIndex(cmd.fallback)
        continue
      }
      case 'say':
        markSeen(s.pc)
        s.pending = { kind: 'say', who: cmd.who, text: cmd.text }
        return s
      case 'choice':
        s.pending = { kind: 'choice', options: cmd.options }
        return s
      case 'ending':
        unlockEnding(cmd.id)
        s.pending = { kind: 'ending', id: cmd.id }
        return s
      case 'toTitle':
        return s
    }
  }
  return s
}

export function useGame() {
  const [state, setState] = useState<GameState | null>(null)
  const stateRef = useRef<GameState | null>(null)
  stateRef.current = state

  const newGame = useCallback(() => {
    const s = run(initialState())
    setState(s)
  }, [])

  const loadSave = useCallback((save: SaveData) => {
    const restored: GameState = {
      pc: save.pc,
      affection: save.affection,
      flags: save.flags,
      chars: save.chars,
      bg: save.bg,
      bgm: save.bgm,
      chapter: save.chapter,
      backlog: save.backlog,
      pending: null,
      affFx: null,
      affFxN: 0,
    }
    setState(run(restored))
  }, [])

  // 推进对话：离开当前 say，把这句记入 backlog
  const advance = useCallback(() => {
    const cur = stateRef.current
    if (!cur || !cur.pending || cur.pending.kind !== 'say') return
    const { who, text } = cur.pending
    const withLog: GameState = {
      ...cur,
      backlog: [...cur.backlog.slice(-199), { who, text }],
      pc: cur.pc + 1,
    }
    setState(run(withLog))
  }, [])

  const choose = useCallback((opt: ChoiceOpt) => {
    const cur = stateRef.current
    if (!cur || !cur.pending || cur.pending.kind !== 'choice') return
    audio.ui('confirm')
    setState(run({ ...cur, pc: labelIndex(opt.jump) }))
  }, [])

  const saveTo = useCallback((slot: number) => {
    const cur = stateRef.current
    if (!cur || !cur.pending || cur.pending.kind === 'ending') return false
    const lastLine = [...cur.backlog].reverse().find((b) => b.text)
    const save: SaveData = {
      slot,
      time: Date.now(),
      pc: cur.pc,
      affection: cur.affection,
      flags: cur.flags,
      chars: cur.chars,
      bg: cur.bg,
      bgm: cur.bgm,
      chapter: cur.chapter,
      backlog: cur.backlog.slice(-80),
      preview: cur.pending.kind === 'say' ? cur.pending.text : lastLine?.text ?? '',
    }
    persistSave(save)
    return true
  }, [])

  const quit = useCallback(() => setState(null), [])

  return { state, newGame, loadSave, advance, choose, saveTo, quit }
}
