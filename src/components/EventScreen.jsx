import { useGameStore } from '../store/useGameStore.js'

export default function EventScreen() {
  const currentEvent = useGameStore((s) => s.currentEvent)
  const run = useGameStore((s) => s.run)
  const resolveEvent = useGameStore((s) => s.resolveEvent)

  if (!currentEvent || !run) return null

  return (
    <div className="screen event-screen">
      <div className="event-panel">
        <h2>{currentEvent.name}</h2>
        <p className="event-panel__flavor">{currentEvent.flavor}</p>
        <div className="event-panel__choices">
          {currentEvent.choices.map((choice, i) => {
            const insufficientGold =
              choice.effect === 'buy_unlock_buff_next' && run.gold < choice.value
            return (
              <button
                key={i}
                className="btn btn--choice"
                disabled={insufficientGold}
                onClick={() => resolveEvent(choice.effect, choice.value)}
              >
                <div className="event-panel__choice-label">{choice.label}</div>
                <div className="event-panel__choice-result">{choice.result}</div>
                {insufficientGold && <div className="event-panel__warn">ゴールドが足りない</div>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
