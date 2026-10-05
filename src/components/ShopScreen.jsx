import { useState } from 'react'
import { useGameStore } from '../store/useGameStore.js'
import { CARDS } from '../data/cards.js'

const HEAL_COST = 30
const MAX_HP_COST = 25
const MAX_HP_AMOUNT = 8
const REMOVE_COST = 25
const MIN_DECK_SIZE = 6

export default function ShopScreen() {
  const run = useGameStore((s) => s.run)
  const shopOffers = useGameStore((s) => s.shopOffers)
  const buyShopCard = useGameStore((s) => s.buyShopCard)
  const buyShopHeal = useGameStore((s) => s.buyShopHeal)
  const buyShopMaxHp = useGameStore((s) => s.buyShopMaxHp)
  const removeShopCard = useGameStore((s) => s.removeShopCard)
  const leaveShop = useGameStore((s) => s.leaveShop)
  const [removing, setRemoving] = useState(false)

  if (!run || !shopOffers) return null

  const fullHp = run.player.hp >= run.player.maxHp
  const canRemove = run.ownedCardIds.length > MIN_DECK_SIZE

  const ownedCounts = run.ownedCardIds.reduce((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="screen shop-screen">
      <div className="gold-display">💰 {run.gold}</div>
      <h2>ショップ</h2>

      <div className="shop-section">
        <div className="shop-section__label">🂠 新しいカード(山札に加わる)</div>
        <div className="shop-items">
          {shopOffers.map((offer) => {
            const card = CARDS[offer.cardId]
            const cannotAfford = run.gold < offer.cost
            return (
              <button
                key={offer.cardId}
                className={`card card--${card.type} shop-item`}
                disabled={cannotAfford}
                onClick={() => buyShopCard(offer.cardId, offer.cost)}
              >
                <div className="card__name">{card.name}</div>
                <div className="card__desc">{card.desc}</div>
                <div className="shop-item__cost">💰 {offer.cost}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="shop-section">
        <div className="shop-section__label">⚡ その場限りの効果(山札には入らない)</div>
        <div className="shop-items">
          <button
            className="shop-effect shop-effect--instant"
            disabled={fullHp || run.gold < HEAL_COST}
            onClick={() => buyShopHeal(HEAL_COST)}
          >
            <div className="card__name">HP全回復</div>
            <div className="card__desc">HPを満タンまで回復する。</div>
            <div className="shop-item__cost">💰 {HEAL_COST}</div>
          </button>
        </div>
      </div>

      <div className="shop-section">
        <div className="shop-section__label">✦ 永続強化(このラン中ずっと効く)</div>
        <div className="shop-items">
          <button
            className="shop-effect shop-effect--permanent"
            disabled={run.gold < MAX_HP_COST}
            onClick={() => buyShopMaxHp(MAX_HP_COST, MAX_HP_AMOUNT)}
          >
            <div className="card__name">体力強化</div>
            <div className="card__desc">最大HPが{MAX_HP_AMOUNT}増える(即座にその分回復もする)。</div>
            <div className="shop-item__cost">💰 {MAX_HP_COST}</div>
          </button>
        </div>
      </div>

      {!removing && (
        <button className="btn" disabled={!canRemove} onClick={() => setRemoving(true)}>
          不要なカードを処分する(💰{REMOVE_COST})
        </button>
      )}

      {removing && (
        <div className="shop-remove">
          <div className="shop-remove__hint">
            処分するカードを選ぶ(山札が薄まりすぎないよう少し残しておこう)
          </div>
          <div className="shop-items">
            {Object.keys(ownedCounts).map((id) => {
              const card = CARDS[id]
              const cannotAfford = run.gold < REMOVE_COST
              return (
                <button
                  key={id}
                  className={`card card--${card.type} shop-item`}
                  disabled={cannotAfford || !canRemove}
                  onClick={() => {
                    removeShopCard(id, REMOVE_COST)
                    setRemoving(false)
                  }}
                >
                  <div className="card__name">
                    {card.name} ×{ownedCounts[id]}
                  </div>
                  <div className="card__desc">{card.desc}</div>
                </button>
              )
            })}
          </div>
          <button className="btn" onClick={() => setRemoving(false)}>
            やめる
          </button>
        </div>
      )}

      <button className="btn btn--primary" onClick={leaveShop}>
        先へ進む
      </button>
    </div>
  )
}
