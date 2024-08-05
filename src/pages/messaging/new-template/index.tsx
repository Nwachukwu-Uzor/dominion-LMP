import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FETCH_ALL_LANGUAGES, SESSION_STORAGE_KEY, templateParametersList } from "@/constants";
import { dummyStates } from "@/data";
import { MultiSelect } from "@/components/ui/multi-select";
import { TemplateService } from "@/services";
import { ClipLoader } from "react-spinners";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

type ParameterType = {
  id: number;
  name: string;
  description: string;
  defaultValue: string;
};

const schema = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(2, "Title must be at least 2 characters long."),
  language: z
    .string({
      required_error: "Language is required",
    })
    .min(2, "Language must be at least 2 characters long."),
  body: z
    .string({
      required_error: "Message is required",
    })
    .min(6, "Message must be at least 6 characters"),
  state: z
    .string({ required_error: "state(s) is required" })
    .min(1, "Please select at least one state"),
  template_type: z
    .string({
      required_error: "Template type is required",
    })
    .min(2, "Template type is required"),
});

type FormFields = z.infer<typeof schema>;

const stateOptions = dummyStates.map((state) => ({
  ...state,
  value: state.name,
  label: state.name,
}));

const ALERT_TYPE_OPTIONS = [
  {
    id: "1",
    label: "Email",
    value: "email",
  },
  {
    id: "2",
    label: "SMS",
    value: "sms",
  },
];

