import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { SESSION_STORAGE_KEY } from "@/constants";
import SignaturePad from "react-signature-canvas";
import { AccountService } from "@/services";
import { ClipLoader } from "react-spinners";
import {
  calculateLoanForOrganization,
  formatNumberWithCommasWithOptionPeriodSign,
} from "@/utils";
import { useSearchParams } from "react-router-dom";
import { Checkbox } from "../ui/checkbox";
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
import { CustomerInfoType } from "@/types/shared";
import { Dialog, DialogContent } from "../ui/dialog";
import { IoMdClose } from "react-icons/io";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const schema = z.object({
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
        return !Number.isNaN(numberValue) && numberValue > 0;
      },
      { message: "Loan amount must be greater than zero" },
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
  workIdentification: z
    .instanceof(FileList, { message: "Please provide a valid file" })
    // .optional()
    .refine((files: FileList) => files.length > 0, "File is required"),
  IdentificationImage: z.optional(z.instanceof(FileList)),
  // .refine((files: FileList) => files.length > 0, "File is required"),
  CustomerImage: z
    .instanceof(FileList, { message: "Please provide a valid file" })
    .refine((files: FileList) => files.length > 0, "File is required")
    .refine((files) => files.length > 0 && files[0].type.startsWith("image/"), {
      message: "Please upload an image file",
    }),
  otherDocument: z.optional(z.instanceof(FileList)),
  CustomerSignature: z
    .string({ required_error: "Signature is required" })
    .min(10, "Please provide a valid signature"),
});

type FormFields = z.infer<typeof schema>;

const TENURE_OPTIONS = Array.from({ length: 22 }, (_v, i) => i + 3)?.map(
  (n) => ({ id: n, value: n.toString(), label: n }),
);

const initialLoanPayment = {
  monthlyRepayment: "0",
  totalPayment: "0",
};

