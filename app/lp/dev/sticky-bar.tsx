"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { KAKAO_URL } from "./config";

/**
 * Mobile-only bottom bar: [30초 견적 시작] → quiz, [만든 서비스 보기] → S3 (+ Kakao when KAKAO_URL is set).
 * Hidden while the quiz/form section is on screen so it never covers the submit button.
 */
export function StickyBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const quiz = document.getElementById("quiz");
    if (!quiz || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      rootMargin: "0px 0px -35% 0px",
    });
    observer.observe(quiz);
    return () => observer.disconnect();
  }, []);

  const off = hidden ? -1 : undefined;
  return (
    <div className="ld-bar" data-hidden={hidden ? "" : undefined} aria-hidden={hidden || undefined}>
      <a className="button button-primary" href="#quiz" tabIndex={off}>
        30초 견적 시작
      </a>
      <a className="button ld-bar-ghost" href="#work" tabIndex={off}>
        만든 서비스 보기
      </a>
      {KAKAO_URL && (
        <a
          className="button ld-kakao ld-bar-kakao"
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={off}
          aria-label="카카오톡 상담 (새 창)"
        >
          <MessageCircle size={18} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
