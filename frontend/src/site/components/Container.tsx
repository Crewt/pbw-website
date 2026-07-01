import type { ReactNode } from "react";

// The site's content column: max 1200px, 40px gutters (20px on small screens).
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-5 md:px-10 ${className}`}>{children}</div>;
}
