// 敵の行動は2通りの定義方法がある。
// ・pattern: 配列を先頭から順に繰り返す固定ループ
// ・rule: 敵の現在状態(hp/atkBuff/lastIntent)を見て毎ターン判定する条件付きAI
//   (乱数は使わない。表示された次の行動は必ずそのまま実行される)
// intent: 'attack' | 'strong_attack' | 'heal_self' | 'buff_self'

// ゴブリン: HPが50%を切ると強化をやめて強攻撃偏重の「凶暴化」に入る。
// 凶暴化のタイミングはプレイヤーの削り方次第で変わるため、毎回同じ流れにはならない。
function goblinRule(enemy) {
  const hpPct = enemy.maxHp > 0 ? (enemy.hp / enemy.maxHp) * 100 : 0
  if (hpPct <= 50) {
    return enemy.lastIntent === 'strong_attack'
      ? { intent: 'attack', value: 9 }
      : { intent: 'strong_attack', value: 16 }
  }
  if (enemy.atkBuff < 6 && enemy.lastIntent !== 'buff_self') {
    return { intent: 'buff_self', value: 3 }
  }
  if (enemy.lastIntent === 'strong_attack') {
    return { intent: 'attack', value: 9 }
  }
  return { intent: 'strong_attack', value: 16 }
}

export const ENEMIES = {
  slime: {
    id: 'slime',
    name: 'スライム',
    maxHp: 22,
    goldMin: 14,
    goldMax: 20,
    pattern: [
      { intent: 'attack', value: 6 },
      { intent: 'attack', value: 6 },
      { intent: 'strong_attack', value: 12 },
    ],
  },
  goblin: {
    id: 'goblin',
    name: 'ゴブリン',
    maxHp: 32,
    goldMin: 18,
    goldMax: 26,
    rule: goblinRule,
  },
  shadow_swordsman: {
    id: 'shadow_swordsman',
    name: '影の剣士',
    maxHp: 40,
    goldMin: 22,
    goldMax: 30,
    pattern: [
      { intent: 'attack', value: 11 },
      { intent: 'strong_attack', value: 20 },
      { intent: 'attack', value: 11 },
    ],
  },
  ogre: {
    id: 'ogre',
    name: 'オーガ(強敵)',
    maxHp: 52,
    goldMin: 32,
    goldMax: 42,
    elite: true,
    pattern: [
      { intent: 'attack', value: 14 },
      { intent: 'attack', value: 14 },
      { intent: 'strong_attack', value: 26 },
    ],
  },
  dragon: {
    id: 'dragon',
    name: '古竜ヴォルグ',
    maxHp: 82,
    goldMin: 55,
    goldMax: 65,
    boss: true,
    pattern: [
      { intent: 'attack', value: 16 },
      { intent: 'strong_attack', value: 32 },
      { intent: 'heal_self', value: 11 },
      { intent: 'attack', value: 16 },
      { intent: 'strong_attack', value: 32 },
    ],
  },
}

export const RUN_SEQUENCE = [
  { type: 'battle', enemyId: 'slime' },
  { type: 'event' },
  { type: 'battle', enemyId: 'goblin' },
  { type: 'shop' },
  { type: 'battle', enemyId: 'shadow_swordsman' },
  { type: 'event' },
  { type: 'shop' },
  { type: 'battle', enemyId: 'ogre' },
  { type: 'shop' },
  { type: 'battle', enemyId: 'dragon' },
]

export function intentLabel(intent) {
  switch (intent) {
    case 'attack':
      return '攻撃'
    case 'strong_attack':
      return '強攻撃'
    case 'heal_self':
      return '自己回復'
    case 'buff_self':
      return '強化'
    default:
      return intent
  }
}
