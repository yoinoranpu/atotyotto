import { useGameStore } from '../store/useGameStore.js'
import { CARDS } from '../data/cards.js'
import { intentLabel } from '../data/enemies.js'
import FloatingTexts from './FloatingTexts.jsx'
import NodeProgress from './NodeProgress.jsx'
import Sprite from './Sprite.jsx'

function HpBar({ hp, maxHp, color }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  return (
    <div className="hp-bar">
      <div className="hp-bar__fill" style={{ width: `${pct}%`, background: color }} />
      <span className="hp-bar__label">
        {Math.max(0, Math.round(hp))} / {maxHp}
      </span>
    </div>
  )
}

export default function BattleScreen() {
  const run = useGameStore((s) => s.run)
  const selectCard = useGameStore((s) => s.selectCard)
  const continueAfterBattle = useGameStore((s) => s.continueAfterBattle)

  if (!run || !run.battle) return null
  const { battle } = run
  const { enemy, player, hand, intent, phase, log, floatingTexts, rewardGold } = battle

  const canChoose = phase === 'choosing'

  const TIER_RANK = { small: 0, medium: 1, large: 2, huge: 3 }
  const shakeTier = floatingTexts.reduce((acc, t) => {
    const relevant = t.kind === 'enemy_hit' || t.kind === 'player_hit' || t.kind === 'near_death'
    if (relevant && TIER_RANK[t.tier] > TIER_RANK[acc]) return t.tier
    return acc
  }, 'small')
  const shakeSignature = floatingTexts.map((t) => t.id).join('|')
  const shakeClass =
    shakeTier === 'huge' ? ' shake-heavy' : shakeTier === 'large' ? ' shake-light' : ''

  const kinds = floatingTexts.map((t) => t.kind)
  const enemyGotHit = kinds.includes('player_hit')
  const playerGotHit = kinds.includes('enemy_hit') || kinds.includes('near_death')
  const playerDodged = kinds.includes('miss')

  const enemySpriteClass =
    (enemyGotHit ? (shakeTier === 'huge' ? ' sprite--flash-heavy' : ' sprite--flash-hit') : '') +
    (phase === 'victory' ? ' sprite--defeated' : '')
  const playerSpriteClass =
    (playerGotHit ? (shakeTier === 'huge' ? ' sprite--flash-heavy' : ' sprite--flash-hit') : '') +
    (enemyGotHit ? ' sprite--lunge' : '') +
    (playerDodged ? ' sprite--dodge' : '') +
    (phase === 'defeat' ? ' sprite--defeated' : '')

  return (
    <div className="screen battle-screen">
      <NodeProgress nodeIndex={run.nodeIndex} />

      <div className="gold-display">💰 {run.gold}</div>

      <div key={shakeSignature} className={'battle-stage' + shakeClass}>
        <div className="enemy-panel">
          <div className="enemy-panel__name">
            {enemy.name}
            {enemy.boss && <span className="tag tag--boss">BOSS</span>}
            {enemy.elite && <span className="tag tag--elite">強敵</span>}
          </div>
          <Sprite key={`enemy_${shakeSignature}`} kind={enemy.id} className={enemySpriteClass} />
          <HpBar hp={enemy.hp} maxHp={enemy.maxHp} color="#d84f4f" />
          <div className="intent-display">
            <span className="intent-display__icon">⚠</span>
            次の行動: {intentLabel(intent.intent)}
            {(intent.intent === 'attack' || intent.intent === 'strong_attack') &&
              ` ${intent.value + enemy.atkBuff}ダメージ`}
          </div>
        </div>

        <FloatingTexts texts={floatingTexts} />

        <div className="player-panel">
          <div className="player-panel__name">
            勇者
            {player.block > 0 && <span className="tag tag--block">防御 {player.block}</span>}
            {player.blockPercent > 0 && (
              <span className="tag tag--block">軽減 {Math.round(player.blockPercent * 100)}%</span>
            )}
            {player.strength > 0 && <span className="tag tag--buff">攻撃+{player.strength}</span>}
            {player.nextMultiplier > 1 && <span className="tag tag--buff">集中中</span>}
          </div>
          <Sprite key={`player_${shakeSignature}`} kind="player" className={playerSpriteClass} />
          <HpBar hp={player.hp} maxHp={player.maxHp} color="#5ec26a" />
        </div>
      </div>

      <div className="battle-log">
        {log.slice(-3).map((line, i) => (
          <div key={i} className="battle-log__line">
            {line}
          </div>
        ))}
      </div>

      <div className={'card-hand' + (canChoose ? '' : ' card-hand--disabled')}>
        {hand.map((cardId, i) => {
          const card = CARDS[cardId]
          return (
            <button
              key={`${cardId}_${i}`}
              className={`card card--${card.type}`}
              disabled={!canChoose}
              onClick={() => selectCard(cardId)}
            >
              <div className="card__name">{card.name}</div>
              <div className="card__desc">{card.desc}</div>
            </button>
          )
        })}
      </div>

      {phase === 'victory' && (
        <div className="overlay">
          <div className="overlay__panel">
            <h2>勝利!</h2>
            <p>ゴールド +{rewardGold}</p>
            <button className="btn btn--primary" onClick={continueAfterBattle}>
              次へ進む
            </button>
          </div>
        </div>
      )}

      {phase === 'defeat' && (
        <div className="overlay">
          <div className="overlay__panel">
            <h2>倒れた…</h2>
            <p>次はもっと上手くやれるはず。</p>
          </div>
        </div>
      )}
    </div>
  )
}
