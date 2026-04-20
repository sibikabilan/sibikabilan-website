interface HorizontalRuleProps {
  variant?: "heavy" | "thin" | "gold";
  className?: string;
}

export function HorizontalRule({ variant = "heavy", className = "" }: HorizontalRuleProps) {
  const styles = {
    heavy: "editorial-rule",
    thin: "editorial-rule-thin",
    gold: "editorial-rule-gold",
  };

  return <hr className={`${styles[variant]} ${className}`} />;
}
