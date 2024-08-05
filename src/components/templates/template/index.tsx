import { Card } from "@/components/ui/card";
import { templateParametersList } from "@/constants";
import { TemplateType } from "@/types/shared";
import React from "react";

type Props = {
  template: TemplateType;
};

export const Template: React.FC<Props> = ({ template }) => {
  function replaceTemplateValues(template?: string): string {
    if (!template) {
      return "";
    }
    let result = template;

    templateParametersList.forEach((param) => {
      const regex = new RegExp(`{{\\s*${param.name.slice(1)}\\s*}}`, "g");
      result = result.replace(regex, `<b>${param.defaultValue}</b>`);
    });

    return result;
  }
  return (
    <Card className="rounded-sm">
      <h3 className="text-xs font-bold text-gray-400 uppercase">Title: </h3>
      <h4 className=" mt-1 text-sm">{template.title}</h4>
      <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">
        Language:{" "}
      </h3>
      <h4 className=" mt-1 text-sm">{template.language}</h4>
      <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">
        Message:{" "}
      </h3>
      <h4
        className=" mt-1 text-sm"
        dangerouslySetInnerHTML={{
          __html: replaceTemplateValues(template?.body),
        }}
      />
      <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">
        States:{" "}
        {template?.state?.split(",")?.map((state) => (
          <span key={state} className="font-normal inline-block ml-0.5">
            {state}
          </span>
        ))}
      </h3>
      <h3 className="text-xs font-bold text-gray-400 uppercase mt-2">
        Type:{" "}
        <span className="font-normal inline-block ml-0.5">
          {template?.template_type}
        </span>
      </h3>
    </Card>
  );
};
