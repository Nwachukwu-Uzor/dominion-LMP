import React from "react";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

type Props = {
  url: string;
};

export const PDFViewer: React.FC<Props> = ({url}) => {
  return (
    <div className="max-h-[400px] w-full overflow-y-scroll">
      <Viewer fileUrl={url} />
    </div>
  );
};
