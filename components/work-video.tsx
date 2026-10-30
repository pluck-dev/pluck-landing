"use client";

import { Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ProjectVideo } from "@/lib/portfolio";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Muted demo loop layered over its poster (`children`, a server-rendered
 * next/image) so the still is the first paint/LCP and the frame never shifts.
 * No `poster` attribute: the optimized next/image underneath already is one.
 * Plays only while on screen; reduced-motion users start it themselves.
 */
export function WorkVideo({
  video,
  children,
}: {
  video: ProjectVideo;
  children: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  // null = follow autoplay rules; true/false = the visitor pressed the button.
  const [choice, setChoice] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const wantPlay = visible && (choice ?? !reduced);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (wantPlay) {
      node.play().catch(() => {
        // Autoplay refused (data saver etc.): keep the poster, offer the big play button.
        setBlocked(true);
      });
    } else {
      node.pause();
    }
  }, [wantPlay]);

  return (
    <div className="work-video" data-started={started || undefined}>
      {children}
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={video.alt}
        onPlaying={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
      >
        {video.webm ? <source src={video.webm} type="video/webm" /> : null}
        <source src={video.src} type="video/mp4" />
      </video>
      <button
        type="button"
        className="work-video-toggle"
        data-idle={(!playing && (reduced || blocked || choice === false)) || undefined}
        onClick={() => setChoice(!playing)}
        aria-label={playing ? "영상 일시정지" : "영상 재생"}
      >
        {playing ? (
          <Pause size={18} aria-hidden="true" />
        ) : (
          <Play size={20} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/**
 * Card hover preview (desktop pointers only). The source is attached on the
 * first hover so the grid never downloads video up front.
 */
export function CardPreview({ video }: { video: ProjectVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const card = node?.closest(".work-card-link");
    if (!node || !card || reduced) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const enter = () => {
      if (!canHover.matches) return;
      if (!node.getAttribute("src")) node.src = video.src;
      node.play().catch(() => {});
    };
    const leave = () => {
      node.pause();
      setShown(false);
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
    };
  }, [reduced, video.src]);

  return (
    <video
      ref={ref}
      className="work-card-video"
      data-shown={shown || undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setShown(true)}
    />
  );
}
