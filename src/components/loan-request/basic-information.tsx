import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { formatDate, isValid } from "date-fns";
import {
  GENDER_OPTIONS,
  GENDERS,
  SESSION_STORAGE_KEY,
  STATE_OPTIONS,
  TITLES,
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
import {
  calculateEligibleAmountByOrganization,
  formatCurrency,
  formatNumberWithCommasWithOptionPeriodSign,
  getLoanRepaymentInfo,
} from "@/utils";
import { AccountLoanType, CustomerInfoType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { NonPaginatedTable } from "../shared";
// import { BVNType } from "@/types/shared";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const getBasicInfoSchema = (maxLoanAmount: number) =>
  z.object({
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
    ippisNumber: z.string({ required_error: "IPPIS number is required" }),
    organizationEmployer: z
      .string({ required_error: "Organization Employer is required" })
      .min(2, "OrganizationEmployer must be at least 2 characters long"),
    loanTenor: z
      .string({
        required_error: "Loan Tenure is required",
      })
      .regex(/^\d+$/, { message: "Loan Tenure must contain only digits" })
      .refine(
        (value) => {
          return !Number.isNaN(value) && Number(value) > 0;
        },
        { message: "Loan amount must be greater than 0" },
      ),
    loanAmount: z
      .string({
        required_error: "Loan amount is required",
      })
      .regex(/^\d{1,3}(,\d{3})*(\.\d+)?$/, {
        message: "Loan amount must be a valid number",
      })
      .refine(
        (value) => {
          const numberValue = Number(value.replace(/,/g, ""));
          return (
            !Number.isNaN(numberValue) &&
            numberValue <= maxLoanAmount &&
            numberValue > 0
          );
        },
        {
          message: `Loan amount must be less than eligible amount ${formatNumberWithCommasWithOptionPeriodSign(maxLoanAmount)}`,
        },
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

const TENURE_OPTIONS = Array.from({ length: 22 }, (_v, i) => i + 3)?.map(
  (n) => ({ id: n, value: n.toString(), label: n.toString() }),
);

const INITIAL_LOAN_PAYMENT = {
  monthlyRepayment: "0",
  totalPayment: "0",
  InterestRate: 0,
  eligibleAmount: "0",
};

export const BasicInformation: React.FC<Props> = ({ handleUpdateStep }) => {
  const [customerLoans, setCustomerLoans] = useState<AccountLoanType[]>([]);
  const [loanRepayment, setLoanRepayment] = useState(INITIAL_LOAN_PAYMENT);

  const schema = useMemo(
    () => getBasicInfoSchema(Number(loanRepayment.eligibleAmount) ?? 0),
    [loanRepayment],
  );

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
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const accountService = new AccountService();

  // const populateFieldsWithCustomInfo = (info: CustomerInfoType) => {
  //   const data = maskData(info);

  //   setValue("FirstName", data?.FirstName ?? "");
  //   setValue("LastName", data?.LastName ?? "");
  //   setValue("Gender", GENDER_ENUM[info?.Gender] ?? "");
  //   setValue("NationalIdentityNo", data?.NationalIdentityNo ?? "");
  //   setValue("title", data?.title ?? "");
  //   setValue("DateOfBirth", info?.DateOfBirth ?? "");
  //   setValue("state", info?.state ?? "");
  //   sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_CONTACT_INFORMATION}`);
  // };

  const {
    reset: resetIppisInfo,
    data: ippisData,
    isError: isIppisError,
    mutateAsync: validateIppisData,
    isPending: isLoadingIppisInfo,
  } = useMutation({
    mutationFn: async (data: string) => {
      const response = await accountService.validateIPPISNumber({
        IppisNumber: data,
      });
      const ippisData = response?.payload;
      setValue("organizationEmployer", ippisData?.employerOrganization ?? "");
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_IPPIS_INFO`,
        JSON.stringify(ippisData),
      );
      if (loanAmount && loanTenor && ippisData) {
        const paymentInfo = getLoanRepaymentInfo(
          Number(loanAmount.replace(/,/g, "")),
          Number(loanTenor),
          ippisData.employerOrganization,
        );

        setLoanRepayment((prev) => ({
          ...prev,
          ...paymentInfo,
        }));
      }

      if (ippisData && loanTenor) {
        const eligibleAmount = calculateEligibleAmountByOrganization(
          Number(ippisData.netPay),
          Number(loanTenor),
          ippisData.employerOrganization,
        );
        setLoanRepayment((prev) => ({
          ...prev,
          eligibleAmount: eligibleAmount.toString(),
        }));
      }
      return ippisData;
    },
  });

  // const customerLoans = useMemo(() => {
  //   const loans: AccountLoanType[] = [];
  //   if (
  //     !bvnDetails ||
  //     !bvnDetails?.customerInfo ||
  //     Object.keys(bvnDetails?.customerInfo).length === 0
  //   ) {
  //     return loans;
  //   }

  // }, [bvnDetails]);

  const [Gender, state, ippisNumber, loanTenor, loanAmount] = watch([
    "Gender",
    "state",
    "ippisNumber",
    "loanTenor",
    "loanAmount",
  ]);

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

      if (parsedData.loanTenor) {
        setValue("loanTenor", parsedData.loanTenor);
      }

      if (parsedData.ippisNumber) {
        setValue("ippisNumber", parsedData.ippisNumber);
        validateIppisData(parsedData.ippisNumber);
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
  }, [setValue, getValues, validateIppisData]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      if (!ippisData) {
        return;
      }
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
        JSON.stringify(values),
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "1");
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_ELIGIBILITY`,
        JSON.stringify(loanRepayment),
      );
      // if (
      //   bvnDetails?.customerInfo &&
      //   Object.keys(bvnDetails.customerInfo).length > 0
      // ) {
      //   sessionStorage.setItem(
      //     `${SESSION_STORAGE_KEY}_CUSTOMER_INFO`,
      //     JSON.stringify(bvnDetails.customerInfo),
      //   );
      // }
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

  const handleValidateIppisData = async (
    event: React.FocusEvent<HTMLInputElement>,
  ) => {
    const ippisNumber = event.target.value;
    if (ippisNumber.length === 0) {
      return;
    }
    await validateIppisData(ippisNumber);
  };

  const handleTenureAndAmountFieldBlur = async (loanTenor: string) => {
    // const amount = loanAmount.replace(/[^0-9.]/g, "");
    if (!ippisData) {
      return;
    }
    const eligibleAmount = calculateEligibleAmountByOrganization(
      Number(ippisData.netPay),
      Number(loanTenor),
      ippisData.employerOrganization,
    );
    setLoanRepayment((prev) => ({
      ...prev,
      eligibleAmount: eligibleAmount.toString(),
    }));

    const amount = loanAmount.replace(/[^0-9.]/g, "");

    const paymentInfo = getLoanRepaymentInfo(
      Number(amount),
      Number(loanTenor),
      ippisData.employerOrganization,
    );

    setLoanRepayment((prev) => ({
      ...prev,
      ...paymentInfo,
    }));
  };

  const handleAmountFieldBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const amount = event.target.value.replace(/,/g, "");
    if (!ippisData || !loanTenor) {
      return;
    }
    const paymentInfo = getLoanRepaymentInfo(
      Number(amount),
      Number(loanTenor),
      ippisData.employerOrganization,
    );

    setLoanRepayment((prev) => ({
      ...prev,
      ...paymentInfo,
    }));
  };

  console.log({ loanTenor });

  return (
    <>
      <form
        className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Input
            label="First Name"
            {...register("FirstName")}
            error={errors?.FirstName?.message}
            // disabled={
            //   (bvnDetails?.customerInfo !== undefined &&
            //     Object.keys(bvnDetails?.customerInfo).length > 0) ||
            //   customerLoans.length > 0
            // }
          />
        </div>
        <div>
          <Input
            label="Last Name"
            {...register("LastName")}
            error={errors?.LastName?.message}
            // disabled={
            //   (bvnDetails?.customerInfo !== undefined &&
            //     Object.keys(bvnDetails?.customerInfo).length > 0) ||
            //   customerLoans.length > 0
            // }
          />
        </div>
        <div>
          <Input
            label="Other Names"
            {...register("OtherNames")}
            error={errors?.OtherNames?.message}
            // disabled={
            //   (bvnDetails?.customerInfo !== undefined &&
            //     Object.keys(bvnDetails?.customerInfo).length > 0) ||
            //   customerLoans.length > 0
            // }
          />
        </div>
        <div>
          <Input
            label="IPPIS Number"
            onChange={(e) => {
              setValue("ippisNumber", e.target.value, { shouldValidate: true });
              setValue("organizationEmployer", "");
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_IPPIS_INFO`);
              resetIppisInfo();
            }}
            value={ippisNumber}
            error={errors?.ippisNumber?.message}
            disabled={isLoadingIppisInfo}
            onBlur={handleValidateIppisData}
          />
          {isLoadingIppisInfo ? (
            <>
              <ClipLoader size={12} color="#5b21b6" />{" "}
              <span className="text-xs font-semibold italic">Loading...</span>
            </>
          ) : isIppisError ? (
            <p className="text-xs text-red-500">
              Unable to retrieve ippis information
            </p>
          ) : (
            ippisData && (
              <p className="rounded-sm bg-green-100 p-1 text-sm font-bold text-green-900">
                Validation Successful
              </p>
            )
          )}
        </div>
        <div className="col-span-full">
          <Input
            label="Employer (Organization)"
            {...register("organizationEmployer")}
            error={errors?.organizationEmployer?.message}
            disabled
          />
        </div>

        <div>
          <Input
            label="Date of Birth"
            type="date"
            {...register("DateOfBirth")}
            error={errors?.DateOfBirth?.message}
            max={yesterday}
            // disabled={
            //   (bvnDetails?.customerInfo !== undefined &&
            //     Object.keys(bvnDetails?.customerInfo).length > 0) ||
            //   customerLoans.length > 0
            // }
          />
        </div>
        <div>
          <Label htmlFor="Gender" className="mb-1 font-semibold">
            Gender
          </Label>
          <Select
            // value={Gender}
            onValueChange={async (value) => {
              setValue("Gender", value);
              if (value.toUpperCase() === GENDERS.MALE) {
                setValue("title", TITLES.MR);
              } else {
                setValue("title", TITLES.MRS);
              }
              await trigger("Gender");
            }}
            // disabled={
            //   (bvnDetails?.customerInfo !== undefined &&
            //     Object.keys(bvnDetails?.customerInfo).length > 0) ||
            //   customerLoans.length > 0
            // }
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Gender">{Gender}</SelectValue>
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
            // disabled={
            //   (bvnDetails?.customerInfo !== undefined &&
            //     Object.keys(bvnDetails?.customerInfo).length > 0) ||
            //   customerLoans.length > 0
            // }
          />
        </div>
        <div>
          <Label htmlFor="alertType" className="mb-1 font-semibold">
            State of Origin
          </Label>
          <Select
            // value={state}
            onValueChange={async (value) => {
              setValue("state", value);
              await trigger("state");
            }}
            // disabled={
            //   (bvnDetails?.customerInfo !== undefined &&
            //     Object.keys(bvnDetails?.customerInfo).length > 0) ||
            //   customerLoans.length > 0
            // }
          >
            <SelectTrigger className="">
              <SelectValue placeholder="State of Origin">{state}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>State of Origin</SelectLabel>
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
        <div>
          <Label htmlFor="alertType" className="mb-1 font-semibold">
            Loan Tenure: <i className="text-sx font-light">Months</i>
          </Label>
          <Select
            onValueChange={async (value) => {
              handleTenureAndAmountFieldBlur(value);
              setValue("loanTenor", value, {
                shouldValidate: true,
              });
            }}
            // disabled={isSubmitting}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Loan Tenor">{loanTenor}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Loan Tenor: </SelectLabel>
                {TENURE_OPTIONS?.map((opt) => (
                  <SelectItem value={opt.value} key={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="mt-0.5 h-1 text-[10px] text-red-500">
            {errors?.loanTenor?.message}
          </p>
        </div>
        <div>
          <Input
            label="Eligible Amount"
            value={formatNumberWithCommasWithOptionPeriodSign(
              loanRepayment.eligibleAmount,
            )}
            disabled={true}
          />
        </div>
        <div>
          <Input
            label="Loan Amount"
            {...register("loanAmount")}
            error={errors?.loanAmount?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/[^0-9.]/g, "");
              setValue(
                "loanAmount",
                formatNumberWithCommasWithOptionPeriodSign(value),
                {
                  shouldValidate:
                    loanTenor !== undefined && !Number.isNaN(loanTenor),
                },
              );
            }}
            onBlur={handleAmountFieldBlur}
          />
        </div>
        <div>
          <Input
            label="Monthly Payment"
            value={formatNumberWithCommasWithOptionPeriodSign(
              loanRepayment.monthlyRepayment,
            )}
            disabled={true}
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
        <div className="lg:col-span-full">
          <div className="col-span-full flex items-center gap-2">
            <Button className="w-full md:max-w-[250px]">Next</Button>
          </div>
        </div>
      </form>
    </>
  );
};
