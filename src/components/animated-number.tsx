"use client";

import { useEffect, useRef, useState } from "react";
import { currency } from "../lib/data";

/** Keep assistive technology on the final value while the visual value eases in. */
export function AnimatedNumber({
  value,
  money = false,
}: {
  value: number;
  money?: boolean;
}) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 700, 1);
      setDisplay(
        Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 4))),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  const format = (number: number) =>
    money ? currency(number) : String(number).padStart(2, "0");
  return (
    <span className="animated-number" aria-label={format(value)}>
      <span aria-hidden="true">{format(display)}</span>
    </span>
  );
}