export const Documents: React.FC<Props> = ({ handleUpdateStep }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoType | null>(
    null,
  );
  const [loanRepayment, setLoanRepayment] = useState(initialLoanPayment);
  const [showTACPopup, setShowTACPopup] = useState(false);
  const [searchParams] = useSearchParams();
  const access_code = searchParams.get("access_code") as string | undefined;
  const [agreedToTAC, setAgreedToTAC] = useState(false);

  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const sigCanvas = useRef<any>();

  const accountService = new AccountService();

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [customerSignature, loanTenor, loanAmount] = watch([
    "CustomerSignature",
    "loanTenor",
    "loanAmount",
  ]);

  useEffect(() => {
    const data = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_DOCUMENTS`);
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
      return;
    }
  }, [getValues, setValue]);

  useEffect(() => {
    if (!access_code) {
      return;
    }
  }, [access_code]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      if (!agreedToTAC) {
        setError("root", {
          message: "Please agree to terms and condition",
          type: "deps",
        });
        return;
      }
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_DOCUMENTS`,
        JSON.stringify(values),
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "2");

      const payload: Record<string, unknown> = {};

      const basicInformation = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`,
      ) as string;

      const parsedBasicInfo = JSON.parse(basicInformation) as Record<
        string,
        string | File
      >;

      for (const key in parsedBasicInfo) {
        payload[key] = parsedBasicInfo[key];
      }

      const contactInfo = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`,
      ) as string;

      const parsedContactInfo = JSON.parse(contactInfo) as Record<
        string,
        string | File
      >;

      for (const key in parsedContactInfo) {
        payload[key] = parsedContactInfo[key];
      }

      for (const key in values) {
        const parsedValues = values as Record<string, unknown>;
        const data = parsedValues[key];
        if (typeof data === "string") {
          payload[key] = data;
        }
      }

      // Replace any field the existing customer info field
      const parsedCustomerInfo = customerInfo as unknown as Record<
        string,
        unknown
      >;

      if (customerInfo && Object.keys(customerInfo).length > 0) {
        for (const key in payload) {
          if (parsedCustomerInfo[key]) {
            payload[key] = parsedCustomerInfo[key];
          }
        }

        if (customerInfo?.NextOfKinName) {
          const [NextOfKinFirstName, NextOfKinLastName] =
            customerInfo.NextOfKinName.split(" ");
          payload["NextOfKinFirstName"] = NextOfKinFirstName;
          payload["NextOfKinLastName"] = NextOfKinLastName;
        }
      }

      //   append Images'
      if (
        values?.IdentificationImage &&
        values?.IdentificationImage?.length > 0
      ) {
        payload["IdentificationImage"] = await convertToBase64(
          values.IdentificationImage[0],
        );
      }
      payload["CustomerImage"] = await convertToBase64(values.CustomerImage[0]);
      payload["workIdentification"] = await convertToBase64(
        values?.workIdentification[0],
      );
      if (values?.otherDocument && values?.otherDocument?.length > 0) {
        payload["otherDocument"] = await convertToBase64(
          values.otherDocument[0],
        );
      }
      payload["loanAmount"] = Number(values?.loanAmount?.replace(/,/g, ""));
      payload["loanAgreement"] = "Agreed";

      const response = await accountService.createAccountRequest(payload);
      toast.success(response?.message);
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_MESSAGE`,
        response?.message ?? "",
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

  const handleBackClick = () => {
    sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "1");
    handleUpdateStep(false);
  };

  const clear = () => {
    sigCanvas.current.clear();
  };

  const save = () => {
    setValue(
      "CustomerSignature",
      sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"),
    );
    handleCloseSignatureCanvas();
  };

  const handleCloseSignatureCanvas = () => {
    clear();
    setShowSignatureCanvas(false);
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

  const handleToggleTACPopup = () => {
    setShowTACPopup((shown) => !shown);
  };

  const handleTenureAndAmountFieldBlur = (
    loanAmount: string,
    loanTenor: string,
  ) => {
    const amount = loanAmount.replace(/[^0-9.]/g, "");
    const repaymentInfo = calculateLoanForOrganization(
      customerInfo?.organizationEmployer ?? "",
      Number(amount),
      Number(loanTenor),
    );
    setLoanRepayment({
      monthlyRepayment: repaymentInfo.monthlyInstallment,
      totalPayment: repaymentInfo.totalRepayment,
    });
  };

  return (
    <>
      <form
        className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
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
            onBlur={() => handleTenureAndAmountFieldBlur(loanAmount, loanTenor)}
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
            label="Monthly Payment"
            value={formatNumberWithCommasWithOptionPeriodSign(
              loanRepayment.monthlyRepayment,
            )}
            disabled={true}
          />
        </div>
        <div>
          <Input
            label="Total Payment: "
            value={formatNumberWithCommasWithOptionPeriodSign(
              loanRepayment.totalPayment,
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
            {...register("workIdentification")}
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
            {...register("IdentificationImage")}
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
            {...register("CustomerImage")}
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
            {...register("otherDocument")}
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
            <strong>OR</strong>
            <button
              className="rounded-sm bg-black px-2 py-1 text-xs text-white"
              type="button"
              onClick={() => {
                setShowSignatureCanvas(true);
              }}
            >
              Sign digitally
            </button>
          </div>
          {showSignatureCanvas && (
            <>
              <SignaturePad
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full bg-gray-200 rounded-sm",
                }}
              />
              <div className="mt-2 flex items-center gap-1">
                <button
                  className="rounded-sm bg-green-700 px-2 py-1 text-xs font-semibold text-white"
                  onClick={save}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="rounded-sm bg-red-700 px-2 py-1 text-xs font-semibold text-white"
                  onClick={clear}
                  type="button"
                >
                  Clear
                </button>
                <button
                  className="rounded-sm bg-black px-2 py-1 text-xs font-semibold text-white"
                  onClick={handleCloseSignatureCanvas}
                  type="button"
                >
                  Close
                </button>
              </div>
            </>
          )}
          {customerSignature && (
            <img
              src={customerSignature as string}
              alt="Signature"
              className="max-h-[250px]"
            />
          )}
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm font-light lg:col-span-full">
          <p>Agree to terms and conditions</p>{" "}
          <Checkbox
            checked={agreedToTAC}
            disabled={isSubmitting}
            onClick={() => {
              clearErrors("root");
              setAgreedToTAC((agreed) => !agreed);
            }}
          />
        </div>
        <p className="my-2 text-sm font-semibold lg:col-span-full">
          By clicking the checkbox above, you are indicating that you agree to
          the terms and conditions of the requested service. Kindly click{" "}
          <button
            className="group relative uppercase text-primary"
            type="button"
            onClick={handleToggleTACPopup}
          >
            here{" "}
            <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary duration-200 group-hover:w-full"></span>
          </button>{" "}
          to review the terms and conditions
        </p>
        <p className="my-1 text-sm font-semibold text-red-600 lg:col-span-full">
          {errors?.root?.message}
        </p>
        <div className="flex items-center gap-2 lg:col-span-full">
          <Button
            className="w-full md:max-w-[200px] bg-black"
            type="button"
            onClick={handleBackClick}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button className="w-full md:max-w-[200px]">
            {isSubmitting ? (
              <>
                <ClipLoader color="#fff" size={12} /> Submitting
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </div>
      </form>
      <Dialog open={showTACPopup}>
        <DialogContent className="w-[90vw] gap-0 md:max-w-[800px]">
          <div className="flex justify-end">
            <button disabled={isSubmitting}>
              <IoMdClose
                className="cursor-pointer transition-all hover:scale-150"
                onClick={handleToggleTACPopup}
              />
            </button>
          </div>

          <h3 className="mt-5 text-center text-lg font-bold">
            TERMS AND CONDITIONS
          </h3>
          <p className="mt-[5px] text-center">
            <span className="font-semibold"> Loan Agreement *</span> <br />{" "}
            <br />
            <span className="font-semibold">CONFIRMATION</span> <br /> <br />
            <span>
              I confirm that the information given in this form is true,
              complete and accurate I confirm that I have read and understood
              Dominion Merchants and Partners Limited ("the Lender”) Terms and
              Conditions Governing the Operations of Borrower-Lender
              relationship and agree to abide and be bound by these terms and
              conditions. I understand that my submission of this application
              and acceptance of this application by Dominion Merchants and
              Partners Limited shall in no way be construed as approval of my
              application and that the Lender reserves the right to decline this
              application without giving any reasons whatsoever.
            </span>
          </p>
          <p className="mt-6 text-center text-sm font-semibold">
            &copy; {new Date().getFullYear()}
            <span className="ml-1 inline-block font-semibold">
              Dominion Merchants and Partners Limited
            </span>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
