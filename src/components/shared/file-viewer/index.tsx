import React from "react";
import { getBase64FileType } from "@/utils";
import { PDFViewer } from "../";

type Props = {
  url: string;
  maxWidth?: number;
};

const FILE_TYPES = {
  PDF: "application/pdf",
  IMAGES: ["image/png", "image/svg", "image/jpg", "image/jpeg"],
};

export const FileViewer: React.FC<Props> = ({ url, maxWidth }) => {
  const fileType = getBase64FileType(url);

  if (fileType === FILE_TYPES.PDF) {
    return <PDFViewer url={url} />;
  }

  if (fileType && FILE_TYPES.IMAGES.includes(fileType)) {
    return (
      <img
        src={url}
        alt="Instruction_file"
        className="min-h-[100px] w-full object-center"
        style={{
          maxWidth: maxWidth,
        }}
      />
    );
  }
  return (
    <div>
      File type <strong>{fileType}</strong> not supported
    </div>
  );
};
