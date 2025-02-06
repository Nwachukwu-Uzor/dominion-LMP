import {
  AddDocumentForm,
  Container,
  NonPaginatedTable,
  PageTitle,
  ReactSelectCustomized,
} from "@/components/shared";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BANKS_LIST,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { isValid } from "date-fns";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnCompletedLoanRequestType } from "@/types/shared";
import {
  calculateEligibleAmountByOrganizationUsingIppisPrefix,
  calculateLoanForOrganizationForIppisPrefix,
  formatNumberWithCommasWithOptionPeriodSign,
  getLoanRepaymentInfo,
  shouldAllowEligibilityByPass,
} from "@/utils";
import { Textarea } from "@/components/ui/textarea";
import { IoMdCheckmarkCircleOutline, IoMdClose } from "react-icons/io";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const getLoanSchema = (maxLoanAmount: number) => {
  return z
    .object({
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
        .regex(/^[\d*]+$/, {
          message: "Phone number must contain only digits",
        }),
      alternatePhoneNo: z
        .string({
          required_error: "Preferred Phone Number is required",
        })
        .length(11, "Phone Number must be 11 characters long")
        .regex(/^[\d*]+$/, {
          message: "Phone number must contain only digits",
        }),
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
        .regex(/^[\d*]+$/, {
          message: "Phone number must contain only digits",
        }),
      Address: z
        .string({ required_error: "Address is required" })
        .min(5, { message: "Address is required" }),
      organizationEmployer: z
        .string({ required_error: "Organization Employer is required" })
        .min(2, "OrganizationEmployer must be at least 2 characters long"),
      ippisNumber: z.string({ required_error: "IPPIS number is required" }),
      bankName: z
        .string({ required_error: "Salary bank is required" })
        .min(2, "Salary bank is required"),
      salaryAccountNumber: z
        .string({ required_error: "Account number is required" })
        .min(10, "Account must be at least 10 digits")
        .regex(/^\d+$/, { message: "Account number must contain only digits" }),
      loanAmount: z
        .string({
          required_error: "Loan amount is required",
        })
        .regex(/^\d{1,3}(,\d{3})*(\.\d+)?$/, {
          message: "Loan amount must be a valid number",
        }),
      approvedAmount: z
        .string({
          required_error: "Loan amount is required",
        })
        .regex(/^\d{1,3}(,\d{3})*(\.\d+)?$/, {
          message: "Loan amount must be a valid number",
        }),
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
    })
    .superRefine((values, ctx) => {
      const { loanAmount, ippisNumber } = values;
      const shouldByPassValidation = shouldAllowEligibilityByPass(
        ippisNumber ?? "",
      );
      if (shouldByPassValidation) {
        return;
      }
      const numberValue = Number(loanAmount.replace(/,/g, ""));
      const isEligible =
        !Number.isNaN(numberValue) &&
        numberValue <= maxLoanAmount &&
        numberValue > 0;

      if (!isEligible) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["loanAmount"],
          message: `Loan amount must be less than eligible amount ${formatNumberWithCommasWithOptionPeriodSign(maxLoanAmount)}`,
        });
      }
    });
};

const INITIAL_LOAN_PAYMENT = {
  monthlyRepayment: "0",
  totalPayment: "0",
  eligibleAmount: "0",
};

const TENURE_OPTIONS = Array.from({ length: 22 }, (_v, i) => i + 3)?.map(
  (n) => ({ id: n, value: n.toString(), label: n.toString() }),
);

type DocumentType = {
  id: number;
  title: string;
  path: string;
};

const MODAL_TYPES = {
  ADD_ADDITIONAL_DOCUMENT: "ADD_ADDITIONAL_DOCUMENT",
  ADD_OTHER_DOCUMENT: "ADD_OTHER_DOCUMENT",
};

