import { useCallback, useEffect, useState } from 'react'
import TitleScreen from '@/components/TitleScreen'
import GameScreen from '@/components/GameScreen'
import { useGame } from '@/hooks/useGame'
import type { ConfigData } from '@/game/types'
import { loadConfig, persistConfig } from '@/game/save'
import { audio } from '@/game/audio'
import '@/game/game.css'

export default function App() {
  const game = useGame()
  const [config, setConfig] = useState<ConfigData>(loadConfig())

  useEffect(() => {
    persistConfig(config)
    audio.setVolumes(config.bgmVolume, config.sfxVolume)
    audio.setMute(config.mute)
  }, [config])

  const toTitle = useCallback(() => {
    game.quit()
    audio.play('title')
  }, [game])

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {game.state ? (
        <GameScreen
          state={game.state}
          config={config}
          onConfigChange={setConfig}
          onAdvance={game.advance}
          onChoose={game.choose}
          onSave={game.saveTo}
          onLoad={game.loadSave}
          onQuit={toTitle}
        />
      ) : (
        <TitleScreen
          config={config}
          onConfigChange={setConfig}
          onStart={() => {
            audio.unlock()
            game.newGame()
          }}
          onContinue={(s) => {
            audio.unlock()
            game.loadSave(s)
          }}
        />
      )}
    </div>
  )
}
