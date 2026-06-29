/**
 * DisplaceDefs — 사이트 전역에서 공유하는 SVG 필터 정의.
 * `.displace-art`가 호버 시 참조하는 #liquidDisplace 한 개만 정의한다(중복 ID 방지).
 * 페이지당 1회만 마운트할 것.
 */
export function DisplaceDefs() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter id="liquidDisplace">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.016"
            numOctaves={2}
            seed={7}
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.012 0.016; 0.02 0.01; 0.012 0.016"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={26}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
