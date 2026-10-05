import { useGameStore } from '../store/useGameStore.js'

export default function TitleScreen() {
  const startRun = useGameStore((s) => s.startRun)

  return (
    <div className="screen title-screen">
      <h1 className="title-screen__title">あと一手</h1>
      <p className="title-screen__tagline">
        敵の次の一手は分かる。だが、自分の次の一手は選べない。
      </p>
      <button className="btn btn--primary btn--large" onClick={startRun}>
        はじめる
      </button>
    </div>
  )
}
