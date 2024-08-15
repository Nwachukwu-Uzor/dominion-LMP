import React, { useEffect, useState } from "react";
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
import { AccountService } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { capitalize, parseDateToInputFormat } from "@/utils";
import { BVNType } from "@/types/shared";

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
  OtherNames: z.optional(
    z.string().refine((value) => !/\d/.test(value), {
      message: "First Name must not contain any digits",
    }),
  ),
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
      { message: "Date of Birth is required" },
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
      { message: "Date of Birth has to be before today's date" },
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
  const [stage, setStage] = useState(1);

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

  const accountService = new AccountService();

  const {
    mutate: validateBVN,
    data: bvnDetails,
    isError: isBvnError,
    error: bvnError,
    reset: resetBvnDetails,
    isPending: isLoadingBvnDetails,
  } = useMutation({
    mutationFn: async (data: { id: string }) => {
      const response = await accountService.validateBVN(data);
      return response?.payload?.bvnDetails;
    },
  });

  const [Gender, state, title] = watch(["Gender", "state", "title"]);

  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = today.toISOString().split("T")[0];

  useEffect(() => {
    const data = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
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
          parsedData[key as keyof FormFields] ?? "",
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
  }, [setValue, getValues, stage]);

  useEffect(() => {
    const bvnDetails = JSON.parse(
      sessionStorage.getItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`) as string,
    ) as BVNType;

    if (bvnDetails) {
      setStage(2);
    }
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
        JSON.stringify(values),
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
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    }
  };

  const handleValidateBvn = async () => {
    const { BVN } = getValues();
    if (BVN?.length !== 11) {
      return;
    }
    if (bvnDetails) {
      setValue("FirstName", capitalize(bvnDetails?.FirstName) ?? "");
      setValue("LastName", capitalize(bvnDetails?.LastName) ?? "");
      setValue("OtherNames", capitalize(bvnDetails?.OtherNames) ?? "");
      const parsedDate = parseDateToInputFormat(bvnDetails.DOB);

      if (parsedDate) {
        setValue("DateOfBirth", parsedDate);
      }

      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_BVN_DETAILS`,
        JSON.stringify(bvnDetails),
      );
      setStage(2);
    }
    validateBVN({ id: BVN });
  };

  const handleBackClick = () => {
    setStage(1);
  };

  return (
    <>
      {stage === 1 && (
        <div>
          <Input
            label="Enter BVN"
            {...register("BVN")}
            error={
              isBvnError
                ? (bvnError as any)?.response?.data?.payload?.error
                : errors?.BVN?.message
            }
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              resetBvnDetails();
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`);
              setValue("BVN", value);
              await trigger("BVN");
            }}
            disabled={isLoadingBvnDetails}
          />
          {bvnDetails && (
            <p className="rounded-sm bg-green-100 p-1 text-sm font-bold text-green-900">
              Validation Successful
            </p>
          )}
          <Button
            onClick={handleValidateBvn}
            className="mt-2 w-full max-w-[300px]"
          >
            {isLoadingBvnDetails ? (
              <>
                <ClipLoader size={12} color="#fff" /> <span>Loading...</span>
              </>
            ) : bvnDetails ? (
              "Next"
            ) : (
              "Validate"
            )}
          </Button>
        </div>
      )}
      {stage === 2 && (
        <form
          className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4"
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
            <p className="mt-0.5 h-1 text-[10px] text-red-500">
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
              label="Other Names"
              {...register("OtherNames")}
              error={errors?.OtherNames?.message}
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
            <p className="mt-0.5 h-1 text-[10px] text-red-500">
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
            <p className="mt-0.5 h-1 text-[10px] text-red-500">
              {errors?.state?.message}
            </p>
          </div>
          <div className="lg:col-span-full">
            <div className="col-span-full flex items-center gap-2">
              <Button
                className="max-w-[175px] bg-black"
                type="button"
                onClick={handleBackClick}
              >
                Back
              </Button>
              <Button className="max-w-[175px]">Next</Button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};
