import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { BANKS_LIST, SESSION_STORAGE_KEY } from "@/constants";
import { AccountService } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import {
  calculateEligibleAmountByOrganization,
  formatNumberWithCommasWithOptionPeriodSign,
  getLoanRepaymentInfo,
  shouldAllowEligibilityByPass,
} from "@/utils";
import { ReactSelectCustomized } from "../shared";
// import { BVNType } from "@/types/shared";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const getBasicInfoSchema = (maxLoanAmount: number) =>
  z
    .object({
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
        }),
      bankName: z
        .string({ required_error: "Salary bank is required" })
        .min(2, "Salary bank is required"),
      salaryAccountNumber: z
        .string({ required_error: "Account number is required" })
        .min(10, "Account must be at least 10 digits")
        .regex(/^\d+$/, { message: "Account number must contain only digits" }),
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

const TENURE_OPTIONS = Array.from({ length: 22 }, (_v, i) => i + 3)?.map(
  (n) => ({ id: n, value: n.toString(), label: n.toString() }),
);

const INITIAL_LOAN_PAYMENT = {
  monthlyRepayment: "0",
  totalPayment: "0",
  InterestRate: 0,
  eligibleAmount: "0",
};

export const EligiblityCheck: React.FC<Props> = ({ handleUpdateStep }) => {
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
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: "all",
  });

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
      setValue("organizationEmployer", ippisData?.employerOrganization ?? "", {
        shouldValidate: true,
      });
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

  const [ippisNumber, loanTenor, loanAmount, bankName] = watch([
    "ippisNumber",
    "loanTenor",
    "loanAmount",
    "bankName",
  ]);

  useEffect(() => {
    const data = sessionStorage.getItem(
      `${SESSION_STORAGE_KEY}_ELIGIBILITY_INFORMATION`,
    );

    if (data) {
      const parsedData = JSON.parse(data) as FormFields;
      const { ippisNumber, loanAmount, loanTenor } = parsedData;

      if (
        shouldAllowEligibilityByPass(ippisNumber) &&
        loanAmount &&
        loanTenor
      ) {
        const paymentInfo = getLoanRepaymentInfo(
          Number(loanAmount?.replace(/,/g, "")),
          Number(loanTenor),
          "",
        );

        setLoanRepayment((prev) => ({
          ...prev,
          ...paymentInfo,
        }));
      }

      const fields = getValues();
      for (const key in parsedData) {
        if (key in fields) {
          setValue(
            key as keyof FormFields,
            parsedData[key as keyof FormFields] ?? "",
          );
        }
      }

      if (parsedData.loanTenor) {
        const tenor = parsedData.loanTenor.trim();
        setValue("loanTenor", tenor, { shouldValidate: true });
      }

      if (parsedData.bankName) {
        setValue("bankName", parsedData.bankName, { shouldValidate: true });
      }

      if (parsedData.ippisNumber) {
        setValue("ippisNumber", parsedData.ippisNumber, {
          shouldValidate: true,
        });
        validateIppisData(parsedData.ippisNumber);
      }
    }
  }, [setValue, getValues, validateIppisData]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      if (!ippisData && !shouldAllowEligibilityByPass(ippisNumber)) {
        return;
      }
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_ELIGIBILITY_INFORMATION`,
        JSON.stringify(values),
      );
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_IPPIS_INFO`,
        JSON.stringify(ippisData),
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "1");
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_ELIGIBILITY`,
        JSON.stringify(loanRepayment),
      );
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
    if (!ippisData && shouldAllowEligibilityByPass(ippisNumber) && loanAmount) {
      const paymentInfo = getLoanRepaymentInfo(
        Number(loanAmount.replace(/,/g, "")),
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
    if (
      !shouldAllowEligibilityByPass(ippisNumber) &&
      (!ippisData || !loanTenor)
    ) {
      return;
    }

    const paymentInfo = getLoanRepaymentInfo(
      Number(amount),
      Number(loanTenor),
      ippisData?.employerOrganization ?? "",
    );

    setLoanRepayment((prev) => ({
      ...prev,
      ...paymentInfo,
    }));
  };

  const selectedLoanTenor = TENURE_OPTIONS.find(
    (opt) => Number(opt.value) === Number(loanTenor),
  );

  const selectedBank = BANKS_LIST.find(
    (bank) => bank.label.toUpperCase() === bankName?.toUpperCase(),
  );

  return (
    <>
      <form
        className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Input
            label="IPPIS Number"
            onChange={(e) => {
              setValue("ippisNumber", e.target.value, { shouldValidate: true });

              setValue("organizationEmployer", "");
              if (loanAmount && Number(loanAmount) > 0) {
                trigger("loanAmount");
              }
              sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_IPPIS_INFO`);
              resetIppisInfo();
              setLoanRepayment(INITIAL_LOAN_PAYMENT);
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
            options={TENURE_OPTIONS}
            label={
              <>
                Loan Tenure: <i className="text-sx font-light">Months</i>
              </>
            }
            onChange={(data: any) => {
              if (data) {
                handleTenureAndAmountFieldBlur(data.value);
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
              setValue("salaryAccountNumber", value, { shouldValidate: true });
            }}
          />
        </div>

        <div className="lg:col-span-full">
          <div className="col-span-full flex items-center gap-2">
            <Button className="w-full md:max-w-[250px]">Next</Button>
          </div>
        </div>
      </form>
    </>
  );
};
