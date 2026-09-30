import TwoInk from "./TwoInk";

// A line-drawn open book, pages curving from the spine. Blue-led on both
// sites by default (blue means the written work). Decorative only.
export default function OpenBook({ lead = "blue", ...props }) {
  return (
    <TwoInk viewBox="0 0 260 160" lead={lead} {...props}>
      <path d="M130 40C100 22 50 22 16 34V136C50 124 100 124 130 142C160 124 210 124 244 136V34C210 22 160 22 130 40Z" />
      <path d="M130 40V142" />
      <path d="M8 44V146C50 134 100 136 130 150C160 136 210 134 252 146V44" />
      <path d="M34 56C60 48 88 48 112 58M34 76C60 68 88 68 112 78M34 96C56 90 76 90 96 96" opacity=".55" />
      <path d="M148 58C172 48 200 48 226 56M148 78C172 68 200 68 226 76M164 96C184 90 204 90 226 96" opacity=".55" />
    </TwoInk>
  );
}
