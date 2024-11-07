import { Container, PageTitle } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GENDER_ENUM,
  GENDER_OPTIONS,
  GENDERS,
  NOTIFICATION_PREFERENCE_OPTIONS,
  SESSION_STORAGE_KEY,
  STATE_OPTIONS,
  TITLES,
} from "@/constants";
import { FETCH_ACCOUNT_DETAILS_BY_ID } from "@/constants/query-keys";
import { AccountService, LoanService } from "@/services";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { ChangeEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { isValid } from "date-fns";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LoanRequestType } from "@/types/shared";
import {
  calculateLoanForOrganization,
  formatNumberWithCommasWithOptionPeriodSign,
} from "@/utils";
import { Textarea } from "@/components/ui/textarea";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const getLoanSchema = (maxLoanAmount: number) => {
  return z.object({
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
    state: z.string({ required_error: "State of origin is required" }),
    PhoneNo: z
      .string({
        required_error: "Phone Number is required",
      })
      .length(11, "Phone Number must be 11 characters long")
      .regex(/^[\d*]+$/, { message: "Phone number must contain only digits" }),
    alternatePhoneNo: z
      .string({
        required_error: "Preferred Phone Number is required",
      })
      .length(11, "Phone Number must be 11 characters long")
      .regex(/^[\d*]+$/, { message: "Phone number must contain only digits" }),
    Email: z
      .string({
        required_error: "Email is required",
      })
      .refine(
        (value) => {
          // Check if the string is a valid email
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailPattern.test(value)) {
            return true;
          }

          // Check if the string contains at least 60% asterisks
          const totalLength = value.length;
          const asteriskCount = value.split("*").length - 1;
          const asteriskPercentage = (asteriskCount / totalLength) * 100;

          return asteriskPercentage >= 60;
        },
        {
          message: "Please provide a valid email address",
        },
      ),
    NotificationPreference: z.string({
      required_error: "Notification Preference is required",
    }),
    NextOfKinFirstName: z
      .string({ required_error: "Next of Kin first name is required" })
      .min(2, "Next of Kin first name must be at least 2 characters")
      .refine((value) => !/\d/.test(value), {
        message: "Next of Kin first name must not contain any digits",
      }),
    NextOfKinLastName: z
      .string({ required_error: "Next of Kin last name is required" })
      .min(2, "Next of Kin last name must be at least 2 characters")
      .refine((value) => !/\d/.test(value), {
        message: "Next of Kin last name must not contain any digits",
      }),
    NextOfKinPhoneNo: z
      .string({ required_error: "Next of Kin phone number is required" })
      .length(11, "Phone Number must be 11 characters long")
      .regex(/^[\d*]+$/, { message: "Phone number must contain only digits" }),
    Address: z
      .string({ required_error: "Address is required" })
      .min(5, { message: "Address is required" }),
    organizationEmployer: z
      .string({ required_error: "Organization Employer is required" })
      .min(2, "OrganizationEmployer must be at least 2 characters long"),
    ippisNumber: z.string({ required_error: "IPPIS number is required" }),
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
          message: `Loan amount must be less than eligible amount ${maxLoanAmount}`,
        },
      ),
    loanTenor: z
      .string({
        required_error: "Loan Tenure is required",
      })
      .regex(/^\d+$/, { message: "Loan Tenure must contain only digits" })
      .refine(
        (value) => {
          return !Number.isNaN(value) && Number(value) > 0;
        },
        { message: "Loan amount must be greater than zero" },
      ),
    AccountOfficerCode: z.string({
      required_error: "Account officer code is required",
    }),
    AccountOfficerEmail: z
      .string({
        required_error: "Account officer email is required",
      })
      .email("Please provide a valid email address"),
    workIdentification: z.optional(z.string()),
    IdentificationImage: z.optional(z.string()),
    CustomerImage: z.optional(z.string()),
    otherDocument: z.optional(z.string()),
    CustomerSignature: z.optional(z.string()),
  });
};

const INITIAL_LOAN_PAYMENT = {
  monthlyRepayment: "0",
  totalPayment: "0",
  eligibleAmount: "0",
};

const TENURE_OPTIONS = Array.from({ length: 22 }, (_v, i) => i + 3)?.map(
  (n) => ({ id: n, value: n.toString(), label: n }),
);

