"use client";
import { useCallback, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const requestClose = useCallback(() => {
    const dialog = ref.current;
    const backdrop = dialog?.parentElement;
    if (closing.current) return;
    if (
      !dialog?.animate ||
      !backdrop?.animate ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      onClose();
      return;
    }
    closing.current = true;
    const options: KeyframeAnimationOptions = {
      duration: 160,
      easing: "ease-in",
      fill: "forwards",
    };
    const fade = backdrop.animate([{ opacity: 1 }, { opacity: 0 }], options);
    const shrink = dialog.animate(
      [
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(8px) scale(.98)" },
      ],
      options,
    );
    void Promise.allSettled([fade.finished, shrink.finished]).then(onClose);
  }, [onClose]);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    const el = ref.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.querySelector<HTMLElement>("input,button,select")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
      if (e.key === "Tab") {
        const nodes = el?.querySelectorAll<HTMLElement>(
          "button,input,select,textarea,a[href]",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = previousOverflow;
      prev?.focus();
    };
  }, [requestClose]);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
      >
        <div className="section-heading">
          <h2>{title}</h2>
          <button
            className="icon-btn"
            onClick={requestClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={"badge " + String(children).toLowerCase().replaceAll(" ", "-")}
    >
      <i />
      {children}
    </span>
  );
}
export function Empty({
  title = "Nothing here yet",
  description = "Try a different search or add your first record.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty">
      <Search size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function download(
  name: string,
  body: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
