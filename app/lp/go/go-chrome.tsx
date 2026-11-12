"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QUIZ_STEP_COUNT } from "@/components/quote/quote-quiz";

/** Fired by GoQuiz whenever its step changes: answered = finished questions (0..5). */
export const GO_QUIZ_EVENT = "go:quiz";
export type GoQuizDetail = { answered: number; done: boolean };

/**
 * Page chrome for /lp/go:
 * - top bar: wordmark + the chapter you're in ("02 증거"), with a 2px scroll-progress line under it
 * - floating chip (bottom-right): "견적 계산 n/5" mirrors quiz progress and jumps to it.
 *   Hidden while the quiz itself is on screen so it never covers the form.
 */
export function GoChrome() {
  const lineRef = useRef<HTMLSpanElement>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<GoQuizDetail>({ answered: 0, done: false });
  const [quizOnScreen, setQuizOnScreen] = useState(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      const mark = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= mark) current = section.dataset.chapter ?? null;
      }
      setChapter(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onQuiz = (event: Event) => setQuiz((event as CustomEvent<GoQuizDetail>).detail);
    window.addEventListener(GO_QUIZ_EVENT, onQuiz);
    const target = document.getElementById("quiz");
    let observer: IntersectionObserver | undefined;
    if (target && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => setQuizOnScreen(entry.isIntersecting), {
        rootMargin: "0px 0px -25% 0px",
      });
      observer.observe(target);
    }
    return () => {
      window.removeEventListener(GO_QUIZ_EVENT, onQuiz);
      observer?.disconnect();
    };
  }, []);

  const [no, name] = chapter ? chapter.split(" ") : [];
  const ratio = quiz.done ? 1 : quiz.answered / QUIZ_STEP_COUNT;
  const hidden = quizOnScreen;

  return (
    <>
      <header className="go-top">
        <div className="go-wrap go-top-row">
          <Link className="go-wordmark" href="/" aria-label="PLUCK 홈">
            pluck<span>®</span>
          </Link>
          <p className="go-top-chapter" aria-live="off">
            {no ? (
              <>
                <span>{no}</span>
                <b>{name}</b>
                <span className="go-top-of">/ 05</span>
              </>
            ) : (
              <b>외주 개발 · 상담 무료</b>
            )}
          </p>
        </div>
        <span className="go-top-line" ref={lineRef} aria-hidden="true" />
      </header>

      <a
        className="go-chip"
        href="#quiz"
        data-hidden={hidden ? "" : undefined}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
      >
        <svg className="go-chip-ring" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="15" />
          <circle cx="18" cy="18" r="15" pathLength={1} style={{ strokeDashoffset: 1 - ratio }} />
        </svg>
        <span className="go-chip-text">
          <small>{quiz.done ? "결과 나왔어요" : "견적 계산"}</small>
          <b>
            {quiz.done ? "결과 보기" : `${quiz.answered}/${QUIZ_STEP_COUNT}`}
          </b>
        </span>
      </a>
    </>
  );
}
