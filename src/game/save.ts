import type { SaveData, ConfigData } from './types'

const SAVE_KEY = 'hoshiko_radio_saves_v1'
const CONFIG_KEY = 'hoshiko_radio_config_v1'
const GALLERY_KEY = 'hoshiko_radio_endings_v1'
const SEEN_KEY = 'hoshiko_radio_seen_v1'

export const SLOT_COUNT = 8
export const AUTO_SLOT = 0 // 0 为自动存档位，1-8 为手动

// 跨域/沙盒 iframe 中 localStorage 可能不可用，全部读写做防护
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch { /* ignore */ }
}

export function loadAllSaves(): (SaveData | null)[] {
  try {
    const raw = safeGet(SAVE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return Array(SLOT_COUNT + 1).fill(null)
}

export function persistSave(save: SaveData) {
  const all = loadAllSaves()
  all[save.slot] = save
  safeSet(SAVE_KEY, JSON.stringify(all))
}

export function deleteSave(slot: number) {
  const all = loadAllSaves()
  all[slot] = null
  safeSet(SAVE_KEY, JSON.stringify(all))
}

export function latestSave(): SaveData | null {
  const all = loadAllSaves().filter(Boolean) as SaveData[]
  if (!all.length) return null
  return all.sort((a, b) => b.time - a.time)[0]
}

// ===== 设置 =====
export const DEFAULT_CONFIG: ConfigData = {
  textSpeed: 28,
  autoDelay: 1600,
  bgmVolume: 0.5,
  sfxVolume: 0.6,
  mute: false,
}

export function loadConfig(): ConfigData {
  try {
    const raw = safeGet(CONFIG_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG }
}

export function persistConfig(c: ConfigData) {
  safeSet(CONFIG_KEY, JSON.stringify(c))
}

// ===== 结局图鉴 =====
export function loadEndings(): string[] {
  try {
    const raw = safeGet(GALLERY_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

export function unlockEnding(id: string) {
  const all = loadEndings()
  if (!all.includes(id)) {
    all.push(id)
    safeSet(GALLERY_KEY, JSON.stringify(all))
  }
}

// ===== 已读文本（用于跳过模式提示）=====
export function loadSeen(): number[] {
  try {
    const raw = safeGet(SEEN_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

export function markSeen(pc: number) {
  const all = loadSeen()
  if (!all.includes(pc)) {
    all.push(pc)
    if (all.length > 5000) all.splice(0, all.length - 5000)
    safeSet(SEEN_KEY, JSON.stringify(all))
  }
}
