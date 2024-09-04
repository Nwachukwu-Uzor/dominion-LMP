import React, { useEffect } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { isValid } from "date-fns";
import {
  GENDER_ENUM,
  GENDER_OPTIONS,
  SESSION_STORAGE_KEY,
  STATE_OPTIONS,
  TITLE_OPTIONS,
} from "@/constants";
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
import { AccountService } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { capitalize, maskData, parseDateToInputFormat } from "@/utils";
import { CustomerInfoType } from "@/types/shared";
// import { BVNType } from "@/types/shared";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

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
      message: "Other Names must not contain any digits",
    }),
  ),
  BVN: z
    .string({ required_error: "Bvn is required" })
    .length(11, "BVN must be 11 characters long")
    .regex(/^[\d*]+$/, { message: "BVN must contain only digits" }),
  NationalIdentityNo: z
    .string()
    .length(11, "NIN must be 11 characters long")
    .regex(/^[\d*]+$/, { message: "NIN must contain only digits" })
    .optional()
    .or(z.literal("")),

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

  const accountService = new AccountService();

  const populateFieldsWithCustomInfo = (info: CustomerInfoType) => {
    const data = maskData(info);

    setValue("FirstName", data?.FirstName ?? "");
    setValue("LastName", data?.LastName ?? "");
    setValue("Gender", GENDER_ENUM[info?.Gender] ?? "");
    setValue("NationalIdentityNo", data?.NationalIdentityNo ?? "");
    setValue("PlaceOfBirth", data?.PlaceOfBirth ?? "");
    setValue("title", data?.title ?? "");
    setValue("DateOfBirth", info?.DateOfBirth ?? "");
    setValue("state", info?.state ?? "");
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_CONTACT_INFORMATION}`);
  };

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
      if (!response?.payload) {
        return;
      }
      const { customerInfo, mainOneDetails } = response.payload;
      if (customerInfo) {
        populateFieldsWithCustomInfo(customerInfo);
      } else {
        const info = mainOneDetails.bvnDetails;

        if (info) {
          setValue("FirstName", capitalize(info?.FirstName) ?? "");
          setValue("LastName", capitalize(info?.LastName) ?? "");
          setValue("OtherNames", capitalize(info?.OtherNames) ?? "");
          const parsedDate = parseDateToInputFormat(info.DOB);

          if (parsedDate) {
            setValue("DateOfBirth", parsedDate);
          }
        }
      }
      return response?.payload;
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
  }, [setValue, getValues]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
        JSON.stringify(values),
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "1");
      if (bvnDetails?.customerInfo) {
        sessionStorage.setItem(
          `${SESSION_STORAGE_KEY}_CUSTOMER_INFO`,
          JSON.stringify(bvnDetails.customerInfo),
        );
      }
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

    validateBVN({ id: BVN });
  };

  const handleBvnInputBlur = async (
    event: React.FocusEvent<HTMLInputElement>,
  ) => {
    const { value } = event.target;
    if (value?.length === 11) {
      await handleValidateBvn();
    }
  };

  return (
    <>
      <form
        className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Label htmlFor="Title" className="mb-1 font-semibold">
            Title
          </Label>
          <Select
            disabled={bvnDetails?.customerInfo !== undefined}
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
            label="Enter BVN"
            {...register("BVN")}
            error={
              isBvnError
                ? (bvnError as any)?.response?.data?.payload?.error
                : errors?.BVN?.message
            }
            type="number"
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              resetBvnDetails();
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`);
              setValue("BVN", value);
              await trigger("BVN");
            }}
            disabled={isLoadingBvnDetails}
            onBlur={handleBvnInputBlur}
          />
          {isLoadingBvnDetails ? (
            <>
              <ClipLoader size={12} color="#5b21b6" /> <span>Loading...</span>
            </>
          ) : (
            bvnDetails && (
              <p className="rounded-sm bg-green-100 p-1 text-sm font-bold text-green-900">
                Validation Successful
              </p>
            )
          )}
        </div>
        <div>
          <Input
            label="First Name"
            {...register("FirstName")}
            error={errors?.FirstName?.message}
            disabled={bvnDetails?.customerInfo !== undefined}
          />
        </div>
        <div>
          <Input
            label="Last Name"
            {...register("LastName")}
            error={errors?.LastName?.message}
            disabled={bvnDetails?.customerInfo !== undefined}
          />
        </div>
        <div>
          <Input
            label="Other Names"
            {...register("OtherNames")}
            error={errors?.OtherNames?.message}
            disabled={bvnDetails?.customerInfo !== undefined}
          />
        </div>

        <div>
          <Input
            label="Date of Birth"
            type="date"
            {...register("DateOfBirth")}
            error={errors?.DateOfBirth?.message}
            max={yesterday}
            disabled={bvnDetails?.customerInfo !== undefined}
          />
        </div>
        <div>
          <Label htmlFor="Gender" className="mb-1 font-semibold">
            Gender
          </Label>
          <Select
            value={Gender}
            onValueChange={async (value) => {
              setValue("Gender", value);
              await trigger("Gender");
            }}
            disabled={bvnDetails?.customerInfo !== undefined}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Gender</SelectLabel>
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
            label={
              <>
                National Identity Number (NIN){" "}
                <i className="font-light">[optional]</i>
              </>
            }
            {...register("NationalIdentityNo")}
            error={errors?.NationalIdentityNo?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("NationalIdentityNo", value);
              await trigger("NationalIdentityNo");
            }}
            disabled={bvnDetails?.customerInfo !== undefined}
          />
        </div>
        <div>
          <Input
            label="Place of Birth"
            {...register("PlaceOfBirth")}
            error={errors?.PlaceOfBirth?.message}
            disabled={bvnDetails?.customerInfo !== undefined}
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
            disabled={bvnDetails?.customerInfo !== undefined}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>State</SelectLabel>
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
            {/* <Button
              className="max-w-[175px] bg-black"
              type="button"
              onClick={handleBackClick}
            >
              Back
            </Button> */}
            <Button className="w-full max-w-[250px]">Next</Button>
          </div>
        </div>
      </form>
    </>
  );
};
