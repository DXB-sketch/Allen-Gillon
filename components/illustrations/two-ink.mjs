import { createElement } from "react";

// The TwoInk implementation, written without JSX so the node unit tests
// (tests/illustrations.test.mjs) can render it directly. Import it through
// ./TwoInk.jsx, which carries the usage notes.

export default function TwoInk({
  viewBox,
  className = "",
  children,
  draw = false,
  lead = "site",
  ground = "paper",
  offset = 3,
  delay,
  style,
  ...rest
}) {
  const classes = ["two-ink"];
  if (lead === "red" || lead === "blue") classes.push(`two-ink--${lead}`);
  if (ground === "ink") classes.push("two-ink--on-ink");
  if (draw) classes.push("two-ink--draw");
  if (className) classes.push(className);

  const vars = { "--ink-offset": `${offset}px` };
  if (delay != null) vars["--motion-delay"] = typeof delay === "number" ? `${delay}ms` : delay;

  return createElement(
    "svg",
    {
      ...rest,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox,
      className: classes.join(" "),
      style: style ? { ...vars, ...style } : vars,
      "aria-hidden": "true",
      focusable: "false",
      "data-motion": draw ? "draw" : rest["data-motion"],
    },
    // The misregistered second ink sits under the lead ink, like a second
    // pass through the press that did not quite line up.
    createElement("g", { className: "two-ink__second" }, children),
    createElement("g", { className: "two-ink__lead" }, children),
  );
}
