interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
}

export function SectionHeading({ label, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-16">
      {/* Gold label with accent rule */}
      <div className="mb-4 flex items-center gap-4">
        <span className="text-label">{label}</span>
        <hr className="editorial-rule-gold" />
      </div>

      {/* Serif title */}
      <h2 className="text-section-title text-foreground">{title}</h2>

      {description && (
        <p className="mt-4 max-w-2xl text-editorial-body">{description}</p>
      )}
    </div>
  );
}
