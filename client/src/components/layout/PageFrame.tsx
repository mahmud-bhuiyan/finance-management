import type { ReactNode } from "react";

type PageFrameProps = {
  children: ReactNode;
};

export const PageFrame = ({ children }: PageFrameProps) => (
  <main className="page-frame mx-auto flex w-full max-w-6xl flex-col gap-7 px-6 py-8 lg:px-8 lg:py-12">
    {children}
  </main>
);
