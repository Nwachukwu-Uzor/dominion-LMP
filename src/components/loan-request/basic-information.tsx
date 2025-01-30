import React, { useEffect, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { formatDate, isValid } from "date-fns";
import {
  GENDER_ENUM,
  GENDER_OPTIONS,
  GENDERS,
  SESSION_STORAGE_KEY,
  STATE_OPTIONS,
  TITLES,
} from "@/constants";
import { AccountService } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import {
  capitalize,
  compareFullNames,
  formatCurrency,
  maskData,
  parseDateToInputFormat,
} from "@/utils";
import {
  AccountLoanType,
  CustomerInfoType,
  IPPISResponseType,
} from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { NonPaginatedTable, ReactSelectCustomized } from "../shared";
// import { BVNType } from "@/types/shared";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const schema = z.object({
  BVN: z
    .string({ required_error: "Bvn is required" })
    .length(11, "BVN must be 11 characters long")
    .regex(/^[\d*]+$/, { message: "BVN must contain only digits" }),
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
  state: z.string({ required_error: "State of origin is required" }),
});

export const BasicInformation: React.FC<Props> = ({ handleUpdateStep }) => {
  const [customerLoans, setCustomerLoans] = useState<AccountLoanType[]>([]);

  type FormFields = z.infer<typeof schema>;

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    formState: { errors },
    reset: resetForm,
    clearErrors,
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
    setValue("title", data?.title ?? "");
    if (info.DateOfBirth) {
      setValue("DateOfBirth", info.DateOfBirth ?? "");
    }
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

      resetForm();
      setValue("BVN", data.id);
      const { customerInfo, mainOneDetails } = response.payload;
      // Compare name from BVN validation to name in IPPIS
      const fullNameFromBvn = `${mainOneDetails?.bvnDetails?.FirstName ?? ""} ${mainOneDetails?.bvnDetails?.OtherNames} ${mainOneDetails?.bvnDetails?.LastName ?? ""}`;
      const IppisInfo = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_IPPIS_INFO`,
      );
      if (!IppisInfo) {
        throw new Error("No IPPIS info found");
      }

      const parseIppisInfo = JSON.parse(IppisInfo) as IPPISResponseType;
      const fullNameFromIppis = parseIppisInfo.fullName;

      const areNamesEqual = compareFullNames(
        fullNameFromIppis,
        fullNameFromBvn,
      );

      if (!areNamesEqual) {
        const errorMessage = `Name from BVN ${fullNameFromBvn} does not match name from IPPIS Record ${fullNameFromIppis}`;
        setError("BVN", { type: "deps", message: errorMessage });
        throw new Error(errorMessage);
      }

      if (customerInfo && Object.keys(customerInfo).length > 0) {
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

          const loans: AccountLoanType[] = [];
          const data = customerInfo?.accountInfo;
          if (data) {
            data?.forEach((info) => {
              info.accountLoans?.forEach((inf) => {
                loans.push(inf);
              });
            });
            setCustomerLoans(loans);
          }
        }
      }
      return response?.payload;
    },
  });

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

  const [Gender, state] = watch(["Gender", "state"]);

  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = today.toISOString().split("T")[0];

  useEffect(() => {
    const data = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
    );

    if (data) {
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

      if (parsedData.BVN) {
        validateBVN({ id: parsedData.BVN });
      }
    }

    const customerInfo = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_CUSTOMER_INFO`,
    );

    if (customerInfo) {
      const infoFromStorage = JSON.parse(customerInfo) as CustomerInfoType;
      if (infoFromStorage && Object.keys(infoFromStorage).length > 0) {
        const loans: AccountLoanType[] = [];
        const data = infoFromStorage?.accountInfo;
        if (data) {
          data?.forEach((info) => {
            info.accountLoans?.forEach((inf) => {
              loans.push(inf);
            });
          });
          setCustomerLoans(loans);
        }
      }
    }
  }, [setValue, getValues, validateBVN]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      if (!bvnDetails) {
        toast.warn("Please provide valid BVN details to proceed...");
        return;
      }
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
        JSON.stringify(values),
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "2");
      if (
        bvnDetails?.customerInfo &&
        Object.keys(bvnDetails.customerInfo).length > 0
      ) {
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

  const loanTableColumns: ColumnDef<AccountLoanType>[] = [
    {
      header: "#",
      accessorFn: (_dat, index) => index + 1,
    },
    {
      header: "Loan Amount",
      accessorFn: (data) => formatCurrency(data?.Amount),
    },
    {
      header: "Total Amount Paid",
      accessorFn: (data) => formatCurrency(data?.paidAmount),
    },
    {
      header: "Outstanding Amount",
      accessorFn: (data) => formatCurrency(data?.outStandingLoanAmount),
    },
    {
      header: "Created At",
      accessorFn: (data) => formatDate(data.createdAt, "dd-MM-yyyy HH:mm:ss"),
    },
  ];

  const handleBackClick = () => {
    sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "0");
    handleUpdateStep(false);
  };

  const selectedGender = GENDER_OPTIONS.find(
    (gender) => gender.value.toUpperCase() === Gender?.toUpperCase(),
  );

  const selectedState = STATE_OPTIONS.find(
    (st) => st.value.toUpperCase() === state?.toUpperCase(),
  );

  return (
    <>
      <form
        className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Input
            label="Enter BVN"
            {...register("BVN")}
            error={
              isBvnError
                ? (bvnError as any)?.response?.data?.payload?.error ||
                  (bvnError as any)?.message
                : errors?.BVN?.message
            }
            type="number"
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              clearErrors("BVN");
              resetBvnDetails();
              setCustomerLoans([]);
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`);
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_CUSTOMER_INFO`);
              sessionStorage.removeItem(
                `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
              );
              sessionStorage.removeItem(
                `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
              );
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_MESSAGE`);
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_DOCUMENTS`);
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
            disabled={
              (bvnDetails?.customerInfo !== undefined &&
                Object.keys(bvnDetails?.customerInfo).length > 0) ||
              customerLoans.length > 0
            }
          />
        </div>
        <div>
          <Input
            label="Last Name"
            {...register("LastName")}
            error={errors?.LastName?.message}
            disabled={
              (bvnDetails?.customerInfo !== undefined &&
                Object.keys(bvnDetails?.customerInfo).length > 0) ||
              customerLoans.length > 0
            }
          />
        </div>
        <div>
          <Input
            label="Other Names"
            {...register("OtherNames")}
            error={errors?.OtherNames?.message}
            disabled={
              (bvnDetails?.customerInfo !== undefined &&
                Object.keys(bvnDetails?.customerInfo).length > 0) ||
              customerLoans.length > 0
            }
          />
        </div>

        <div>
          <Input
            label="Date of Birth"
            type="date"
            {...register("DateOfBirth")}
            error={errors?.DateOfBirth?.message}
            max={yesterday}
            disabled={
              (bvnDetails?.customerInfo !== undefined &&
                Object.keys(bvnDetails?.customerInfo).length > 0) ||
              customerLoans.length > 0
            }
          />
        </div>
        <div>
          <ReactSelectCustomized
            options={GENDER_OPTIONS}
            label={<>Gender</>}
            placeholder="Gender"
            onChange={(data) => {
              const value = data?.value ?? "";
              setValue("Gender", value, { shouldValidate: true });
              if (value.toUpperCase() === GENDERS.MALE) {
                setValue("title", TITLES.MR);
              } else {
                setValue("title", TITLES.MRS);
              }
            }}
            value={selectedGender}
            error={errors?.Gender?.message}
            isDisabled={
              (bvnDetails?.customerInfo !== undefined &&
                Object.keys(bvnDetails?.customerInfo).length > 0) ||
              customerLoans.length > 0
            }
          />
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
            disabled={
              (bvnDetails?.customerInfo !== undefined &&
                Object.keys(bvnDetails?.customerInfo).length > 0) ||
              customerLoans.length > 0
            }
          />
        </div>
        <div>
          <ReactSelectCustomized
            menuPosition="fixed"
            options={STATE_OPTIONS}
            label={<>State of Origin</>}
            placeholder="State of Origin"
            onChange={(data) => {
              const value = data?.value ?? "";
              setValue("state", value, { shouldValidate: true });
            }}
            value={selectedState}
            error={errors?.state?.message}
            isDisabled={
              (bvnDetails?.customerInfo !== undefined &&
                Object.keys(bvnDetails?.customerInfo).length > 0) ||
              customerLoans.length > 0
            }
            maxMenuHeight={300}
          />
        </div>
        {customerLoans && customerLoans.length > 0 ? (
          <div className="lg:col-span-full">
            <h3 className="mb-2 text-sm font-medium">Loans</h3>
            <NonPaginatedTable
              isSearchable={false}
              columns={loanTableColumns}
              data={customerLoans}
            />
          </div>
        ) : null}
        <div className="col-span-full flex items-center gap-2">
          <Button
            className="w-full bg-black md:max-w-[200px]"
            type="button"
            onClick={handleBackClick}
          >
            Back
          </Button>
          <Button className="w-full md:max-w-[200px]" type="submit">
            Next
          </Button>
        </div>
      </form>
    </>
  );
};
