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
 * some browsers fetch metadata). Plays only while visible, pauses offscreen. Reduced motion: starts paused
 * with the play icon showing; one tap plays it (these are demos of real work, not decoration).
 * Pause (WCAG 2.2.2, loops are longer than 5s): the screen itself is a button; its small icon stays out of
 * sight until hover/focus, and stays visible while paused so a paused loop doesn't look broken.
 */
export function GoVideo({ loop, eager = false, sizes }: { loop: Loop; eager?: boolean; sizes: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [choice, setPaused] = useState<boolean | null>(null);
  const paused = choice ?? reduced;
  const visible = useRef(false);
  const loaded = useRef(false);
  const [w, h] = SIZE[loop.device];
  const src = `/lp/go/video/${loop.name}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
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
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || !near) return;
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
  }, [near, paused]);

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
        <video
          ref={ref}
          autoPlay={!reduced}
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
        {near && (
          // The whole screen is the pause control (tap/click); the icon only shows on hover/focus or while paused.
          <button
            type="button"
            className="gv-tap"
            data-paused={paused || undefined}
            onClick={() => setPaused(playing)}
            aria-label={playing ? "영상 일시정지" : "영상 재생"}
          >
            <span className="gv-icon" aria-hidden="true">
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </span>
          </button>
        )}
      </div>
    </figure>
  );
}

/** A hero clip: a phone loop plus its project name (tab) and an optional honesty label for that clip only. */
export type HeroClip = { name: string; label: string; alt: string; note?: string };

/**
 * Hero: one phone that plays real loops one after another with a soft crossfade, project names under it.
 * Only the clip on screen has sources; the next one gets its sources once the current one is playing,
 * so the first load fetches one video. Each clip plays once to its end, then the next fades in.
 * Tap the screen to pause (stops the cycle too). Reduced motion: starts paused on the first poster with
 * the play icon showing; a tap on the screen or a name plays it.
 */
export function GoHeroReel({ clips }: { clips: HeroClip[] }) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState<boolean[]>(() => clips.map(() => false));
  const [visible, setVisible] = useState(false);
  const [choice, setPaused] = useState<boolean | null>(null);
  const paused = choice ?? reduced;
  const [playing, setPlaying] = useState(-1);
  const [w, h] = SIZE.phone;

  const arm = (index: number) =>
    setArmed((prev) => (prev[index] ? prev : prev.map((value, i) => value || i === index)));

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "200px 0px",
      threshold: 0,
    });
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  // Play the active clip from the start; everything else pauses and rewinds (its poster is frame 0).
  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === active && visible && !paused) {
        if (video.readyState === 0) video.load();
        video.play().catch(() => {});
      } else {
        video.pause();
        if (i !== active) {
          const node = video;
          window.setTimeout(() => {
            if (node.paused) node.currentTime = 0;
          }, 800);
        }
      }
    });
  }, [active, visible, paused]);

  // A clip has sources once it was armed (next in line, or tapped), or it is on screen and the stage is near.
  const hasSources = (i: number) => armed[i] || (visible && i === active && !paused);
  const next = () => setActive((index) => (index + 1) % clips.length);
  const clip = clips[active];

  return (
    <div className="ghr">
      <div className="ghr-phone" ref={stageRef}>
        <div className="gv-screen" aria-live="off">
          {clips.map((item, i) => (
            <div className="ghr-slide" key={item.name} data-on={i === active || undefined}>
              <Image
                src={`/lp/go/video/${item.name}.jpg`}
                alt={i === active ? item.alt : ""}
                width={w}
                height={h}
                sizes="(max-width: 700px) 62vw, 290px"
                loading={i === 0 ? "eager" : "lazy"}
                priority={i === 0}
              />
              <video
                ref={(node) => {
                  videos.current[i] = node;
                }}
                muted
                playsInline
                preload={hasSources(i) ? "auto" : "none"}
                aria-hidden="true"
                data-playing={playing === i || undefined}
                onPlaying={() => {
                  setPlaying(i);
                  arm((i + 1) % clips.length);
                }}
                onPause={() => setPlaying((current) => (current === i ? -1 : current))}
                onEnded={() => {
                  if (i === active) next();
                }}
              >
                {hasSources(i) && <source src={`/lp/go/video/${item.name}.webm`} type="video/webm" />}
                {hasSources(i) && <source src={`/lp/go/video/${item.name}.mp4`} type="video/mp4" />}
              </video>
            </div>
          ))}
          <button
            type="button"
            className="gv-tap"
            data-paused={paused || undefined}
            onClick={() => setPaused(!paused)}
            aria-label={paused ? "영상 재생" : "영상 일시정지"}
          >
            <span className="gv-icon" aria-hidden="true">
              {paused ? <Play size={12} /> : <Pause size={12} />}
            </span>
          </button>
        </div>
      </div>
      <div className="ghr-tabs">
        {clips.map((item, i) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={i === active}
            onClick={() => {
              setActive(i);
              setPaused(false);
              arm(i);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="go-tiny ghr-note" aria-live="polite">
        {clip.note ?? ""}
      </p>
    </div>
  );
}
