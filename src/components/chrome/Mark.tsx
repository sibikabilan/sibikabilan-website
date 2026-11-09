/**
 * Sibi's mark: a dove whose wing is a pen nib.
 *
 * The dove comes from his name. King Sibi of Tamil legend gave his own flesh,
 * weighed on a scale, to save a dove from a hawk: the person at your mercy
 * comes first. The wing is a fountain pen nib, breather hole and all, for
 * the writing. One shape, one colour (currentColor), transparent everywhere else.
 */
export const MARK_VIEWBOX = "40 70 944 944";
export const MARK_BODY =
  "M292 866C451 837 581 719 645 548C685 437 740 362 821 362C861 362 887 378 913 401C930 416 949 427 970 437C894 453 853 497 843 567C836 623 835 669 808 729C752 857 617 944 482 944C402 944 337 917 292 866ZM851 434A18 18 0 1 0 815 434A18 18 0 1 0 851 434Z";
export const MARK_WING =
  "M103 117C158 145 218 167 280 183C277 289 366 356 477 405C550 437 605 471 638 537C617 603 566 660 489 682C386 707 281 622 222 535C190 489 174 448 164 394C146 296 123 199 97 124L199 229C191 241 196 256 208 262C220 268 234 262 238 250C243 237 236 223 224 219C217 216 210 217 205 220ZM103 117Z";
export const MARK_TAIL = "M54 701C162 663 243 652 329 678C382 695 426 704 475 693C458 760 392 835 315 856C218 890 104 806 54 701Z";

export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox={MARK_VIEWBOX} fill="currentColor" aria-hidden className={className}>
      <path d={MARK_WING} fillRule="evenodd" />
      <path d={MARK_BODY} fillRule="evenodd" />
      <path d={MARK_TAIL} />
    </svg>
  );
}
