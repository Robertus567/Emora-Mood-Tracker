"use client";

import Link from "next/link";
import { sfx } from "@/lib/sfx";

export default function SfxButton({
  href,
  as,
  onClick,
  onMouseEnter,
  disabled,
  soundOnClick = "click",
  children,
  ...rest
}) {
  const handleEnter = (e) => {
    if (!disabled) sfx.hover();
    onMouseEnter?.(e);
  };
  const handleClick = (e) => {
    if (!disabled) {
      if (soundOnClick && sfx[soundOnClick]) sfx[soundOnClick]();
    }
    onClick?.(e);
  };

  if (href && !as) {
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link href={href} onMouseEnter={handleEnter} onClick={handleClick} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} onMouseEnter={handleEnter} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onMouseEnter={handleEnter}
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