const EditInformation: React.FC = () => {
  const { accountId } = useParams<{ id: string; accountId: string }>();
  // const [customerLoans, setCustomerLoans] = useState<AccountLoanType[]>([]);
  const [loanRepayment, setLoanRepayment] = useState(INITIAL_LOAN_PAYMENT);
  const [additionalFile, setAdditionalFile] = useState<DocumentType[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<DocumentType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [isDone, setIsDone] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const accountService = new AccountService();

  const populateFieldsWithCustomInfo = useCallback((data: UnCompletedLoanRequestType) => {
    setValue("FirstName", data?.customerDetails?.FirstName ?? "");
    setValue("LastName", data?.customerDetails?.LastName ?? "");
    setValue("OtherNames", data?.customerDetails?.OtherName ?? "");
    setValue("Gender", GENDER_ENUM[data?.customerDetails?.Gender] ?? "");
    setValue(
      "NationalIdentityNo",
      data?.customerDetails?.NationalIdentityNo ?? "",
    );
    setValue("title", data?.customerDetails?.title ?? "");
    setValue("DateOfBirth", data?.customerDetails?.DateOfBirth ?? "");
    setValue("state", data?.customerDetails?.state ?? "");
    setValue("BVN", data?.customerDetails?.BVN ?? "");
    setValue(
      "NationalIdentityNo",
      data?.customerDetails?.NationalIdentityNo ?? "",
    );
    setValue("PhoneNo", data?.customerDetails?.PhoneNo ?? "");
    setValue("alternatePhoneNo", data?.customerDetails?.alternatePhoneNo ?? "");
    setValue("Email", data?.customerDetails?.Email ?? "");
    setValue(
      "NotificationPreference",
      data?.customerDetails?.NotificationPreference ?? "",
    );
    setValue("Address", data?.customerDetails?.Address ?? "");
    setValue("ippisNumber", data?.customerDetails?.ippisNumber ?? "");
    setValue(
      "organizationEmployer",
      data?.customerDetails?.organizationEmployer ?? "",
    );
    setValue(
      "NextOfKinFirstName",
      data?.customerDetails?.NextOfKinName?.split(" ")[0] ?? "",
    );
    setValue(
      "NextOfKinLastName",
      data?.customerDetails?.NextOfKinName?.split(" ")[1] ?? "",
    );
    setValue("NextOfKinPhoneNo", data?.customerDetails?.NextOfKinPhoneNo ?? "");
    setValue("AccountOfficerCode", data?.accountDetails?.AccountOfficerCode ?? "");
    setValue("AccountOfficerEmail", data?.accountDetails?.AccountOfficerEmail ?? "");
    setValue(
      "loanAmount",
      formatNumberWithCommasWithOptionPeriodSign(
        data?.loanAccountDetails?.Amount ?? "",
      ),
    );
    setValue(
      "approvedAmount",
      formatNumberWithCommasWithOptionPeriodSign(
        data?.loanAccountDetails?.Amount ?? "",
      ),
    );
    setValue("loanTenor", data?.loanAccountDetails?.Tenure ?? "");
    setValue("bankName", data?.customerDetails?.bankName ?? "");
    setValue(
      "salaryAccountNumber",
      data?.customerDetails?.salaryAccountNumber ?? "",
    );
    if (data?.customerDetails?.CustomerSignature) {
      setValue(
        "CustomerSignature",
        data?.customerDetails?.CustomerSignature ?? "",
      );
    }
    if (data?.customerDetails?.CustomerImage) {
      setValue("CustomerImage", data?.customerDetails?.CustomerImage ?? "");
    }
    handleTenorFieldBlur(data?.loanAccountDetails?.Tenure);
    handleAmountFieldBlur(data?.loanAccountDetails?.Amount ?? "");
    validateBVN({ id: data?.customerDetails?.BVN ?? "" });
    validateIppisData(data?.customerDetails?.ippisNumber ?? "");
  }, []);

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
    approvedAmount,
    bankName,
    customerImage,
  ] = watch([
    "Gender",
    "state",
    "NotificationPreference",
    "ippisNumber",
    "CustomerSignature",
    "loanTenor",
    "approvedAmount",
    "bankName",
    "CustomerImage",
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

      if (accountInfo) {
        const repaymentInfo = calculateLoanForOrganizationForIppisPrefix(
          ippisNumber ?? "",
          Number(accountInfo?.loanAccountDetails?.Amount),
          Number(accountInfo?.loanAccountDetails?.Tenure),
          Number(ippisData?.netPay) ?? 0,
        );
        setLoanRepayment({
          monthlyRepayment: repaymentInfo.monthlyInstallment,
          totalPayment: repaymentInfo.totalRepayment,
          eligibleAmount: repaymentInfo.eligibleAmount,
        });
      }
      return ippisData;
    },
  });

  useEffect(() => {
    if (loanTenor && ippisData && approvedAmount) {
      trigger("approvedAmount");
    }
  }, [loanTenor, trigger, loanRepayment, ippisData, approvedAmount]);

  const handleValidateIppisData = async (
    event: React.FocusEvent<HTMLInputElement>,
  ) => {
    if (accountInfo) {
      await validateIppisData(event.target.value);
    }
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
    
      return accountData?.accountRecords;
    },
  });

  useEffect(() => {
    if (accountInfo) {
    populateFieldsWithCustomInfo(accountInfo);
    }
  }, [accountInfo])

  const handleToggleModal = (modalType?: string) => {
    if (!modalType) {
      setShowModal(false);
      setModalType("");
      return;
    }
    setModalType(modalType);
    setShowModal(true);
  };

  const additionalFileTableColumns: ColumnDef<DocumentType>[] = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: ({ getValue }) => {
        const id = getValue<number>();
        return (
          <div>
            <button
              className="text-xs font-semibold text-red-700 active:scale-75"
              type="button"
              onClick={() => handleRemoveAdditionalFile(id)}
            >
              Remove
            </button>
          </div>
        );
      },
    },
  ];
  const otherTableColumns: ColumnDef<DocumentType>[] = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: ({ getValue }) => {
        const id = getValue<number>();
        return (
          <div>
            <button
              className="text-xs font-semibold text-red-700 active:scale-75"
              type="button"
              onClick={() => handleRemoveOtherDocument(id)}
            >
              Remove
            </button>
          </div>
        );
      },
    },
  ];

  const handleAddAdditionalFile = (data: { title: string; path: string }) => {
    setAdditionalFile((docs) => [
      ...docs,
      { ...data, id: new Date().getTime() },
    ]);
    handleToggleModal();
  };

  const handleRemoveAdditionalFile = (id: number) => {
    setAdditionalFile((docs) => docs.filter((d) => d.id !== id));
  };
  const handleAddOtherDocument = (data: { title: string; path: string }) => {
    setOtherDocuments((docs) => [
      ...docs,
      { ...data, id: new Date().getTime() },
    ]);
    handleToggleModal();
  };

  const handleRemoveOtherDocument = (id: number) => {
    setOtherDocuments((docs) => docs.filter((d) => d.id !== id));
  };

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const payload = {
        ...values,
        loanAmount: values.loanAmount.replace(/,/g, ""),
        oldAmount: values.loanAmount.replace(/,/g, ""),
        approvedAmount: values.approvedAmount.replace(/,/g, ""),
        monthlyPayment: loanRepayment.monthlyRepayment.replace(/,/g, ""),
        totalPayment: loanRepayment.totalPayment.replace(/,/g, ""),
        // AccountOpeningTrackingRef: accountInfo?.AccountOpeningTrackingRef ?? "",
        additionalFile: additionalFile?.map((doc) => ({
          title: doc.title,
          path: doc.path,
        })),
        // otherDocument: otherDocuments?.map((doc) => ({
        //   title: doc.title,
        //   path: doc.path,
        // })),
        loanAccountId: accountInfo?.loanAccountId,
      };
      const response = await accountService.editLoanRequest(payload);
      toast.success(response?.message ?? "Loan request edited successfully");
      setIsDone(true);
      queryClient.removeQueries({ queryKey: [FETCH_ACCOUNT_DETAILS_BY_ID] });
      queryClient.clear();
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

  const handleAmountFieldBlur = (data: string) => {
    const amount = data.replace(/,/g, "");
    if (
      !shouldAllowEligibilityByPass(ippisNumber) &&
      (!ippisData || !loanTenor)
    ) {
      return;
    }

    const paymentInfo = getLoanRepaymentInfo(
      Number(amount),
      Number(loanTenor),
      ippisNumber ?? "",
    );

    setLoanRepayment((prev) => ({
      ...prev,
      ...paymentInfo,
    }));
  };

  const handleTenorFieldBlur = async (loanTenor: string) => {
    if (
      !ippisData &&
      shouldAllowEligibilityByPass(ippisNumber) &&
      approvedAmount
    ) {
      const paymentInfo = getLoanRepaymentInfo(
        Number(approvedAmount.replace(/,/g, "")),
        Number(loanTenor),
        "",
      );

      setLoanRepayment((prev) => ({
        ...prev,
        ...paymentInfo,
      }));
    }

    if (!ippisData) {
      return;
    }

    if (shouldAllowEligibilityByPass(ippisNumber)) {
      return;
    }
    const eligibleAmount =
      calculateEligibleAmountByOrganizationUsingIppisPrefix(
        Number(ippisData.netPay),
        Number(loanTenor),
        ippisNumber,
      );
    setLoanRepayment((prev) => ({
      ...prev,
      eligibleAmount: eligibleAmount.toString(),
    }));

    const amount = approvedAmount.replace(/[^0-9.]/g, "");

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

  useEffect(() => {
    if (
      (!ippisData || isIppisError) &&
      shouldAllowEligibilityByPass(ippisNumber) &&
      approvedAmount &&
      loanTenor
    ) {
      const paymentInfo = getLoanRepaymentInfo(
        Number(approvedAmount?.replace(/,/g, "")),
        Number(loanTenor),
        "",
      );

      setLoanRepayment((prev) => ({
        ...prev,
        ...paymentInfo,
      }));
      return;
    }
    if (ippisData && approvedAmount && loanTenor) {
      const amount = approvedAmount.replace(/[^0-9.]/g, "");
      const repaymentInfo = calculateLoanForOrganizationForIppisPrefix(
        ippisNumber ?? "",
        Number(amount) ?? 0,
        Number(loanTenor),
        Number(ippisData?.netPay) ?? 0,
      );

      setLoanRepayment({
        monthlyRepayment: repaymentInfo.monthlyInstallment,
        totalPayment: repaymentInfo.totalRepayment,
        eligibleAmount: repaymentInfo.eligibleAmount ?? 0,
      });
    }
  }, [approvedAmount, loanTenor, ippisData, isIppisError, ippisNumber]);

  const selectedLoanTenor = TENURE_OPTIONS.find(
    (opt) => Number(opt.value) === Number(loanTenor),
  );

  const selectedBank = BANKS_LIST.find(
    (bank) => bank.label.toUpperCase() === bankName?.toUpperCase(),
  );

  const selectedGender = GENDER_OPTIONS.find(
    (gender) => gender.value.toUpperCase() === Gender?.toUpperCase(),
  );

  const selectedState = STATE_OPTIONS.find(
    (st) => st.value.toUpperCase() === state?.toUpperCase(),
  );

  const selectedNotificationPreference = NOTIFICATION_PREFERENCE_OPTIONS.find(
    (pref) =>
      pref.value.toUpperCase() === NotificationPreference?.toUpperCase(),
  );

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
                      navigate(-1);
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
                      maxMenuHeight={300}
                    />
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
                      disabled={true}
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
                      shouldAllowEligibilityByPass(ippisNumber) ? null : (
                        <p className="text-xs text-red-500">
                          Unable to retrieve ippis information
                        </p>
                      )
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
                      disabled={!shouldAllowEligibilityByPass(ippisNumber)}
                    />
                  </div>
                  <div>
                    <ReactSelectCustomized
                      label={<>Salary Bank Number</>}
                      options={BANKS_LIST}
                      onChange={(data: any) => {
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
                      // error={errors?.loanAmount?.message}
                      // onChange={async (e) => {
                      //   const value = e.target.value.replace(/[^0-9.]/g, "");
                      //   setValue(
                      //     "loanAmount",
                      //     formatNumberWithCommasWithOptionPeriodSign(value),
                      //     {
                      //       shouldValidate:
                      //         loanTenor !== undefined &&
                      //         !Number.isNaN(loanTenor),
                      //     },
                      //   );
                      // }}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Input
                      label="Approved Amount"
                      {...register("approvedAmount")}
                      error={errors?.approvedAmount?.message}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, "");
                        setValue(
                          "approvedAmount",
                          formatNumberWithCommasWithOptionPeriodSign(value),
                          {
                            shouldValidate:
                              loanTenor !== undefined &&
                              !Number.isNaN(loanTenor),
                          },
                        );
                      }}
                      disabled={isSubmitting}
                      onBlur={(e) => handleAmountFieldBlur(e.target.value)}
                    />
                  </div>
                  <div>
                    <ReactSelectCustomized
                      options={TENURE_OPTIONS}
                      label={
                        <>
                          Loan Tenure:{" "}
                          <i className="text-sx font-light">Months</i>
                        </>
                      }
                      onChange={(data: any) => {
                        if (data) {
                          handleTenorFieldBlur(data.value);
                          setValue("loanTenor", data.value, {
                            shouldValidate: true,
                          });
                        }
                      }}
                      value={selectedLoanTenor}
                      error={errors?.loanTenor?.message}
                    />
                  </div>

                  <div>
                    <Input
                      label="Eligible Amount"
                      value={formatNumberWithCommasWithOptionPeriodSign(
                        loanRepayment?.eligibleAmount ?? 0,
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
                  <div className="rounded-md border border-gray-200 p-2 lg:col-span-full">
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
                    {customerImage && (
                      <img
                        src={customerImage as string}
                        alt="Signature"
                        className="max-h-[250px]"
                      />
                    )}
                  </div>
                  <div className="lg:col-span-full">
                    <div>
                      <h3 className="text-sm font-semibold">Other Documents</h3>
                      <Button
                        className="mt-1 border-0 bg-transparent text-xs text-primary ring-0"
                        type="button"
                        onClick={() =>
                          handleToggleModal(MODAL_TYPES.ADD_OTHER_DOCUMENT)
                        }
                      >
                        Click to Add Other Document
                      </Button>
                    </div>
                    {otherDocuments.length > 0 && (
                      <div className="col-span-full">
                        <h2 className="my-2 text-sm font-medium">Documents</h2>
                        <NonPaginatedTable
                          columns={otherTableColumns}
                          data={otherDocuments}
                          isSearchable={false}
                        />
                      </div>
                    )}
                  </div>
                  <hr />
                  <div className="my-3 rounded-md border border-gray-200 p-2 lg:col-span-full">
                    <h4 className="mb-2 text-sm font-semibold">SIGNATURE: </h4>
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
                  <div className="lg:col-span-full">
                    <div>
                      <h3 className="text-sm font-semibold">
                        Additional Documents
                      </h3>
                      <Button
                        className="mt-1 border-0 bg-transparent text-xs text-primary ring-0"
                        type="button"
                        onClick={() =>
                          handleToggleModal(MODAL_TYPES.ADD_ADDITIONAL_DOCUMENT)
                        }
                      >
                        Click to Add Additional Document
                      </Button>
                    </div>
                    {additionalFile.length > 0 && (
                      <div className="col-span-full">
                        <h2 className="my-2 text-sm font-medium">Documents</h2>
                        <NonPaginatedTable
                          columns={additionalFileTableColumns}
                          data={additionalFile}
                          isSearchable={false}
                        />
                      </div>
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
      <Dialog open={showModal}>
        <DialogContent className="w-[90vw] gap-0 md:max-w-[600px]">
          <div className="flex justify-end">
            <button disabled={isSubmitting}>
              <IoMdClose
                className="cursor-pointer transition-all hover:scale-150"
                onClick={() => handleToggleModal()}
              />
            </button>
          </div>

          {modalType === MODAL_TYPES.ADD_ADDITIONAL_DOCUMENT && (
            <>
              <AddDocumentForm handleAddDocument={handleAddAdditionalFile} />
            </>
          )}
          {modalType === MODAL_TYPES.ADD_OTHER_DOCUMENT && (
            <>
              <AddDocumentForm handleAddDocument={handleAddOtherDocument} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditInformation;
