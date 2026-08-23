import type { HTMLAttributes, ReactNode } from "react";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "div";
  children: ReactNode;
  padded?: boolean;
};

export const Surface = ({
  as: Tag = "section",
  className = "",
  children,
  padded = true,
  ...props
}: SurfaceProps) => (
  <Tag className={`surface ${padded ? "p-5" : ""} ${className}`} {...props}>
    {children}
  </Tag>
);
