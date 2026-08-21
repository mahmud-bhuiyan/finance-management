import type { ReactNode } from "react";

type PageFrameProps = {
  children: ReactNode;
  maxWidth?: "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl";
};

export const PageFrame = ({
  children,
  maxWidth = "max-w-5xl",
}: PageFrameProps) => (
  <main
    className={`mx-auto flex w-full ${maxWidth} flex-col gap-6 px-6 py-8 lg:py-10`}
  >
    {children}
  </main>
);
