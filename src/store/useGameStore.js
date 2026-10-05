import { create } from 'zustand'
import { CARDS, getStartingCardIds } from '../data/cards.js'
import { RUN_SEQUENCE } from '../data/enemies.js'
import { pickRandomEvent } from '../data/events.js'
import {
  createEnemyState,
  createPlayerBattleState,
  getCurrentIntent,
  createDeck,
  drawCards,
  playCard,
  enemyAct,
  rollGold,
} from '../systems/battleEngine.js'
import * as sfx from '../systems/audio.js'

const BASE_MAX_HP = 45
const BASE_START_GOLD = 10

function makeFloatText(text, kind, tier = 'medium') {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text,
    kind,
    tier,
  }
}

function tierFor(amount) {
  if (amount >= 28) return 'huge'
  if (amount >= 18) return 'large'
  if (amount >= 10) return 'medium'
  return 'small'
}

function countBattleFloorsCleared(nodeIndex) {
  let count = 0
  for (let i = 0; i < nodeIndex && i < RUN_SEQUENCE.length; i++) {
    if (RUN_SEQUENCE[i].type === 'battle') count += 1
  }
  return count
}

export const useGameStore = create((set, get) => ({
  scene: 'title',
  run: null,
  shopOffers: null,
  currentEvent: null,

  goToTitle: () => set({ scene: 'title' }),

  startRun: () => {
    const run = {
      nodeIndex: 0,
      ownedCardIds: getStartingCardIds(),
      gold: BASE_START_GOLD,
      player: { hp: BASE_MAX_HP, maxHp: BASE_MAX_HP },
      bonusAtk: 0,
      maxDamageThisRun: 0,
      battle: null,
    }
    set({ run })
    get()._enterNode(0)
  },

  _enterNode: (nodeIndex) => {
    const node = RUN_SEQUENCE[nodeIndex]
    if (!node) {
      get()._finalizeRun(true)
      return
    }
    if (node.type === 'battle') {
      const run = get().run
      const enemy = createEnemyState(node.enemyId)
      const playerBattle = createPlayerBattleState(run.player.hp, run.player.maxHp)
      playerBattle.strength += run.bonusAtk
      const deck = createDeck(run.ownedCardIds)
      const { hand, drawPile, discardPile } = drawCards(deck, 5)
      set({
        scene: 'battle',
        run: {
          ...run,
          battle: {
            enemy,
            player: playerBattle,
            hand,
            drawPile,
            discardPile,
            intent: getCurrentIntent(enemy),
            floatingTexts: [],
            log: [`${enemy.name}が現れた!`],
            phase: 'choosing',
            turnCount: 1,
            usedOnceIds: [],
            lastPlayedType: null,
          },
        },
      })
    } else if (node.type === 'event') {
      set({ scene: 'event', currentEvent: pickRandomEvent() })
    } else if (node.type === 'shop') {
      const run = get().run
      const owned = new Set(run.ownedCardIds)
      const candidates = Object.values(CARDS).filter((c) => !owned.has(c.id))
      const shuffled = [...candidates].sort(() => Math.random() - 0.5)
      const offers = shuffled.slice(0, 3).map((c) => ({
        cardId: c.id,
        cost: c.type === 'attack' ? 45 : 35,
      }))
      set({ scene: 'shop', shopOffers: offers })
    }
  },

  advanceNode: () => {
    const run = get().run
    const nextIndex = run.nodeIndex + 1
    set({ run: { ...run, nodeIndex: nextIndex, battle: null } })
    get()._enterNode(nextIndex)
  },

  selectCard: (cardId) => {
    const run = get().run
    if (!run || !run.battle || run.battle.phase !== 'choosing') return
    const battle = run.battle
    const context = { turnCount: battle.turnCount, lastPlayedType: battle.lastPlayedType }
    const { player, enemy, events } = playCard(battle.player, battle.enemy, cardId, context)

    let maxDamageThisRun = run.maxDamageThisRun
    const floatingTexts = []
    const log = [...battle.log]
    events.forEach((ev) => {
      if (ev.type === 'player_attack') {
        floatingTexts.push(makeFloatText(`-${ev.amount}`, 'player_hit', tierFor(ev.amount)))
        log.push(`プレイヤーの攻撃! ${ev.amount}ダメージ`)
        if (ev.amount > maxDamageThisRun) maxDamageThisRun = ev.amount
        sfx.playHit(ev.amount)
      } else if (ev.type === 'block') {
        floatingTexts.push(makeFloatText(`防御+${ev.amount}`, 'block'))
        log.push(`防御を固めた(+${ev.amount})`)
        sfx.playBlock()
      } else if (ev.type === 'block_percent') {
        floatingTexts.push(makeFloatText(`軽減${ev.amount}%`, 'block'))
        log.push(`次の攻撃を${ev.amount}%軽減する構え`)
        sfx.playBlock()
      } else if (ev.type === 'dodge_set') {
        floatingTexts.push(makeFloatText('回避準備', 'dodge'))
        log.push('次の攻撃を回避する構え')
      } else if (ev.type === 'heal') {
        floatingTexts.push(makeFloatText(`+${ev.amount}`, 'heal'))
        log.push(`HPが${ev.amount}回復した`)
        sfx.playHeal()
      } else if (ev.type === 'buff_atk') {
        floatingTexts.push(makeFloatText(`攻撃力+${ev.amount}`, 'buff'))
        log.push('闘気が高まった')
        sfx.playBuff()
      } else if (ev.type === 'buff_next') {
        floatingTexts.push(makeFloatText('集中!', 'buff'))
        log.push('次の攻撃が強化される')
        sfx.playBuff()
      } else if (ev.type === 'used_once') {
        log.push('このカードはこのバトル中もう出てこない')
      }
    })

    const usedOnceIds = events.some((ev) => ev.type === 'used_once')
      ? [...battle.usedOnceIds, cardId]
      : battle.usedOnceIds

    set({
      run: {
        ...run,
        maxDamageThisRun,
        player: { ...run.player, hp: player.hp },
        battle: {
          ...battle,
          player,
          enemy,
          phase: 'resolving',
          floatingTexts,
          log,
          usedOnceIds,
          lastPlayedType: CARDS[cardId].type,
        },
      },
    })

    if (enemy.hp <= 0) {
      setTimeout(() => get()._handleVictory(), 700)
    } else {
      setTimeout(() => get()._runEnemyTurn(), 900)
    }
  },

  _runEnemyTurn: () => {
    const run = get().run
    if (!run || !run.battle) return
    const battle = run.battle
    const { player, enemy, events } = enemyAct(battle.player, battle.enemy, battle.intent)

    const floatingTexts = []
    const log = [...battle.log]
    events.forEach((ev) => {
      if (ev.type === 'enemy_attack') {
        floatingTexts.push(makeFloatText(`-${ev.amount}`, 'enemy_hit', tierFor(ev.amount)))
        log.push(`敵の攻撃! ${ev.amount}ダメージを受けた`)
        sfx.playTakeDamage(ev.amount)
      } else if (ev.type === 'miss') {
        floatingTexts.push(makeFloatText('MISS!', 'miss', 'large'))
        log.push('敵の攻撃を回避した!')
        sfx.playMiss()
      } else if (ev.type === 'near_death') {
        floatingTexts.push(makeFloatText('ギリギリ!', 'near_death', 'huge'))
        log.push('ギリギリ生き残った…!')
        sfx.playNearDeath()
      } else if (ev.type === 'enemy_heal') {
        log.push(`敵がHPを${ev.amount}回復した`)
      } else if (ev.type === 'enemy_buff') {
        log.push('敵が力を溜めている…')
      }
    })

    set({
      run: {
        ...run,
        player: { ...run.player, hp: player.hp },
        battle: {
          ...battle,
          player,
          enemy,
          phase: 'enemy_turn',
          floatingTexts,
          log,
        },
      },
    })

    if (player.hp <= 0) {
      setTimeout(() => get()._handleDefeat(), 900)
    } else {
      setTimeout(() => get()._startNextTurn(), 900)
    }
  },

  _startNextTurn: () => {
    const run = get().run
    if (!run || !run.battle) return
    const battle = run.battle
    const toDiscard = battle.hand.filter((id) => !battle.usedOnceIds.includes(id))
    const { hand, drawPile, discardPile } = drawCards(
      { drawPile: battle.drawPile, discardPile: [...battle.discardPile, ...toDiscard] },
      5,
    )
    set({
      run: {
        ...run,
        battle: {
          ...battle,
          hand,
          drawPile,
          discardPile,
          intent: getCurrentIntent(battle.enemy),
          floatingTexts: [],
          phase: 'choosing',
          turnCount: battle.turnCount + 1,
        },
      },
    })
  },

  _handleVictory: () => {
    const run = get().run
    const battle = run.battle
    const gold = rollGold(battle.enemy)
    sfx.playVictory()
    set({
      run: {
        ...run,
        gold: run.gold + gold,
        battle: { ...battle, phase: 'victory', rewardGold: gold },
      },
    })
  },

  _handleDefeat: () => {
    const run = get().run
    const battle = run.battle
    sfx.playDefeat()
    set({ run: { ...run, battle: { ...battle, phase: 'defeat' } } })
    setTimeout(() => get()._finalizeRun(false), 1600)
  },

  continueAfterBattle: () => {
    get().advanceNode()
  },

  resolveEvent: (effect, value) => {
    const run = get().run
    let next = { ...run }
    if (effect === 'heal_percent') {
      const amount = Math.round(next.player.maxHp * value)
      next.player = {
        ...next.player,
        hp: Math.min(next.player.maxHp, next.player.hp + amount),
      }
    } else if (effect === 'risk_unlock_buff_atk') {
      next.player = {
        ...next.player,
        maxHp: Math.max(1, next.player.maxHp - value),
        hp: Math.min(next.player.hp, Math.max(1, next.player.maxHp - value)),
      }
      next.ownedCardIds = [...next.ownedCardIds, 'buff_atk']
    } else if (effect === 'buy_unlock_buff_next') {
      if (next.gold >= value) {
        next.gold -= value
        next.ownedCardIds = [...next.ownedCardIds, 'buff_next']
      }
    } else if (effect === 'gain_gold') {
      next.gold += value
    } else if (effect === 'permanent_atk_boost') {
      next.bonusAtk += value
    } else if (effect === 'heal_full') {
      next.player = { ...next.player, hp: next.player.maxHp }
    }
    set({ run: next, currentEvent: null })
    get().advanceNode()
  },

  buyShopCard: (cardId, cost) => {
    const run = get().run
    if (run.gold < cost) return
    set({
      run: {
        ...run,
        gold: run.gold - cost,
        ownedCardIds: [...run.ownedCardIds, cardId],
      },
    })
  },

  buyShopHeal: (cost) => {
    const run = get().run
    if (run.gold < cost || run.player.hp >= run.player.maxHp) return
    set({
      run: {
        ...run,
        gold: run.gold - cost,
        player: { ...run.player, hp: run.player.maxHp },
      },
    })
  },

  buyShopMaxHp: (cost, amount) => {
    const run = get().run
    if (run.gold < cost) return
    set({
      run: {
        ...run,
        gold: run.gold - cost,
        player: {
          ...run.player,
          maxHp: run.player.maxHp + amount,
          hp: run.player.hp + amount,
        },
      },
    })
  },

  removeShopCard: (cardId, cost) => {
    const run = get().run
    const MIN_DECK_SIZE = 6
    if (run.gold < cost || run.ownedCardIds.length <= MIN_DECK_SIZE) return
    const idx = run.ownedCardIds.indexOf(cardId)
    if (idx === -1) return
    const nextOwned = [...run.ownedCardIds]
    nextOwned.splice(idx, 1)
    set({
      run: {
        ...run,
        gold: run.gold - cost,
        ownedCardIds: nextOwned,
      },
    })
  },

  leaveShop: () => {
    set({ shopOffers: null })
    get().advanceNode()
  },

  _finalizeRun: (cleared) => {
    const run = get().run
    const floorsCleared = countBattleFloorsCleared(run.nodeIndex)
    set({
      scene: 'result',
      run: {
        ...run,
        resultStats: {
          cleared,
          floorsCleared,
          maxDamage: run.maxDamageThisRun,
          gold: run.gold,
        },
      },
    })
  },
}))
