export const EVENTS = {
  spring: {
    id: 'spring',
    name: '休息の泉',
    flavor: '泉のほとりで一息つける。無理をして進むか、ここで休むか。',
    choices: [
      {
        label: '泉の水を飲む',
        result: 'HPが20%回復する。',
        effect: 'heal_percent',
        value: 0.2,
      },
      {
        label: '無理をして進む',
        result: '最大HP-5。代わりに「強化」カードを手に入れる。',
        effect: 'risk_unlock_buff_atk',
        value: 5,
      },
    ],
  },
  merchant: {
    id: 'merchant',
    name: '謎の商人',
    flavor: '怪しい商人が珍しいカードを売っている。',
    choices: [
      {
        label: '50ゴールドでレアカードを買う',
        result: '「集中」カードを手に入れる。',
        effect: 'buy_unlock_buff_next',
        value: 50,
      },
      {
        label: '関わらずに通り過ぎる',
        result: 'ゴールド+30。',
        effect: 'gain_gold',
        value: 30,
      },
    ],
  },
  altar: {
    id: 'altar',
    name: '訓練の跡地',
    flavor: '古い訓練場の跡。何か得られるかもしれない。',
    choices: [
      {
        label: '型を叩き込む',
        result: 'このラン中、攻撃カードの威力が永続的に+2。',
        effect: 'permanent_atk_boost',
        value: 2,
      },
      {
        label: '休息する',
        result: 'HPが満タンまで回復する。',
        effect: 'heal_full',
        value: 0,
      },
    ],
  },
}

export function pickRandomEvent() {
  const ids = Object.keys(EVENTS)
  const id = ids[Math.floor(Math.random() * ids.length)]
  return EVENTS[id]
}
