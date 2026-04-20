interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  alternate?: boolean;
  fullBleed?: boolean;
}

export function SectionWrapper({
  children,
  id,
  className = "",
  alternate = false,
  fullBleed = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`py-24 md:py-32 ${alternate ? "bg-background-alt" : "bg-background"} ${className}`}
    >
      {fullBleed ? children : (
        <div className="mx-auto max-w-6xl px-6">{children}</div>
      )}
    </section>
  );
}
