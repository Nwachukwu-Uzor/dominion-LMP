import React, { useEffect } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { SESSION_STORAGE_KEY } from "@/constants";
import { Textarea } from "../ui/textarea";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const schema = z.object({
  PhoneNo: z
    .string({
      required_error: "Phone Number is required",
    })
    .min(10, "Phone Number must be at least 10 characters")
    .regex(/^\d+$/, { message: "BVN must contain only digits" }),
  Email: z
    .string({
      required_error: "Email is required",
    })
    .email("Please provide a valid email address"),
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
    .min(10, "Must be at least 10 characters long")
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  Address: z
    .string({ required_error: "Address is required" })
    .min(5, { message: "Address is required" }),
  organizationEmployer: z
    .string({ required_error: "Organization Employer is required" })
    .min(2, "OrganizationEmployer must be at least 2 characters long"),
  ippisNumber: z
    .string({ required_error: "IPPIS number is required" })
    .regex(/^\d+$/, { message: "IPPIS must contain only digits" }),
});

type FormFields = z.infer<typeof schema>;

export const ContactInformation: React.FC<Props> = ({ handleUpdateStep }) => {
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const data = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`
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
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
        JSON.stringify(values)
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
        error?.response?.data?.message ?? error?.message ?? "An error occurred"
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-4"
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
          />
        </div>
        <div>
          <Input
            label="Email"
            {...register("Email")}
            error={errors?.Email?.message}
          />
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
            label="Employer (Organization)"
            {...register("organizationEmployer")}
            error={errors?.organizationEmployer?.message}
          />
        </div>
        <div>
          <Input
            label="IPPIS Number"
            {...register("ippisNumber")}
            error={errors?.ippisNumber?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("ippisNumber", value);
              await trigger("ippisNumber");
            }}
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
          />
        </div>

        <div className="flex items-center gap-2 col-span-full">
          <Button
            className="max-w-[175px] bg-black"
            type="button"
            onClick={handleBackClick}
          >
            Back
          </Button>
          <Button className="max-w-[175px]">Next</Button>
        </div>
      </form>
    </>
  );
};
