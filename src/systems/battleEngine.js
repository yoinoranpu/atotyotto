import { CARDS } from '../data/cards.js'
import { ENEMIES } from '../data/enemies.js'

export function createEnemyState(enemyId) {
  const def = ENEMIES[enemyId]
  return {
    id: def.id,
    name: def.name,
    maxHp: def.maxHp,
    hp: def.maxHp,
    pattern: def.pattern ?? null,
    patternIndex: 0,
    rule: def.rule ?? null,
    lastIntent: null,
    atkBuff: 0,
    elite: !!def.elite,
    boss: !!def.boss,
    goldMin: def.goldMin,
    goldMax: def.goldMax,
  }
}

export function createPlayerBattleState(hp, maxHp) {
  return {
    hp,
    maxHp,
    block: 0,
    blockPercent: 0,
    dodgeActive: false,
    strength: 0,
    nextMultiplier: 1,
  }
}

export function getCurrentIntent(enemy) {
  if (enemy.rule) {
    return enemy.rule(enemy)
  }
  return enemy.pattern[enemy.patternIndex % enemy.pattern.length]
}

function shuffle(ids) {
  const arr = [...ids]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 実際の山札/捨て札で循環させる(Slay the Spire式)。
// 同じカードが連続で来すぎない代わりに、一度見た札は山札が尽きるまで戻らない。
export function createDeck(ownedCardIds) {
  return { drawPile: shuffle(ownedCardIds), discardPile: [] }
}

// 山札からcount枚引く。山札が尽きたら捨て札をシャッフルして山札に戻す。
export function drawCards(deck, count) {
  let drawPile = [...deck.drawPile]
  let discardPile = [...deck.discardPile]
  const hand = []
  for (let i = 0; i < count; i++) {
    if (drawPile.length === 0) {
      if (discardPile.length === 0) break
      drawPile = shuffle(discardPile)
      discardPile = []
    }
    hand.push(drawPile.pop())
  }
  return { hand, drawPile, discardPile }
}

// カードの基礎値は条件によって変化する(乱数ではなく、盤面の見える情報だけで決まる)。
function resolveAttackValue(card, player, enemy, context) {
  if (
    card.executeThreshold !== undefined &&
    enemy.maxHp > 0 &&
    enemy.hp / enemy.maxHp <= card.executeThreshold
  ) {
    return card.executeValue
  }
  if (card.firstTurnValue !== undefined && context.turnCount === 1) {
    return card.firstTurnValue
  }
  if (card.followUpValue !== undefined && context.lastPlayedType === 'attack') {
    return card.followUpValue
  }
  if (
    card.desperateThreshold !== undefined &&
    player.maxHp > 0 &&
    player.hp / player.maxHp <= card.desperateThreshold
  ) {
    return card.desperateValue
  }
  return card.value
}

// プレイヤーがカードを使用する。contextはターン数・直前に使ったカード種別など盤面情報。
// 戻り値: { player, enemy, events }
export function playCard(player, enemy, cardId, context = { turnCount: 1, lastPlayedType: null }) {
  const card = CARDS[cardId]
  const events = []
  let nextPlayer = { ...player }
  let nextEnemy = { ...enemy }

  if (card.type === 'attack') {
    const hits = card.hits || 1
    const baseValue = resolveAttackValue(card, player, enemy, context)
    let totalDamage = 0
    for (let i = 0; i < hits; i++) {
      let dmg = baseValue + nextPlayer.strength
      if (nextPlayer.nextMultiplier > 1) {
        dmg = Math.round(dmg * nextPlayer.nextMultiplier)
      }
      totalDamage += dmg
    }
    if (nextPlayer.nextMultiplier > 1) {
      nextPlayer.nextMultiplier = 1
    }
    nextEnemy.hp = Math.max(0, nextEnemy.hp - totalDamage)
    events.push({ type: 'player_attack', amount: totalDamage, hits })
  } else if (card.type === 'block') {
    if (card.blockPercent) {
      nextPlayer.blockPercent = card.blockPercent
      events.push({ type: 'block_percent', amount: Math.round(card.blockPercent * 100) })
    } else {
      nextPlayer.block += card.value
      events.push({ type: 'block', amount: card.value })
    }
    if (card.counterDamage) {
      nextEnemy.hp = Math.max(0, nextEnemy.hp - card.counterDamage)
      events.push({ type: 'player_attack', amount: card.counterDamage, hits: 1 })
    }
  } else if (card.type === 'dodge') {
    nextPlayer.dodgeActive = true
    events.push({ type: 'dodge_set' })
  } else if (card.type === 'heal') {
    const healed = Math.min(card.value, nextPlayer.maxHp - nextPlayer.hp)
    nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + card.value)
    events.push({ type: 'heal', amount: healed })
  } else if (card.type === 'buff_atk') {
    nextPlayer.strength += card.value
    events.push({ type: 'buff_atk', amount: card.value })
  } else if (card.type === 'buff_next') {
    nextPlayer.nextMultiplier = card.value
    events.push({ type: 'buff_next', amount: card.value })
  }

  if (card.oncePerBattle) {
    events.push({ type: 'used_once', cardId })
  }

  return { player: nextPlayer, enemy: nextEnemy, events }
}

// 敵の行動を解決する。intentはターン開始時に表示した値をそのまま渡すこと
// (敵の状態は攻撃を受けて変わりうるため、ここで再計算すると表示と結果がずれる)。
// 戻り値: { player, enemy, events }
export function enemyAct(player, enemy, intent) {
  const events = []
  let nextPlayer = { ...player }
  let nextEnemy = {
    ...enemy,
    patternIndex: enemy.patternIndex + 1,
    lastIntent: intent.intent,
  }

  if (intent.intent === 'attack' || intent.intent === 'strong_attack') {
    const rawDamage = intent.value + enemy.atkBuff
    if (nextPlayer.dodgeActive) {
      nextPlayer.dodgeActive = false
      events.push({ type: 'miss', amount: rawDamage })
    } else {
      const mitigated =
        nextPlayer.blockPercent > 0
          ? Math.round(rawDamage * (1 - nextPlayer.blockPercent))
          : Math.max(0, rawDamage - nextPlayer.block)
      const blockUsed = rawDamage - mitigated
      nextPlayer.block = 0
      nextPlayer.blockPercent = 0
      const hpBefore = nextPlayer.hp
      nextPlayer.hp = Math.max(0, nextPlayer.hp - mitigated)
      events.push({
        type: 'enemy_attack',
        amount: mitigated,
        blocked: blockUsed,
        hpBefore,
        hpAfter: nextPlayer.hp,
      })
      if (
        mitigated > 0 &&
        nextPlayer.hp > 0 &&
        nextPlayer.hp <= nextPlayer.maxHp * 0.15
      ) {
        events.push({ type: 'near_death' })
      }
    }
  } else if (intent.intent === 'heal_self') {
    nextEnemy.hp = Math.min(nextEnemy.maxHp, nextEnemy.hp + intent.value)
    events.push({ type: 'enemy_heal', amount: intent.value })
  } else if (intent.intent === 'buff_self') {
    nextEnemy.atkBuff += intent.value
    events.push({ type: 'enemy_buff', amount: intent.value })
  }

  return { player: nextPlayer, enemy: nextEnemy, events }
}

export function rollGold(enemy) {
  const { goldMin, goldMax } = enemy
  return goldMin + Math.floor(Math.random() * (goldMax - goldMin + 1))
}
