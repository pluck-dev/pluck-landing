import { Marquee } from "@/components/marquee";

/**
 * 사용하는 기술 스택 마퀴 — 클라이언트 로고 대신 실제 보유 역량 노출.
 * 한 줄에 너무 많지 않게 큐레이션, 카테고리 섞어서 폭 넓게.
 */
const STACK = [
  "NEXT.JS",
  "REACT",
  "TYPESCRIPT",
  "REACT NATIVE",
  "NODE.JS",
  "PYTHON",
  "FASTAPI",
  "NESTJS",
  "SUPABASE",
  "POSTGRESQL",
  "PRISMA",
  "TAILWIND",
  "FRAMER MOTION",
  "CLAUDE API",
  "OPENAI",
  "VERCEL",
  "AWS",
  "DOCKER",
  "FIGMA",
];

export function Logos() {
  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto mb-7 max-w-6xl px-5 sm:px-6">
        <p className="text-center text-[13.5px] font-semibold text-muted-foreground sm:text-[15px]">
          이 스택으로 만듭니다
        </p>
      </div>
      <Marquee items={STACK} />
    </section>
  );
}
