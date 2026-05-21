import { cn } from "@/lib/utils";

type GlitchTextProps = {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "div";
};

export function GlitchText({
  children,
  className,
  as: Tag = "span",
}: GlitchTextProps) {
  return (
    <Tag
      data-text={children}
      className={cn("glitch font-heading tracking-tight", className)}
    >
      {children}
    </Tag>
  );
}
