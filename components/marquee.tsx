import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
  reverse?: boolean;
  slow?: boolean;
};

export function Marquee({ items, className, reverse, slow }: MarqueeProps) {
  const duplicated = [...items, ...items];
  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-12 pr-12",
          slow ? "animate-[marquee_60s_linear_infinite]" : "animate-[marquee_28s_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          "group-hover:[animation-play-state:paused]"
        )}
      >
        {duplicated.map((text, i) => (
          <span
            key={`${text}-${i}`}
            className="font-heading text-2xl font-bold uppercase tracking-[0.12em] text-muted-foreground/80 sm:text-3xl"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
