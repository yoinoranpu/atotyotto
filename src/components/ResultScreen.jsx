import { useGameStore } from '../store/useGameStore.js'

export default function ResultScreen() {
  const run = useGameStore((s) => s.run)
  const startRun = useGameStore((s) => s.startRun)

  if (!run || !run.resultStats) return null
  const { cleared, floorsCleared, maxDamage, gold } = run.resultStats

  return (
    <div className="screen result-screen">
      <h1>{cleared ? 'ダンジョン制覇!' : '探索終了'}</h1>
      <div className="result-stats">
        <div className="result-stats__row">
          <span>到達階層</span>
          <span>{floorsCleared}</span>
        </div>
        <div className="result-stats__row">
          <span>最大ダメージ</span>
          <span>{maxDamage}</span>
        </div>
        <div className="result-stats__row">
          <span>獲得ゴールド</span>
          <span>{gold}</span>
        </div>
      </div>
      <button className="btn btn--primary btn--large" onClick={startRun}>
        もう一度挑戦
      </button>
    </div>
  )
}
