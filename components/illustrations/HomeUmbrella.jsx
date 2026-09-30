import TwoInk from "./TwoInk";

// A striped cafe umbrella on its pole, like the ones behind Allen in the
// waterfront photo. Sits in the margin of the home page venue handbill.
// Decorative only; see TwoInk.jsx for the rules.
export default function HomeUmbrella(props) {
  return (
    <TwoInk viewBox="0 0 220 260" {...props}>
      <path d="M12 92C40 46 72 28 110 24C148 28 180 46 208 92" />
      <path d="M12 92C26 84 40 84 54 92C68 84 82 84 96 92C110 84 124 84 138 92C152 84 166 84 180 92C190 86 200 86 208 92" />
      <path d="M110 24C92 44 80 66 75 88M110 24C128 44 140 66 145 88M110 24C102 48 99 70 98 90M110 24C118 48 121 70 122 90" />
      <path d="M40 60L54 92M66 40L75 88M154 40L145 88M180 60L166 92" opacity=".55" />
      <path d="M110 24V14M106 12H114" />
      <path d="M110 92V236" />
      <path d="M78 248C88 238 132 238 142 248M110 236V248" />
      <path d="M62 170H158M76 170V226M144 170V226" opacity=".55" />
    </TwoInk>
  );
}
