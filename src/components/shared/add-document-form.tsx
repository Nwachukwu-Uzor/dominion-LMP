import React from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { convertToBase64 } from "@/utils";
import { Button } from "../ui/button";

type Props = {
  handleAddDocument: (data: { title: string; path: string }) => void;
};

const MAX_FILE_SIZE = 0.5 * 1024 * 1024; // 0.5 MB

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  file: z
    .custom<FileList>(
      (value) => value instanceof FileList && value.length > 0,
      {
        message: "Please provide a valid file",
      },
    )
    .refine(
      (fileList) => {
        const file = fileList?.[0];
        console.log(file.type);
        
        const validTypes = [
          "image/jpeg",
          "image/png",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];
        return file && validTypes.includes(file.type);
      },
      {
        message:
          "Invalid file type. Please upload an image, PDF, Word document, or Excel file.",
      },
    )
    .refine(
      (fileList) => {
        const file = fileList?.[0];
        return file && file.size <= MAX_FILE_SIZE;
      },
      {
        message: "File size must be less than 0.5 MB",
      },
    ),
});

type FormFields = z.infer<typeof schema>;

export const AddDocumentForm: React.FC<Props> = ({ handleAddDocument }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    // Convert FileList to a single File
    const path = await convertToBase64(data.file[0]);
    handleAddDocument({ title: data.title, path: path });
  };

  return (
    <>
      <h2 className="mb-2 text-sm font-semibold">Add Document</h2>
      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Title"
          {...register("title")}
          error={errors?.title?.message}
          placeholder="Enter title"
        />

        <div>
          <Input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx"
            {...register("file")}
            error={errors?.file?.message}
          />
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </>
  );
};