const NewTemplate = () => {
  const [content, setContent] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [parametersPlaceholders, setParametersPlaceholders] = useState(
    templateParametersList.map((it) => ({ value: "", ...it }))
  );

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const templateService = new TemplateService(token);

  const {isLoading: isLoadingLanguages} = useQuery({
    queryKey: [FETCH_ALL_LANGUAGES],
    queryFn: async() => {
      const data = await templateService.getAllLanguages();
      console.log(data);
      return data?.payload;
      
    }
  })

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [template_type] = watch(["template_type"]);

  useEffect(() => {
    if (!selectedStates || !selectedStates.length) {
      setValue("state", "");
    } else {
      setValue("state", selectedStates.join(","));
      trigger("state");
    }
  }, [selectedStates, setValue, trigger]);

  const columns: ColumnDef<ParameterType>[] = [
    {
      header: "Parameter Name",
      accessorKey: "name",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Default Value",
      accessorKey: "defaultValue",
    },
  ];

  const saveCaretPosition = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(divRef.current!);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;

      return { start, end: start + range.toString().length };
    }
    return null;
  };

  const restoreCaretPosition = (position: { start: number; end: number }) => {
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(divRef.current!, 0);
    range.collapse(true);
    const nodeStack: Node[] = [divRef.current!];
    let foundStart = false;
    let stop = false;

    while (!stop && nodeStack.length > 0) {
      const node = nodeStack.pop()!;
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + node.textContent!.length;
        if (
          !foundStart &&
          position.start >= charIndex &&
          position.start <= nextCharIndex
        ) {
          range.setStart(node, position.start - charIndex);
          foundStart = true;
        }
        if (
          foundStart &&
          position.end >= charIndex &&
          position.end <= nextCharIndex
        ) {
          range.setEnd(node, position.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const handleInput = async () => {
    const caretPosition = saveCaretPosition();
    if (divRef.current) {
      const rawText = divRef.current.innerText;
      const formattedText = rawText.replace(/(@\w+)/g, "<b>$1</b>");
      setContent(formattedText);
      const data = formattedText.replace(/<\/?b>/g, "");
      setValue("body", data);
      await trigger(["body"]);
    }
    setTimeout(() => restoreCaretPosition(caretPosition!), 0); // delay to allow DOM update
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = content;
    }
  }, [content]);

  const handleParameterValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setParametersPlaceholders((initial) =>
      initial.map((curr) =>
        curr.name === name ? { ...curr, value: value } : curr
      )
    );
  };

  const replaceValues = (text: string) => {
    const config: Record<string, string> = {};
    for (const data of parametersPlaceholders) {
      config[data.name] =
        data.value.length > 0 ? data.value : data.defaultValue;
    }

    const parts = text.split(/(<b>@[^<]+<\/b>)/g);
    return parts.map((part, index) => {
      const match = part.match(/<b>(@[^<]+)<\/b>/);
      if (match) {
        return <b key={index}>{config[match[1]] || match[1]}</b>;
      }
      return part;
    });
  };

  function replacePlaceholders(inputString: string) {
    templateParametersList.forEach((param) => {
      const placeholder = param.name;
      const formattedPlaceholder = `{{${placeholder.slice(1)}}}`;
      inputString = inputString.replace(
        new RegExp(placeholder, "g"),
        formattedPlaceholder
      );
    });
    return inputString;
  }

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const formattedValue = {
        ...values,
        body: replacePlaceholders(values.body),
        variables: ["name", "amount", "title"],
      };
      // alert("You are about to submit: " + JSON.stringify(formattedValue));
      const data = await templateService.createTemplate(formattedValue);
      toast.success(data.message);
      reset();
      setValue("template_type", "");
      setContent("");
      setSelectedStates([]);
    } catch (error: any) {
      setError("root", {
        type: "deps",
        message:
          error?.response?.data?.message ??
          error?.message ??
          "An error occurred",
      });
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred"
      );
    }
  };

  return (
    <Container>
      {isLoadingLanguages ? (
        <div className="min-h-[25vh] flex items-center justify-center">
          <ClipLoader size={25} color="#5b21b6" />
        </div>
      ) : (
        <>
          <PageTitle title="New Template" />
          <Card className="mt-4 rounded-sm">
            <h2 className="font-bold text-lg my-2">Template Info</h2>

            <div>
              <form className="my-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                  <article className="lg:col-span-5">
                    <div className="mb-2.5">
                      <Input
                        placeholder="Title..."
                        id="title"
                        label="Title: "
                        error={errors?.title?.message}
                        {...register("title")}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Language..."
                        id="language"
                        label="Language: "
                        error={errors?.language?.message}
                        {...register("language")}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="my-2.5">
                      <Label
                        htmlFor="template_type"
                        className="mb-1.5 block font-semibold"
                      >
                        Select Template Type:
                      </Label>
                      <Select
                        disabled={isSubmitting}
                        value={template_type}
                        onValueChange={async (value) => {
                          setValue("template_type", value);
                          await trigger("template_type");
                        }}
                      >
                        <SelectTrigger className="">
                          <SelectValue placeholder="select template type: " />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Alert Type: </SelectLabel>
                            {ALERT_TYPE_OPTIONS?.map((option) => (
                              <SelectItem
                                value={option.value}
                                key={option.id}
                                disabled={isSubmitting}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="h-1 mt-0.5 text-red-500 text-[10px]">
                        {errors?.template_type?.message}
                      </p>
                    </div>
                    <div className="mt-2.5">
                      <Label className="mb-1.5 block text-sm font-semibold">
                        State(s)
                      </Label>

                      <MultiSelect
                        options={stateOptions}
                        selected={selectedStates}
                        onChange={setSelectedStates}
                        placeholder={
                          selectedStates.length > 0
                            ? "Please select an account..."
                            : "No accounts to assign..."
                        }
                        disabled={isSubmitting}
                      />
                      <p className="h-1 mt-0.5 text-red-500 text-[10px]">
                        {errors?.state?.message}
                      </p>
                    </div>
                    <div className="mt-2.5">
                      <Label htmlFor="messageBody mb-1">Message Body: </Label>
                      <div
                        ref={divRef}
                        contentEditable
                        onInput={handleInput}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`min-h-[20vh] border-gray-300 border ${
                          isFocused
                            ? "ring-[0.75px] ring-primary border-none"
                            : ""
                        } w-full outline-none p-2 rounded-sm`}
                      />
                      <p className="h-1 mt-0.5 text-red-500 text-[10px]">
                        {errors?.body?.message}
                      </p>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-medium text-sm">Preview</h3>
                      <p>{replaceValues(content)}</p>
                    </div>
                  </article>
                  <article className="lg:col-span-2">
                    {parametersPlaceholders.map((item) => (
                      <div key={item.id}>
                        <Label>{item.name}</Label>
                        <Input
                          name={item.name}
                          value={item.value ?? ""}
                          onChange={handleParameterValueChange}
                        />
                      </div>
                    ))}
                  </article>
                  <Button>
                    {isSubmitting ? (
                      <>
                        <ClipLoader size={12} color="#fff" />{" "}
                        <span>Loading...</span>
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </form>
              <div className="bg-gray-100 p-2 rounded-sm">
                <h2 className="font-semibold my-2">Parameters</h2>
                <div>
                  <NonPaginatedTable
                    columns={columns}
                    data={templateParametersList}
                  />
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </Container>
  );
};

export default NewTemplate;
