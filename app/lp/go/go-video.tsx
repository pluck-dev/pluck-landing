"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/work-video";

/** A recorded loop in public/lp/go/video/: <name>.mp4 (H.264), <name>.webm (VP9), <name>.jpg (poster). */
export type Loop = { name: string; alt: string; device: "phone" | "browser"; url?: string };

const SIZE = { phone: [360, 780], browser: [960, 600] } as const;

/**
 * Muted demo loop in a device frame. The poster is a normal (lazy) image; the <video> has no sources until
 * it is within 400px of the viewport, so nothing is downloaded up front (preload="none" alone still lets
 * some browsers fetch metadata). Plays only while visible, pauses offscreen. Reduced motion: poster only.
 * A small pause button is always there (WCAG 2.2.2, loops are longer than 5s).
 */
export function GoVideo({ loop, eager = false, sizes }: { loop: Loop; eager?: boolean; sizes: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const visible = useRef(false);
  const loaded = useRef(false);
  const [w, h] = SIZE[loop.device];
  const src = `/lp/go/video/${loop.name}`;

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !near || reduced) return;
    if (!loaded.current) {
      loaded.current = true;
      node.load();
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting && !paused) node.play().catch(() => {});
        else node.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [near, reduced, paused]);

  return (
    <figure className={`gv gv-${loop.device}`}>
      {loop.device === "browser" && (
        <div className="gv-bar" aria-hidden="true">
          <span className="shot-dots">
            <i />
            <i />
            <i />
          </span>
          {loop.url && <span className="gv-url">{loop.url}</span>}
        </div>
      )}
      <div className="gv-screen" data-playing={playing || undefined}>
        <Image src={`${src}.jpg`} alt={loop.alt} width={w} height={h} sizes={sizes} loading={eager ? "eager" : "lazy"} priority={eager} />
        {!reduced && (
          <video
            ref={ref}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={() => {
              if (!visible.current) ref.current?.pause();
              else setPlaying(true);
            }}
            onPause={() => setPlaying(false)}
          >
            {near && <source src={`${src}.webm`} type="video/webm" />}
            {near && <source src={`${src}.mp4`} type="video/mp4" />}
          </video>
        )}
        {!reduced && near && (
          <button
            type="button"
            className="gv-toggle"
            onClick={() => setPaused(playing)}
            aria-label={playing ? "영상 일시정지" : "영상 재생"}
          >
            {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          </button>
        )}
      </div>
    </figure>
  );
}
