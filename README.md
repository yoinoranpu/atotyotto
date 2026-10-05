# あと一手

> 敵の次の一手は分かる。だが、自分の次の一手は選べない。

毎ターン、敵の次の行動を確認してから、ランダムに提示される5枚の行動カードから1枚を選んで戦う短時間ローグライク。

## 開発

```bash
npm install
npm run dev
```

```bash
npm run lint   # oxlint
npm run build  # 本番ビルド
```

## 技術スタック

React 19 + Vite + Zustand。外部アセット・サーバーなし(効果音もWeb Audio APIでその場合成)。

## 構成

- `src/data/` — カード・敵・イベントの定義
- `src/systems/battleEngine.js` — 戦闘の純粋ロジック(山札循環、ダメージ計算など)
- `src/store/useGameStore.js` — ゲーム全体の状態管理(Zustand)
- `src/components/` — 画面ごとのUI
