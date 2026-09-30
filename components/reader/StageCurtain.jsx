import TwoInk from "../illustrations/TwoInk";

// A line-drawn stage: the pelmet, two drapes gathered back and the boards.
// Drawn for the end of a school-play preview (the curtain comes down on the
// free pages). Blue-led like every drawing of the written work. Decorative.
export default function StageCurtain({ lead = "blue", ...props }) {
  return (
    <TwoInk viewBox="0 0 240 170" lead={lead} {...props}>
      {/* proscenium and pelmet */}
      <path d="M14 20C80 14 160 14 226 20" />
      <path d="M14 20V156M226 20V156" />
      <path d="M14 34C40 46 64 46 88 34C104 44 136 44 152 34C176 46 200 46 226 34" />
      {/* left drape, gathered by a tie */}
      <path d="M22 36C30 74 44 100 70 112C58 126 46 142 40 156" />
      <path d="M34 38C40 70 50 92 70 112" opacity=".55" />
      <path d="M48 40C52 66 58 88 70 112" opacity=".55" />
      <path d="M64 112C68 110 72 110 76 113" />
      {/* right drape */}
      <path d="M218 36C210 74 196 100 170 112C182 126 194 142 200 156" />
      <path d="M206 38C200 70 190 92 170 112" opacity=".55" />
      <path d="M192 40C188 66 182 88 170 112" opacity=".55" />
      <path d="M164 113C168 110 172 110 176 112" />
      {/* the boards */}
      <path d="M6 156C84 152 156 152 234 156" />
      <path d="M92 164C110 162 130 162 148 164" opacity=".55" />
    </TwoInk>
  );
}
