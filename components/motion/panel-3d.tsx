"use client";

import { ReactNode, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "motion/react";
import { cn } from "@/lib/utils";

type Panel3DProps = {
  children: ReactNode;
  className?: string;
  /** 스크롤 진입 시 누워있다 일어서는 각도(deg) */
  tilt?: number;
  /** 마우스 호버 시 기울기 강도(deg) */
  hover?: number;
  /** 스크롤 패럴랙스 깊이(px) */
  depth?: number;
};

/**
 * Panel3D — 스크롤에 따라 3D로 누웠다 일어서는 패널 + 마우스 틸트.
 * Savee의 "3D Panels / Parallax" 모션 템플릿 감각을 카드 갤러리에 부여한다.
 * 부모에 perspective가 필요하므로 자체적으로 perspective 컨테이너를 둔다.
 */
export function Panel3D({
  children,
  className,
  tilt = 18,
  hover = 8,
  depth = 60,
}: Panel3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  // 진입할 때 rotateX가 tilt → 0 으로 펴지고, 살짝 떠오른다
  const rotateXScroll = useTransform(scrollYProgress, [0, 1], [tilt, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [depth, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.35, 1]);
  const smoothRotateX = useSpring(rotateXScroll, {
    stiffness: 120,
    damping: 24,
  });
  const smoothY = useSpring(y, { stiffness: 120, damping: 24 });

  // 마우스 위치 → 추가 틸트
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const hoverRX = useSpring(my, { stiffness: 200, damping: 18 });
  const hoverRY = useSpring(mx, { stiffness: 200, damping: 18 });

  const rotateX = useTransform(
    [smoothRotateX, hoverRX],
    ([a, b]: number[]) => a + b
  );
  const transform = useMotionTemplate`perspective(1100px) translateY(${smoothY}px) rotateX(${rotateX}deg) rotateY(${hoverRY}deg)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px * hover);
    my.set(-py * hover);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        transform,
        opacity,
        transformStyle: "preserve-3d",
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
