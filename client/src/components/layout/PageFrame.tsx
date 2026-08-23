import type { ReactNode } from "react";

type PageFrameProps = {
  children: ReactNode;
};

export const PageFrame = ({ children }: PageFrameProps) => (
  <main className="page-frame flex w-full flex-col gap-7 px-4 pb-6 pt-4 lg:px-5 lg:pb-10 lg:pt-6">
    {children}
  </main>
);
