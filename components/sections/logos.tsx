import { Marquee } from "@/components/marquee";

const CLIENTS = [
  "SAMSUNG",
  "KAKAO",
  "TOSS",
  "HYUNDAI",
  "NAVER",
  "BAEMIN",
  "HYBE",
  "MUSINSA",
  "29CM",
  "LINE",
  "COUPANG",
  "CJ",
  "AMOREPACIFIC",
];

export function Logos() {
  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto mb-7 max-w-6xl px-5 sm:px-6">
        <p className="text-center text-[13.5px] font-semibold text-muted-foreground sm:text-[15px]">
          다음 브랜드들과 함께 만들었습니다
        </p>
      </div>
      <Marquee items={CLIENTS} />
    </section>
  );
}
