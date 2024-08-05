import React from "react";
import { TemplateType } from "@/types/shared";
import { Template } from "../template";

type Props = {
  templates: TemplateType[];
};

export const TemplatesList: React.FC<Props> = ({ templates }) => {
  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      {templates.map((template) => (
        <Template key={template.id} template={template} />
      ))}
    </article>
  );
};
