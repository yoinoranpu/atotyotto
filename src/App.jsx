import { useGameStore } from './store/useGameStore.js'
import TitleScreen from './components/TitleScreen.jsx'
import BattleScreen from './components/BattleScreen.jsx'
import EventScreen from './components/EventScreen.jsx'
import ShopScreen from './components/ShopScreen.jsx'
import ResultScreen from './components/ResultScreen.jsx'
import './App.css'

const SCENES = {
  title: TitleScreen,
  battle: BattleScreen,
  event: EventScreen,
  shop: ShopScreen,
  result: ResultScreen,
}

export default function App() {
  const scene = useGameStore((s) => s.scene)
  const Scene = SCENES[scene] ?? TitleScreen
  return (
    <div className="app-root">
      <Scene />
    </div>
  )
}
