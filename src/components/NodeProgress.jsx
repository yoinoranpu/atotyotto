import { RUN_SEQUENCE } from '../data/enemies.js'

const ICONS = { battle: '⚔', event: '?', shop: '$' }

export default function NodeProgress({ nodeIndex }) {
  return (
    <div className="node-progress">
      {RUN_SEQUENCE.map((node, i) => (
        <div
          key={i}
          className={
            'node-progress__dot' +
            (i === nodeIndex ? ' node-progress__dot--current' : '') +
            (i < nodeIndex ? ' node-progress__dot--done' : '') +
            (node.boss ? ' node-progress__dot--boss' : '')
          }
        >
          {ICONS[node.type]}
        </div>
      ))}
    </div>
  )
}
