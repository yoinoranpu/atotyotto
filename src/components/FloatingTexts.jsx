export default function FloatingTexts({ texts }) {
  if (!texts || texts.length === 0) return null
  return (
    <div className="floating-texts">
      {texts.map((t) => (
        <div
          key={t.id}
          className={`floating-text floating-text--${t.kind} floating-text--tier-${t.tier ?? 'medium'}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}
