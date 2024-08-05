import React from "react";

export const Container = ({ children }: { children?: React.ReactNode }) => {
  return (
    <article className="flex items-center justify-center w-full">
      <div className="w-full px-4 lg:px-6">{children}</div>
    </article>
  );
};
