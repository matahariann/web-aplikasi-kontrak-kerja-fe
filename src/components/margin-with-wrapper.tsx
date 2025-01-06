import { ReactNode } from "react";

export default function MarginWidthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col md:ml-72 sm:border-r sm:border-zinc-700 h-[calc(100vh-4rem)]">
      {children}
    </div>
  );
}
