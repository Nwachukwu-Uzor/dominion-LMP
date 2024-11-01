import React, { useEffect, useState } from "react";
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
import { BVNType, CustomerInfoType } from "@/types/shared";
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
import { maskData, maskValue } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { AccountService } from "@/services";

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
  organizationEmployer: z
    .string({ required_error: "Organization Employer is required" })
    .min(2, "OrganizationEmployer must be at least 2 characters long"),
  ippisNumber: z.string({ required_error: "IPPIS number is required" }),
});

type FormFields = z.infer<typeof schema>;

export const ContactInformation: React.FC<Props> = ({ handleUpdateStep }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoType | null>(
    null,
  );

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

  const [NotificationPreference, ippisNumber] = watch([
    "NotificationPreference",
    "ippisNumber",
  ]);

  const accountService = new AccountService();

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

  useEffect(() => {
    const data = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
    );

    const customerInfo = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_CUSTOMER_INFO`,
    );

    if (customerInfo) {
      const infoFromStorage = JSON.parse(customerInfo) as CustomerInfoType;
      setCustomerInfo(infoFromStorage);
    }

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
      if (parsedData.NotificationPreference) {
        setValue("NotificationPreference", parsedData.NotificationPreference);
      }
      if (parsedData.ippisNumber) {
        setValue("ippisNumber", parsedData.ippisNumber);
      }
      if (customerInfo) {
        const infoFromStorage = JSON.parse(customerInfo) as CustomerInfoType;
        validateIppisData(infoFromStorage.ippisNumber);
      } else {
        validateIppisData(parsedData.ippisNumber);
      }
      return;
    }

    if (customerInfo) {
      const infoFromStorage = JSON.parse(customerInfo) as CustomerInfoType;
      const parseInfo = maskData(infoFromStorage);
      setValue("Address", parseInfo.Address ?? "");
      setValue("Email", parseInfo.Email ?? "");
      setValue("PhoneNo", parseInfo.PhoneNo ?? "");
      if (parseInfo?.NextOfKinName) {
        const [NextOfKinFirstName, NextOfKinLastName] =
          infoFromStorage.NextOfKinName.split(" ");
        setValue("NextOfKinFirstName", maskValue(NextOfKinFirstName) ?? "");
        setValue("NextOfKinLastName", maskValue(NextOfKinLastName) ?? "");
      }
      setValue("alternatePhoneNo", parseInfo.alternatePhoneNo);
      setValue("NextOfKinPhoneNo", parseInfo.NextOfKinPhoneNo);
      setValue("organizationEmployer", parseInfo.organizationEmployer);
      setValue("ippisNumber", parseInfo.ippisNumber ?? "");
      validateIppisData(infoFromStorage.ippisNumber);
      return;
    }

    const bvnDetails = JSON.parse(
      sessionStorage.getItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`) as string,
    ) as BVNType;

    if (bvnDetails) {
      setValue("PhoneNo", bvnDetails.phoneNumber);
    }
    return;
  }, [setValue, getValues, validateIppisData]);

  const handleValidateIppisData = async (
    event: React.FocusEvent<HTMLInputElement>,
  ) => {
    await validateIppisData(event.target.value);
  };

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      // await accountService.validateIPPISNumber({
      //   IppisNumber: values.ippisNumber,
      // });
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
    sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "1");
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
            label="IPPIS Number"
            onChange={(e) => {
              setValue("ippisNumber", e.target.value, { shouldValidate: true });
              setValue("organizationEmployer", "");
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_IPPIS_INFO`);
              resetIppisInfo();
            }}
            value={ippisNumber}
            error={errors?.ippisNumber?.message}
            disabled={customerInfo !== null || isLoadingIppisInfo}
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
