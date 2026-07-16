// ============ 星港电波 · Galgame 引擎类型定义 ============

export type CharId = 'wanqing' | 'xingmian' | 'bailu'
export type Speaker = CharId | 'narrator' | 'player'
export type Expr = 'neutral' | 'smile' | 'sad' | 'blush' | 'angry' | 'surprise'
export type Pos = 'left' | 'center' | 'right'

export type BgId =
  | 'title'
  | 'cafe_day'
  | 'cafe_night'
  | 'beach_dusk'
  | 'rooftop_night'
  | 'street_neon'
  | 'radio_room'
  | 'festival'
  | 'rain_window'
  | 'dawn_beach'
  | 'black'

export type BgmId =
  | 'title'
  | 'daily'
  | 'night'
  | 'emotion'
  | 'festival'
  | 'signal' // 白露 glitch 主题
  | 'ending'

// 舞台角色状态
export interface StageChar {
  char: CharId
  expr: Expr
  pos: Pos
}

// 脚本指令
export type Cmd =
  | { t: 'label'; name: string; chapter?: string }
  | { t: 'bg'; bg: BgId }
  | { t: 'bgm'; track: BgmId | null }
  | { t: 'show'; char: CharId; expr?: Expr; pos: Pos }
  | { t: 'expr'; char: CharId; expr: Expr }
  | { t: 'hide'; char: CharId }
  | { t: 'clear' }
  | { t: 'say'; who: Speaker; text: string }
  | { t: 'choice'; options: ChoiceOpt[] }
  | { t: 'aff'; char: CharId; delta: number }
  | { t: 'flag'; key: string }
  | { t: 'jump'; label: string }
  // 根据条件自动分歧
  | { t: 'dispatch'; rules: DispatchRule[]; fallback: string }
  | { t: 'ending'; id: string }
  | { t: 'toTitle' }

export interface ChoiceOpt {
  text: string
  jump: string
  sub?: string // 副标题小字
  // 条件不满足时置灰（缺省总是可选）
  reqFlags?: string[]
  reqAff?: { char: CharId; min: number }
}

export interface DispatchRule {
  label: string
  reqFlags?: string[]
  reqAff?: { char: CharId; min: number }
}

export type Affection = Record<CharId, number>

// 运行时状态
export interface GameState {
  pc: number
  affection: Affection
  flags: string[]
  chars: StageChar[]
  bg: BgId
  bgm: BgmId | null
  chapter: string
  backlog: BacklogItem[]
  // 好感度浮动提示
  affFx: { char: CharId; delta: number } | null
  affFxN: number
  // 阻塞状态
  pending: PendingSay | PendingChoice | PendingEnding | null
}

export interface PendingSay { kind: 'say'; who: Speaker; text: string }
export interface PendingChoice { kind: 'choice'; options: ChoiceOpt[] }
export interface PendingEnding { kind: 'ending'; id: string }

export interface BacklogItem {
  who: Speaker
  text: string
}

// 存档
export interface SaveData {
  slot: number
  time: number
  pc: number
  affection: Affection
  flags: string[]
  chars: StageChar[]
  bg: BgId
  bgm: BgmId | null
  chapter: string
  backlog: BacklogItem[]
  preview: string
}

export interface ConfigData {
  textSpeed: number // 每字毫秒 10-80
  autoDelay: number // 自动模式停留毫秒
  bgmVolume: number // 0-1
  sfxVolume: number
  mute: boolean
}

export const CHARACTERS: Record<
  CharId,
  { name: string; short: string; color: string; color2: string; title: string }
> = {
  wanqing: {
    name: '苏晚晴',
    short: '晚晴',
    color: '#ff8a5c',
    color2: '#ffc46b',
    title: '看板娘 / 深夜DJ',
  },
  xingmian: {
    name: '沈星眠',
    short: '星眠',
    color: '#8b93ff',
    color2: '#c3a6ff',
    title: '天文台研究生',
  },
  bailu: {
    name: '白露',
    short: '白露',
    color: '#4fe0e8',
    color2: '#9ef3ff',
    title: '频段彼端的少女',
  },
}

export interface EndingMeta {
  id: string
  no: string
  title: string
  route: string
  desc: string
  bg: BgId
  color: string
  hint: string
}

export const ENDINGS: EndingMeta[] = [
  {
    id: 'wq_true',
    no: 'ED-01',
    title: '夏日回声',
    route: '苏晚晴 · 真结局',
    desc: '咖啡馆的灯重新亮起，深夜电台有了新的家。',
    bg: 'cafe_night',
    color: '#ff8a5c',
    hint: '在烟火大会前，把真心话说出口。',
  },
  {
    id: 'wq_normal',
    no: 'ED-02',
    title: '各自晴天',
    route: '苏晚晴 · 普通结局',
    desc: '有些告别，是为了把声音带去更远的地方。',
    bg: 'beach_dusk',
    color: '#ffb08a',
    hint: '有时候，鼓励比挽留更接近爱。',
  },
  {
    id: 'xm_true',
    no: 'ED-03',
    title: '猎户座之约',
    route: '沈星眠 · 真结局',
    desc: '每年冬天，猎户座升起的时候，天台见。',
    bg: 'rooftop_night',
    color: '#8b93ff',
    hint: '陪她失眠的人，也要陪她等天亮。',
  },
  {
    id: 'xm_normal',
    no: 'ED-04',
    title: '流星距离',
    route: '沈星眠 · 普通结局',
    desc: '流星划过只需要一秒，想念却走了很远。',
    bg: 'rooftop_night',
    color: '#aab0ff',
    hint: '她没有说出口的挽留，你听懂了吗？',
  },
  {
    id: 'bl_true',
    no: 'ED-05',
    title: '信号抵达未来',
    route: '白露 · 真结局',
    desc: '三个锚点连成星座，频段终于不再沉默。',
    bg: 'dawn_beach',
    color: '#4fe0e8',
    hint: '集齐三枚锚点，再来听最后一次播音。',
  },
  {
    id: 'bl_normal',
    no: 'ED-06',
    title: '遗失的频段',
    route: '白露 · 普通结局',
    desc: '雨夜之后，凌晨三点零三分只剩白噪音。',
    bg: 'rain_window',
    color: '#7adce8',
    hint: '锚点还散落在共通线的角落里。',
  },
  {
    id: 'solo',
    no: 'ED-07',
    title: '蓝色尽头的句点',
    route: '共通 · 结局',
    desc: '推土机来的时候，收音机里一片安静。',
    bg: 'beach_dusk',
    color: '#9aa4b8',
    hint: '多在意她们一点，故事就会不一样。',
  },
]
