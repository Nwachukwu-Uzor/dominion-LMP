import {
  Container,
  PageTitle,
  ReactSelectCustomized,
} from "@/components/shared";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BANKS_LIST,
  GENDER_ENUM,
  GENDER_OPTIONS,
  GENDERS,
  SESSION_STORAGE_KEY,
  TITLES,
} from "@/constants";

import { ClipLoader } from "react-spinners";

import { useNavigate, useParams } from "react-router-dom";
import { AccountService } from "@/services";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FETCH_ACCOUNT_DETAILS_BY_ID,
  FETCH_PROFILE_INFORMATION_BY_CUSTOMER_ID,
} from "@/constants/query-keys";

const schema = z.object({
  title: z.optional(z.string()),
  Gender: z
    .string({ required_error: "Gender is required" })
    .min(4, { message: "Gender is required" }),
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
    .regex(/^\d+$/, { message: "BVN must contain only digits" }),
  NationalIdentityNo: z
    .string()
    .length(11, "NIN must be 11 characters long")
    .regex(/^\d+$/, { message: "NIN must contain only digits" })
    .optional()
    .or(z.literal("")),
  PhoneNo: z
    .string({
      required_error: "Preferred Phone Number is required",
    })
    .length(11, "Phone Number must be 11 characters long")
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  alternatePhoneNo: z
    .string({
      required_error: "Preferred Phone Number is required",
    })
    .length(11, "Phone Number must be 11 characters long")
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  Email: z
    .string({
      required_error: "Email is required",
    })
    .email("Please provide a valid email address"),
  // NotificationPreference: z.string({
  //   required_error: "Notification Preference is required",
  // }),
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
  NextOfKinPhoneNumber: z
    .string({ required_error: "Next of Kin phone number is required" })
    .length(11, "Phone Number must be 11 characters long")
    .regex(/^[\d*]+$/, { message: "Phone number must contain only digits" }),
  Address: z
    .string({ required_error: "Address is required" })
    .min(5, { message: "Address is required" }),
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
  City: z.string({ required_error: "City is required" }),
  ReferralName: z
    .string({ required_error: "Referral name is required" })
    .optional()
    .or(z.literal("")),
  ReferralPhoneNo: z
    .string({ required_error: "Referral phone number is required" })
    .optional()
    .or(z.literal("")),
  AccountOfficerCode: z.string({
    required_error: "Account officer code is required",
  }),
  AccountOfficerEmail: z
    .string({
      required_error: "Account officer email is required",
    })
    .email("Please provide a valid email address"),
  bankName: z
    .string({ required_error: "Salary bank is required" })
    .min(2, "Salary bank is required"),
  salaryAccountNumber: z
    .string({ required_error: "Account number is required" })
    .min(10, "Account must be at least 10 digits")
    .regex(/^\d+$/, { message: "Account number must contain only digits" }),
});

type FormFields = z.infer<typeof schema>;

const EditDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const accountService = new AccountService(token);

  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = today.toISOString().split("T")[0];

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

  const [Gender, bankName] = watch(["Gender", "bankName"]);

  const {
    data: accountInfo,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [FETCH_PROFILE_INFORMATION_BY_CUSTOMER_ID, customerId],
    queryFn: async ({ queryKey }) => {
      const customerId = queryKey[1];
      if (!customerId) {
        return;
      }
      const accountData =
        await accountService.getAccountByCustomerId(customerId);

      return accountData?.accountRecords;
    },
  });

  useEffect(() => {
    if (accountInfo && accountInfo?.profile) {
      const { profile } = accountInfo;
      // eslint-disable-next-line
      const { otherDocuments, ...profileInfo } = profile;
      const fields = getValues();
      const parsedProfile = profileInfo as unknown as  Record<string, string>;

      for (const key in profileInfo) {
        if (key in fields) {
          setValue(key as keyof FormFields, parsedProfile[key] ?? "");
        }
      }

      if (profile.Gender) {
        setValue("Gender", GENDER_ENUM[profile.Gender]);
      }

      if (profile.NextOfKinPhoneNo) {
        setValue("NextOfKinPhoneNumber", profile.NextOfKinPhoneNo);
      }

      if (profile?.NextOfKinName) {
        const [nextOfKinFirstName, nextOfKinLastName] =
          profile.NextOfKinName.split(" ");
        setValue("NextOfKinFirstName", nextOfKinFirstName);
        setValue("NextOfKinLastName", nextOfKinLastName);
      }

      if (accountInfo?.AccountOfficerCode) {
        setValue("AccountOfficerCode", accountInfo.AccountOfficerCode);
      }

      if (accountInfo?.AccountOfficerEmail) {
        setValue("AccountOfficerEmail", accountInfo.AccountOfficerEmail);
      }
    }
  }, [accountInfo, getValues, setValue]);

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
      const info = response?.payload?.mainOneDetails?.bvnDetails;
      return info;
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

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      if (!customerId) {
        return;
      }
      const payload = {
        ...accountInfo?.profile,
        ...values,
        CustomerID: customerId,
        Gender: values?.Gender?.toLowerCase(),
      };
      const response = await accountService.editCustomerInfo(payload);
      toast.success(response?.message);
      queryClient.resetQueries({
        queryKey: [FETCH_ACCOUNT_DETAILS_BY_ID],
      });
      navigate(`/accounts/${customerId}`);
      // sessionStorage.setItem(
      //   `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
      //   JSON.stringify(values),
      // );
      // sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "1");
      // handleUpdateStep();
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

  const selectedGender = GENDER_OPTIONS.find(
    (gender) => gender.value.toUpperCase() === Gender?.toUpperCase(),
  );

  const selectedBank = BANKS_LIST.find(
    (bank) => bank.label.toUpperCase() === bankName?.toUpperCase(),
  );

  return (
    <>
      <Container>
        <PageTitle title="Edit Customer Details" />
        <Card className="my-2 rounded-sm">
          {isLoading ? (
            <div className="flex min-h-[25vh] items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : isError ? (
            <div className="text-sm text-red-600">{error?.message}</div>
          ) : accountInfo?.profile ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)}>
                <article className="grid gap-4 py-4 lg:grid-cols-2 lg:gap-x-12">
                  <div>
                    <ReactSelectCustomized
                      options={GENDER_OPTIONS}
                      value={selectedGender}
                      error={errors?.Gender?.message}
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
                    />
                  </div>
                  <div>
                    <Input
                      label="First Name"
                      {...register("FirstName")}
                      error={errors?.FirstName?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Last Name"
                      {...register("LastName")}
                      error={errors?.LastName?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Other Name(s): "
                      {...register("OtherNames")}
                      disabled={isSubmitting}
                    />
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
                        sessionStorage.removeItem(
                          `${SESSION_STORAGE_KEY}_BVN_DETAILS`,
                        );
                        setValue("BVN", value);
                        await trigger("BVN");
                      }}
                      disabled={isLoadingBvnDetails || isSubmitting}
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
                      label="Phone Number: "
                      {...register("PhoneNo")}
                      error={errors?.PhoneNo?.message}
                      disabled={isSubmitting}
                      type="number"
                    />
                  </div>
                  <div>
                    <Input
                      label="Alternate phone number: "
                      {...register("alternatePhoneNo")}
                      error={errors?.alternatePhoneNo?.message}
                      disabled={isSubmitting}
                      type="number"
                    />
                  </div>
                  <div>
                    <Input
                      label="Email"
                      {...register("Email")}
                      error={errors?.Email?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Date of Birth"
                      type="date"
                      {...register("DateOfBirth")}
                      error={errors?.DateOfBirth?.message}
                      max={yesterday}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Textarea
                      label="Address"
                      {...register("Address")}
                      error={errors?.Address?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="City"
                      {...register("City")}
                      error={errors?.City?.message}
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Next of Kin First Name: "
                      {...register("NextOfKinFirstName")}
                      error={errors?.NextOfKinFirstName?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Next of Kin Last Name: "
                      {...register("NextOfKinLastName")}
                      error={errors?.NextOfKinLastName?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Next of Kin Phone Number: "
                      {...register("NextOfKinPhoneNumber")}
                      error={errors?.NextOfKinPhoneNumber?.message}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setValue("NextOfKinPhoneNumber", value);
                        await trigger("NextOfKinPhoneNumber");
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Referral Name: "
                      {...register("ReferralName")}
                      error={errors?.ReferralName?.message}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Input
                      label="Referral Phone Number: "
                      {...register("ReferralPhoneNo")}
                      error={errors?.ReferralPhoneNo?.message}
                      type="number"
                      disabled={isSubmitting}
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
                    <ReactSelectCustomized
                      label={<>Salary Bank Number</>}
                      options={BANKS_LIST}
                      onChange={(data) => {
                        const value = data?.label ?? "";
                        setValue("bankName", value, { shouldValidate: true });
                      }}
                      error={errors?.bankName?.message}
                      menuPosition="fixed"
                      value={selectedBank}
                    />
                  </div>
                  <div>
                    <Input
                      label="Account Number"
                      {...register("salaryAccountNumber")}
                      error={errors?.salaryAccountNumber?.message}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setValue("salaryAccountNumber", value, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                  <p className="my-1 text-sm font-semibold text-red-600 lg:col-span-full">
                    {errors?.root?.message}
                  </p>
                  <div className="col-span-full flex items-center gap-2">
                    <Button
                      className="w-full max-w-[300px]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <ClipLoader size={12} color="#fff" />{" "}
                          <span>Loading...</span>
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                </article>
              </form>
            </>
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default EditDetails;
