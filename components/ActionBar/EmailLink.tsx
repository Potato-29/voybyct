"use client";

import type { MouseEvent, ReactNode } from "react";
import { gmailComposeUrl } from "@/lib/email";
import { site } from "@/lib/site";

type Props = {
  className?: string;
  children: ReactNode;
};

// Desktop: Gmail compose in a new tab, since mailto: depends on a configured mail app.
// Touch devices: mailto:, which opens the phone's mail app.
export default function EmailLink({ className, children }: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(pointer: coarse)").matches) {
      event.preventDefault();
      window.location.href = `mailto:${site.email}`;
    }
  }

  return (
    <a
      className={className}
      href={gmailComposeUrl(site.email)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
