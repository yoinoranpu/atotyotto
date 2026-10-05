const SHAPES = {
  player: (
    <g>
      <circle cx="60" cy="38" r="16" fill="#cfe8d8" />
      <path d="M38 100 Q38 62 60 58 Q82 62 82 100 Z" fill="#4f8f63" />
      <rect x="54" y="20" width="12" height="10" rx="2" fill="#8a6a3a" />
      <rect x="86" y="50" width="8" height="40" rx="3" fill="#b8c4cc" />
      <rect x="82" y="46" width="16" height="8" rx="2" fill="#e8c468" />
    </g>
  ),
  slime: (
    <g>
      <path
        d="M24 92 Q20 56 60 50 Q100 56 96 92 Q96 104 60 104 Q24 104 24 92 Z"
        fill="#6fbf7a"
      />
      <circle cx="48" cy="74" r="5" fill="#1d3320" />
      <circle cx="74" cy="74" r="5" fill="#1d3320" />
    </g>
  ),
  goblin: (
    <g>
      <path d="M44 30 L34 12 L52 26 Z" fill="#6c9a4d" />
      <path d="M76 30 L86 12 L68 26 Z" fill="#6c9a4d" />
      <circle cx="60" cy="40" r="20" fill="#7cb259" />
      <circle cx="52" cy="40" r="3" fill="#1d2b12" />
      <circle cx="68" cy="40" r="3" fill="#1d2b12" />
      <path d="M40 100 Q40 66 60 62 Q80 66 80 100 Z" fill="#5c8a42" />
      <rect x="86" y="58" width="8" height="34" rx="2" fill="#7a5a34" />
    </g>
  ),
  shadow_swordsman: (
    <g>
      <path d="M60 14 L84 42 L72 100 L48 100 L36 42 Z" fill="#3a3550" />
      <circle cx="60" cy="40" r="12" fill="#1b1826" />
      <circle cx="55" cy="38" r="2.5" fill="#c084fc" />
      <circle cx="65" cy="38" r="2.5" fill="#c084fc" />
      <rect x="86" y="30" width="7" height="62" rx="2" fill="#aeb4c0" />
    </g>
  ),
  ogre: (
    <g>
      <path d="M42 26 L34 10 L48 24 Z" fill="#8a7050" />
      <path d="M78 26 L86 10 L72 24 Z" fill="#8a7050" />
      <circle cx="60" cy="42" r="24" fill="#9c7f5c" />
      <circle cx="50" cy="42" r="3.5" fill="#2a1f12" />
      <circle cx="70" cy="42" r="3.5" fill="#2a1f12" />
      <path d="M32 102 Q32 66 60 62 Q88 66 88 102 Z" fill="#846a4a" />
      <rect x="90" y="54" width="10" height="44" rx="3" fill="#5c4530" />
    </g>
  ),
  dragon: (
    <g>
      <path d="M18 70 Q40 30 60 46 Q80 30 102 70 Q78 60 60 68 Q42 60 18 70 Z" fill="#7a3b5e" />
      <circle cx="60" cy="40" r="22" fill="#9c4f72" />
      <circle cx="52" cy="38" r="3.5" fill="#fff176" />
      <circle cx="68" cy="38" r="3.5" fill="#fff176" />
      <path d="M48 20 L54 6 L60 20 Z" fill="#6a2f4c" />
      <path d="M66 20 L72 6 L78 20 Z" fill="#6a2f4c" />
      <path d="M44 100 Q44 70 60 66 Q76 70 76 100 Z" fill="#8a4468" />
    </g>
  ),
}

export default function Sprite({ kind, className = '' }) {
  const shape = SHAPES[kind] || SHAPES.slime
  return (
    <div className={`sprite ${className}`}>
      <svg viewBox="0 0 120 112" width="96" height="90">
        {shape}
      </svg>
    </div>
  )
}
