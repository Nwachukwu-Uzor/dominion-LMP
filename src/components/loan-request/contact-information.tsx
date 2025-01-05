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
// import { AccountService } from "@/services";
import { ClipLoader } from "react-spinners";
import { maskData, maskValue } from "@/utils";
import { ReactSelectCustomized } from "../shared";

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

        // Check if the string contains at least 50% asterisks
        const totalLength = value.length;
        const asteriskCount = value.split("*").length - 1;
        const asteriskPercentage = (asteriskCount / totalLength) * 100;

        return asteriskPercentage >= 50;
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

  const [NotificationPreference] = watch(["NotificationPreference"]);

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
      return;
    }

    const bvnDetails = JSON.parse(
      sessionStorage.getItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`) as string,
    ) as BVNType;

    if (bvnDetails) {
      setValue("PhoneNo", bvnDetails.phoneNumber);
    }
    return;
  }, [setValue, getValues]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      // await accountService.validateIPPISNumber({
      //   IppisNumber: values.ippisNumber,
      // });
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
        JSON.stringify(values),
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "3");
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

  const selectedNotificationPreference = NOTIFICATION_PREFERENCE_OPTIONS.find(
    (pref) =>
      pref.value.toUpperCase() === NotificationPreference?.toUpperCase(),
  );

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
          <ReactSelectCustomized
            options={NOTIFICATION_PREFERENCE_OPTIONS}
            label={<>Notification Preference</>}
            placeholder="Notification Preference"
            onChange={(data) => {
              const value = data?.value ?? "";
              setValue("NotificationPreference", value, {
                shouldValidate: true,
              });
            }}
            value={selectedNotificationPreference}
            error={errors?.NotificationPreference?.message}
          />
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
