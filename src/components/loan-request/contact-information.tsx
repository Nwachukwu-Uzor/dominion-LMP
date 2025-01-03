import React, { useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import {
  NOTIFICATION_PREFERENCE_OPTIONS,
  SESSION_STORAGE_KEY,
} from "@/constants";
import { Textarea } from "../ui/textarea";
import { AccountLoanType, CustomerInfoType } from "@/types/shared";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { AccountService } from "@/services";
import { ClipLoader } from "react-spinners";
import { useMutation } from "@tanstack/react-query";
import { AccountService } from "@/services";
import { NonPaginatedTable } from "../shared";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils";
import { formatDate } from "date-fns";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const schema = z.object({
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
  BVN: z
    .string({ required_error: "Bvn is required" })
    .length(11, "BVN must be 11 characters long")
    .regex(/^[\d*]+$/, { message: "BVN must contain only digits" }),
});

type FormFields = z.infer<typeof schema>;

export const ContactInformation: React.FC<Props> = ({ handleUpdateStep }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoType | null>(
    null,
  );
  const [customerLoans, setCustomerLoans] = useState<AccountLoanType[]>([]);

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

  const [NotificationPreference] = watch(["NotificationPreference"]);

  const accountService = new AccountService();

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

      // resetForm();
      setValue("BVN", data.id);
      const { customerInfo } = response.payload;
      if (customerInfo && Object.keys(customerInfo).length > 0) {
        // populateFieldsWithCustomInfo(customerInfo);
        setCustomerInfo(customerInfo);
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

  // useEffect(() => {
  //   const data = sessionStorage.getItem(
  //     `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
  //   );

  //   const customerInfo = sessionStorage.getItem(
  //     `${SESSION_STORAGE_KEY}_CUSTOMER_INFO`,
  //   );

  //   if (customerInfo) {
  //     const infoFromStorage = JSON.parse(customerInfo) as CustomerInfoType;
  //     setCustomerInfo(infoFromStorage);
  //   }

  //   if (data) {
  //     const parsedData = JSON.parse(data) as FormFields;
  //     const fields = getValues();
  //     for (const key in parsedData) {
  //       if (key in fields) {
  //         setValue(
  //           key as keyof FormFields,
  //           parsedData[key as keyof FormFields] ?? "",
  //         );
  //       }
  //     }
  //     if (parsedData.NotificationPreference) {
  //       setValue("NotificationPreference", parsedData.NotificationPreference);
  //     }
  //     if (parsedData.ippisNumber) {
  //       setValue("ippisNumber", parsedData.ippisNumber);
  //     }
  //     if (customerInfo) {
  //       const infoFromStorage = JSON.parse(customerInfo) as CustomerInfoType;
  //       validateIppisData(infoFromStorage.ippisNumber);
  //     } else {
  //       validateIppisData(parsedData.ippisNumber);
  //     }
  //     return;
  //   }

  //   if (customerInfo) {
  //     const infoFromStorage = JSON.parse(customerInfo) as CustomerInfoType;
  //     const parseInfo = maskData(infoFromStorage);
  //     setValue("Address", parseInfo.Address ?? "");
  //     setValue("Email", parseInfo.Email ?? "");
  //     setValue("PhoneNo", parseInfo.PhoneNo ?? "");
  //     if (parseInfo?.NextOfKinName) {
  //       const [NextOfKinFirstName, NextOfKinLastName] =
  //         infoFromStorage.NextOfKinName.split(" ");
  //       setValue("NextOfKinFirstName", maskValue(NextOfKinFirstName) ?? "");
  //       setValue("NextOfKinLastName", maskValue(NextOfKinLastName) ?? "");
  //     }
  //     setValue("alternatePhoneNo", parseInfo.alternatePhoneNo);
  //     setValue("NextOfKinPhoneNo", parseInfo.NextOfKinPhoneNo);
  //     setValue("organizationEmployer", parseInfo.organizationEmployer);
  //     setValue("ippisNumber", parseInfo.ippisNumber ?? "");
  //     validateIppisData(infoFromStorage.ippisNumber);
  //     return;
  //   }

  //   const bvnDetails = JSON.parse(
  //     sessionStorage.getItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`) as string,
  //   ) as BVNType;

  //   if (bvnDetails) {
  //     setValue("PhoneNo", bvnDetails.phoneNumber);
  //   }
  //   return;
  // }, [setValue, getValues, validateIppisData]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      // await accountService.validateIPPISNumber({
      //   IppisNumber: values.ippisNumber,
      // });
      if (!bvnDetails) {
        toast.warn("Please provide a valid BVN to proccess....");
        return;
      }
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
        JSON.stringify(values),
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "2");
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

  const handleBackClick = () => {
    sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "0");
    handleUpdateStep(false);
  };

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
                ? (bvnError as any)?.response?.data?.payload?.error
                : errors?.BVN?.message
            }
            type="number"
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              resetBvnDetails();
              // setCustomerLoans([]);
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`);
              // sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_CUSTOMER_INFO`);
              // sessionStorage.removeItem(
              //   `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
              // );
              // sessionStorage.removeItem(
              //   `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
              // );
              // sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_MESSAGE`);
              // sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_DOCUMENTS`);
              // sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_IPPIS_INFO`);
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
            label="Phone No"
            {...register("PhoneNo")}
            error={errors?.PhoneNo?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("PhoneNo", value);
              await trigger("PhoneNo");
            }}
            disabled={customerInfo !== null}
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
            disabled={customerInfo !== null}
          />
        </div>
        <div>
          <Input
            label="Email"
            {...register("Email")}
            error={errors?.Email?.message}
            disabled={customerInfo !== null}
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
            disabled={customerInfo !== null}
          />
        </div>

        <div>
          <Input
            label="Next of Kin First Name: "
            {...register("NextOfKinFirstName")}
            error={errors?.NextOfKinFirstName?.message}
            disabled={customerInfo !== null}
          />
        </div>
        <div>
          <Input
            label="Next of Kin Last Name: "
            {...register("NextOfKinLastName")}
            error={errors?.NextOfKinLastName?.message}
            disabled={customerInfo !== null}
          />
        </div>

        <div>
          <Input
            label="Next of Kin Phone Number: "
            {...register("NextOfKinPhoneNo")}
            error={errors?.NextOfKinPhoneNo?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("NextOfKinPhoneNo", value);
              await trigger("NextOfKinPhoneNo");
            }}
            disabled={customerInfo !== null}
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
        <p className="my-1 text-sm font-semibold text-red-600 lg:col-span-full">
          {errors?.root?.message}
        </p>
        <div className="col-span-full flex items-center gap-2">
          <Button
            className="w-full bg-black md:max-w-[200px]"
            type="button"
            onClick={handleBackClick}
          >
            Back
          </Button>
          <Button className="w-full md:max-w-[200px]">
            {isSubmitting ? (
              <>
                <ClipLoader size={12} color="#fff" /> <span>Loading...</span>
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    </>
  );
};
