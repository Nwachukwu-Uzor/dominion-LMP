import React from "react";

type Props = {
  handleAddDocument: (data: { title: string; path: string }) => void;
};

export const AddDocumentForm: React.FC<Props> = ({ handleAddDocument }) => {
  return <div>AddDocumentForm</div>;
};