const EditInformation: React.FC = () => {
  const { accountId } = useParams<{ id: string; accountId: string }>();
  // const [customerLoans, setCustomerLoans] = useState<AccountLoanType[]>([]);
  const [loanRepayment, setLoanRepayment] = useState(INITIAL_LOAN_PAYMENT);
  const [isDone, setIsDone] = useState(false);
  const navigate = useNavigate();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const accountService = new AccountService();

  const populateFieldsWithCustomInfo = (data: LoanRequestType) => {
    setValue("FirstName", data?.profile?.FirstName ?? "");
    setValue("LastName", data?.profile?.LastName ?? "");
    setValue("OtherNames", data?.profile?.OtherNames ?? "");
    setValue("Gender", GENDER_ENUM[data?.profile?.Gender] ?? "");
    setValue("NationalIdentityNo", data?.profile?.NationalIdentityNo ?? "");
    setValue("title", data?.profile?.title ?? "");
    setValue("DateOfBirth", data?.profile?.DateOfBirth ?? "");
    setValue("state", data?.profile?.state ?? "");
    setValue("BVN", data?.profile?.BVN ?? "");
    setValue("NationalIdentityNo", data?.profile?.NationalIdentityNo ?? "");
    setValue("PhoneNo", data?.profile?.PhoneNo ?? "");
    setValue("alternatePhoneNo", data?.profile?.alternatePhoneNo ?? "");
    setValue("Email", data?.profile?.Email ?? "");
    setValue("NotificationPreference", data?.NotificationPreference ?? "");
    setValue("Address", data?.profile?.Address ?? "");
    setValue("ippisNumber", data?.profile?.ippisNumber ?? "");
    setValue("organizationEmployer", data?.profile?.organizationEmployer ?? "");
    setValue(
      "NextOfKinFirstName",
      data?.profile?.NextOfKinName?.split(" ")[0] ?? "",
    );
    setValue(
      "NextOfKinLastName",
      data?.profile?.NextOfKinName?.split(" ")[1] ?? "",
    );
    setValue("NextOfKinPhoneNo", data?.profile?.NextOfKinPhoneNo ?? "");
    setValue("AccountOfficerCode", data?.AccountOfficerCode ?? "");
    setValue("AccountOfficerEmail", data?.AccountOfficerEmail ?? "");
    setValue(
      "loanAmount",
      formatNumberWithCommasWithOptionPeriodSign(
        data?.profile?.loanAmount ?? "",
      ),
    );
    setValue("loanTenor", data?.profile?.loanTenor ?? "");
    handleTenureAndAmountFieldBlur(
      data?.profile?.loanAmount,
      data?.profile?.loanTenor,
    );
    validateBVN({ id: data?.profile?.BVN ?? "" });
    validateIppisData(data?.profile?.ippisNumber ?? "");
  };

  const schema = useMemo(
    () => getLoanSchema(Number(loanRepayment.eligibleAmount) ?? 0),
    [loanRepayment.eligibleAmount],
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
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [
    Gender,
    state,
    NotificationPreference,
    ippisNumber,
    customerSignature,
    loanTenor,
    loanAmount,
  ] = watch([
    "Gender",
    "state",
    "NotificationPreference",
    "ippisNumber",
    "CustomerSignature",
    "loanTenor",
    "loanAmount",
  ]);

  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = today.toISOString().split("T")[0];

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
      setValue("BVN", data.id);
      // const { customerInfo, mainOneDetails } = response.payload;
      return response?.payload;
    },
  });

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
      return ippisData;
    },
  });

  const handleValidateIppisData = async (
    event: React.FocusEvent<HTMLInputElement>,
  ) => {
    await validateIppisData(event.target.value);
  };

  const {
    data: accountInfo,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [FETCH_ACCOUNT_DETAILS_BY_ID, accountId],
    queryFn: async ({ queryKey }) => {
      const accountId = queryKey[1];

      if (!accountId) {
        return;
      }
      const accountData = await loanService.getLoanRequestById(accountId);
      populateFieldsWithCustomInfo(accountData?.accountRecords);

      return accountData?.accountRecords;
    },
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const payload = {
        ...values,
        loanAmount: values.loanAmount.replace(/,/g, ""),
        monthlyPayment: loanRepayment.monthlyRepayment.replace(/,/g, ""),
        totalPayment: loanRepayment.totalPayment.replace(/,/g, ""),
        AccountOpeningTrackingRef: accountInfo?.AccountOpeningTrackingRef ?? "",
      };
      const response = await accountService.editLoanRequest(payload);
      toast.success(response?.message ?? "Loan request edited successfully");
      setIsDone(true);
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

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Could not convert file to Base64"));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleUploadSignature = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      const file = event?.target?.files?.[0];
      if (!file) {
        return;
      }
      const data = await convertToBase64(file);

      setValue("CustomerSignature", data);
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleTenureAndAmountFieldBlur = (
    loanAmount: string,
    loanTenor: string,
  ) => {
    const amount = loanAmount.replace(/[^0-9.]/g, "");
    const repaymentInfo = calculateLoanForOrganization(
      ippisData?.employerOrganization ?? "",
      Number(amount),
      Number(loanTenor),
      Number(ippisData?.netPay) ?? 0,
    );
    setLoanRepayment({
      monthlyRepayment: repaymentInfo.monthlyInstallment,
      totalPayment: repaymentInfo.totalRepayment,
      eligibleAmount: repaymentInfo.eligibleAmount,
    });
  };

  return (
    <>
      <Container>
        <PageTitle title="Edit Loan Request" />
        <Card className="my-2 rounded-sm">
          {isLoading ? (
            <div className="flex min-h-[25vh] items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : isError ? (
            <div className="text-sm text-red-600">{error?.message}</div>
          ) : accountInfo ? (
            <>
              {isDone ? (
                <article className="flex flex-col items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    Request Submitted Successfully
                  </h2>
                  <IoMdCheckmarkCircleOutline className="text-6xl text-green-400" />
                  <p className="text-center text-sm font-light">
                    Loan request edited successfully.
                  </p>
                  <Button
                    className="min-w-[200px] rounded-sm"
                    onClick={() => {
                      navigate("/loan/requests/rejected");
                    }}
                  >
                    Close
                  </Button>
                </article>
              ) : (
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
                          ? (bvnError as any)?.response?.data?.payload?.error
                          : errors?.BVN?.message
                      }
                      type="number"
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        resetBvnDetails();
                        setValue("BVN", value);
                        await trigger("BVN");
                      }}
                      disabled
                      onBlur={handleBvnInputBlur}
                    />
                    {isLoadingBvnDetails ? (
                      <>
                        <ClipLoader size={12} color="#5b21b6" />{" "}
                        <span>Loading...</span>
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
                    <Label htmlFor="Gender" className="mb-1 font-semibold">
                      Gender
                    </Label>
                    <Select
                      value={Gender}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="alertType" className="mb-1 font-semibold">
                      State of Origin
                    </Label>
                    <Select
                      value={state}
                      onValueChange={async (value) => {
                        setValue("state", value);
                        await trigger("state");
                      }}
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="State of Origin" />
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
                    <Input
                      label="Phone No"
                      {...register("PhoneNo")}
                      error={errors?.PhoneNo?.message}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setValue("PhoneNo", value);
                        await trigger("PhoneNo");
                      }}
                    />
                  </div>
                  <div>
                    <Input
                      label="Preferred Phone No"
                      {...register("alternatePhoneNo")}
                      error={errors?.alternatePhoneNo?.message}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setValue("alternatePhoneNo", value);
                        await trigger("alternatePhoneNo");
                      }}
                    />
                  </div>
                  <div>
                    <Input
                      label="Email"
                      {...register("Email")}
                      error={errors?.Email?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="alertType" className="mb-1 font-semibold">
                      Notification Preference:
                    </Label>
                    <Select
                      value={NotificationPreference}
                      onValueChange={async (value) => {
                        setValue("NotificationPreference", value, {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="Notification Preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Notification Preference</SelectLabel>
                          {NOTIFICATION_PREFERENCE_OPTIONS?.map((opt) => (
                            <SelectItem value={opt.value} key={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <p className="mt-0.5 h-1 text-[10px] text-red-500">
                      {errors?.NotificationPreference?.message}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <Textarea
                      label="Address"
                      {...register("Address")}
                      error={errors?.Address?.message}
                    />
                  </div>
                  <div>
                    <Input
                      label="IPPIS Number"
                      onChange={(e) => {
                        setValue("ippisNumber", e.target.value, {
                          shouldValidate: true,
                        });
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
                        <span className="text-xs font-semibold italic">
                          Loading...
                        </span>
                      </>
                    ) : isIppisError ? (
                      <p>Unable to retrieve ippis information</p>
                    ) : (
                      ippisData && (
                        <p className="rounded-sm bg-green-100 p-1 text-sm font-bold text-green-900">
                          Validation Successful
                        </p>
                      )
                    )}
                  </div>
                  <div>
                    <Input
                      label="Employer (Organization)"
                      {...register("organizationEmployer")}
                      error={errors?.organizationEmployer?.message}
                      disabled
                    />
                  </div>

                  <div>
                    <Input
                      label="Next of Kin First Name: "
                      {...register("NextOfKinFirstName")}
                      error={errors?.NextOfKinFirstName?.message}
                    />
                  </div>
                  <div>
                    <Input
                      label="Next of Kin Last Name: "
                      {...register("NextOfKinLastName")}
                      error={errors?.NextOfKinLastName?.message}
                    />
                  </div>

                  <div className="col-span-full">
                    <Input
                      label="Next of Kin Phone Number: "
                      {...register("NextOfKinPhoneNo")}
                      error={errors?.NextOfKinPhoneNo?.message}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setValue("NextOfKinPhoneNo", value);
                        await trigger("NextOfKinPhoneNo");
                      }}
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
                        );
                        await trigger("loanAmount");
                      }}
                      disabled={isSubmitting}
                      onBlur={() =>
                        handleTenureAndAmountFieldBlur(loanAmount, loanTenor)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="alertType" className="mb-1 font-semibold">
                      Loan Tenure: <i className="text-sx font-light">Months</i>
                    </Label>
                    <Select
                      value={loanTenor}
                      onValueChange={async (value) => {
                        handleTenureAndAmountFieldBlur(loanAmount, value);
                        setValue("loanTenor", value, {
                          shouldValidate: true,
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="">
                        <SelectValue placeholder="Loan Tenor" />
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
                      label="Monthly Payment"
                      value={formatNumberWithCommasWithOptionPeriodSign(
                        loanRepayment.monthlyRepayment,
                      )}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Input
                      label="Account Officer Code"
                      {...register("AccountOfficerCode")}
                      error={errors?.AccountOfficerCode?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Account Officer Email"
                      {...register("AccountOfficerEmail")}
                      error={errors?.AccountOfficerEmail?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label={
                        <>
                          Select Work ID Image:{" "}
                          <i className="text-[10px]">Image or PDF</i>
                        </>
                      }
                      onChange={async (event) => {
                        const file = event?.target?.files?.[0];
                        if (file) {
                          const base64File = await convertToBase64(file);
                          setValue("workIdentification", base64File);
                        }
                      }}
                      error={errors?.workIdentification?.message}
                      type="file"
                      className="file:rounded-sm file:bg-black file:text-sm file:text-white"
                      disabled={isSubmitting}
                      accept="image/*, application/pdf"
                    />
                  </div>
                  <div>
                    <Input
                      label={
                        <>
                          Select NIN Card Image:{" "}
                          <i className="text-[10px]">Image or PDF (optional)</i>
                        </>
                      }
                      onChange={async (event) => {
                        const file = event?.target?.files?.[0];
                        if (file) {
                          const base64File = await convertToBase64(file);
                          setValue("IdentificationImage", base64File);
                        }
                      }}
                      error={errors?.IdentificationImage?.message}
                      type="file"
                      className="file:rounded-sm file:bg-black file:text-sm file:text-white"
                      disabled={isSubmitting}
                      accept="image/*, application/pdf"
                    />
                  </div>
                  <div>
                    <Input
                      label={
                        <>
                          Select Passport Image:{" "}
                          <i className="text-[8px]">Only images are allowed</i>
                        </>
                      }
                      onChange={async (event) => {
                        const file = event?.target?.files?.[0];
                        if (file) {
                          const base64File = await convertToBase64(file);
                          setValue("CustomerImage", base64File);
                        }
                      }}
                      error={errors?.CustomerImage?.message}
                      type="file"
                      className="file:rounded-sm file:bg-black file:text-sm file:text-white"
                      disabled={isSubmitting}
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <Input
                      label={
                        <>
                          Other Supporting Document{" "}
                          <i className="text-[10px] font-normal">
                            Optional Image or PDF file
                          </i>
                        </>
                      }
                      onChange={async (event) => {
                        const file = event?.target?.files?.[0];
                        if (file) {
                          const base64File = await convertToBase64(file);
                          setValue("otherDocument", base64File);
                        }
                      }}
                      type="file"
                      className="file:rounded-sm file:bg-black file:text-sm file:text-white"
                      disabled={isSubmitting}
                      accept="image/*, application/pdf"
                    />
                  </div>
                  <div className="lg:col-span-full">
                    <hr />
                    <h4 className="my-3 text-sm font-semibold">SIGNATURE: </h4>
                    <div className="flex flex-col items-center gap-2 lg:flex-row">
                      <div>
                        <Input
                          label="Upload a signature Image: "
                          error={errors?.CustomerSignature?.message}
                          type="file"
                          className="file:rounded-sm file:bg-black file:text-sm file:text-white"
                          onChange={handleUploadSignature}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    {customerSignature && (
                      <img
                        src={customerSignature as string}
                        alt="Signature"
                        className="max-h-[250px]"
                      />
                    )}
                  </div>
                  <div className="col-span-full">
                    {errors?.root?.message?.split(";").map((error) => (
                      <p key={error} className="text-sm text-red-500">
                        {error}
                      </p>
                    ))}
                  </div>
                  <div className="lg:col-span-full">
                    <div className="col-span-full flex items-center gap-2">
                      <Button className="w-full md:max-w-[250px]">
                        {isSubmitting ? (
                          <>
                            <ClipLoader color="#fff" size={12} /> Submitting
                          </>
                        ) : (
                          <>Submit</>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </>
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default EditInformation;
