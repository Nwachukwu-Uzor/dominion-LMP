import React, { useEffect } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { isValid } from "date-fns";
import { SESSION_STORAGE_KEY } from "@/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { dummyStates } from "@/data";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const GENDER_OPTIONS = [
  {
    id: 1,
    label: "Male",
    value: "Male",
  },
  {
    id: 2,
    label: "Female",
    value: "Female",
  },
];

const schema = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(2, "Title is required"),
  LastName: z
    .string({
      required_error: "Last Name is required",
    })
    .min(2, "Last Name is required")
    .refine((value) => !/\d/.test(value), {
      message: "Last Name must not contain any digits",
    }),
  FirstName: z
    .string({
      required_error: "First Name is required",
    })
    .min(2, "First Name is required")
    .refine((value) => !/\d/.test(value), {
      message: "First Name must not contain any digits",
    }),
  BVN: z
    .string({ required_error: "Bvn is required" })
    .length(11, "BVN must be 11 characters long")
    .regex(/^\d+$/, { message: "BVN must contain only digits" }),
  NationalIdentityNo: z
    .string({ required_error: "Bvn is required" })
    .length(11, "NIN must be 11 characters long")
    .regex(/^\d+$/, { message: "NIN must contain only digits" }),
  Gender: z
    .string({ required_error: "Gender is required" })
    .min(4, { message: "Gender is required" }),
  DateOfBirth: z
    .string({ required_error: "Date of Birth is required" })
    .refine(
      (value) => {
        const date = new Date(value);

        return isValid(date);
      },
      { message: "Date of Birth is required" }
    )
    .refine(
      (value) => {
        const date = new Date(value).setHours(0, 0, 0, 0);
        if (!isValid(date)) {
          return false;
        }
        const today = new Date().setHours(0, 0, 0, 0);
        return date < today;
      },
      { message: "Date of Birth has to be before today's date" }
    ),
  PlaceOfBirth: z
    .string({ required_error: "Place of Birth is required" })
    .min(2, "Place of Birth is required"),
  state: z.string({ required_error: "State is required" }),
});

type FormFields = z.infer<typeof schema>;

const STATE_OPTIONS = dummyStates.map((state) => ({
  ...state,
  value: state.name,
  label: state.name,
}));

const TITLE_OPTIONS = [
  {
    id: 1,
    value: "Mr.",
    label: "Mr.",
  },
  {
    id: 2,
    value: "Mrs.",
    label: "Mrs.",
  },
  {
    id: 3,
    value: "Ms.",
    label: "Ms.",
  },
];

export const BasicInformation: React.FC<Props> = ({ handleUpdateStep }) => {
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [Gender, state, title] = watch(["Gender", "state", "title"]);

  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = today.toISOString().split("T")[0];

  useEffect(() => {
    const data = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`
    );
    if (!data) {
      return;
    }
    const parsedData = JSON.parse(data) as FormFields;

    const fields = getValues();
    for (const key in parsedData) {
      if (key in fields) {
        setValue(
          key as keyof FormFields,
          parsedData[key as keyof FormFields] ?? ""
        );
      }
    }
    if (parsedData.Gender) {
      setValue("Gender", parsedData.Gender);
    }

    if (parsedData.state) {
      setValue("state", parsedData.state);
    }

    if (parsedData.title) {
      setValue("title", parsedData.title);
    }
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
        JSON.stringify(values)
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "1");
      handleUpdateStep();
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
    <>
      <form
        className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="col-span-full">
          <Label htmlFor="alertType" className="mb-1 font-semibold">
            Title
          </Label>
          <Select
            value={title}
            onValueChange={async (value) => {
              setValue("title", value, { shouldValidate: true });
              // await trigger("t");
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Title" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Title</SelectLabel>
                {TITLE_OPTIONS?.map((opt) => (
                  <SelectItem value={opt.value} key={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="h-1 mt-0.5 text-red-500 text-[10px]">
            {errors?.title?.message}
          </p>
        </div>
        <div>
          <Input
            label="First Name"
            {...register("FirstName")}
            error={errors?.FirstName?.message}
          />
        </div>
        <div>
          <Input
            label="Last Name"
            {...register("LastName")}
            error={errors?.LastName?.message}
          />
        </div>

        <div>
          <Input
            label="Date of Birth"
            type="date"
            {...register("DateOfBirth")}
            error={errors?.DateOfBirth?.message}
            max={yesterday}
          />
        </div>
        <div>
          <Label htmlFor="alertType" className="mb-1 font-semibold">
            Gender
          </Label>
          <Select
            value={Gender}
            onValueChange={async (value) => {
              setValue("Gender", value);
              await trigger("Gender");
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {GENDER_OPTIONS?.map((opt) => (
                  <SelectItem value={opt.value} key={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="h-1 mt-0.5 text-red-500 text-[10px]">
            {errors?.Gender?.message}
          </p>
        </div>
        <div>
          <Input
            label="National Identity Number (NIN)"
            {...register("NationalIdentityNo")}
            error={errors?.NationalIdentityNo?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("NationalIdentityNo", value);
              await trigger("NationalIdentityNo");
            }}
          />
        </div>
        <div>
          <Input
            label="BVN"
            {...register("BVN")}
            error={errors?.BVN?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("BVN", value);
              await trigger("BVN");
            }}
          />
        </div>
        <div>
          <Input
            label="Place of Birth"
            {...register("PlaceOfBirth")}
            error={errors?.PlaceOfBirth?.message}
          />
        </div>
        <div>
          <Label htmlFor="alertType" className="mb-1 font-semibold">
            State
          </Label>
          <Select
            value={state}
            onValueChange={async (value) => {
              setValue("state", value);
              await trigger("state");
            }}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {STATE_OPTIONS?.map((opt) => (
                  <SelectItem value={opt.value} key={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="h-1 mt-0.5 text-red-500 text-[10px]">
            {errors?.state?.message}
          </p>
        </div>
        <div className="lg:col-span-full">
          <Button className="max-w-[200px]">Next</Button>
        </div>
      </form>
    </>
  );
};
