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
import { formatNumberWithCommasWithOptionPeriodSign } from "@/utils";

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
      { message: "Loan amount must be greater than zero" }
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
      { message: "Loan amount must be greater than zero" }
    ),
  IdentificationImage: z
    .instanceof(FileList, { message: "Please provide a valid file" })
    .refine((files: FileList) => files.length > 0, "File is required"),
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

export const Documents: React.FC<Props> = ({ handleUpdateStep }) => {
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
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [customerSignature] = watch(["CustomerSignature"]);

  useEffect(() => {
    const data = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_DOCUMENTS`);
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
        `${SESSION_STORAGE_KEY}_DOCUMENTS`,
        JSON.stringify(values)
      );
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_STAGE`, "2");

      const payload: Record<string, unknown> = {};

      const basicInformation = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_BASIC_INFORMATION`
      ) as string;

      const parsedBasicInfo = JSON.parse(basicInformation) as Record<
        string,
        string | File
      >;

      for (const key in parsedBasicInfo) {
        payload[key] = parsedBasicInfo[key];
      }

      const contactInfo = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`
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

      //   append Images
      payload["IdentificationImage"] = await convertToBase64(
        values.IdentificationImage[0]
      );
      payload["CustomerImage"] = await convertToBase64(values.CustomerImage[0]);
      if (values?.otherDocument && values?.otherDocument?.length > 0) {
        payload["otherDocument"] = await convertToBase64(
          values.otherDocument[0]
        );
      }
      payload["loanAmount"] = Number(values?.loanAmount?.replace(/,/g, ""));
      payload["AccountOfficerCode"] = "1001";
      payload["loanAgreement"] = "Agreed";
      const response = await accountService.createAccountRequest(payload);
      toast.success(response?.message);
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

  const clear = () => {
    sigCanvas.current.clear();
  };

  const save = () => {
    setValue(
      "CustomerSignature",
      sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
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
    event: ChangeEvent<HTMLInputElement>
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

  return (
    <>
      <form
        className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-4"
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
                formatNumberWithCommasWithOptionPeriodSign(value)
              );
              await trigger("loanAmount");
            }}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Input
            label="Loan Tenure"
            {...register("loanTenor")}
            error={errors?.loanTenor?.message}
            onChange={async (e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("loanTenor", value);
              await trigger("loanTenor");
            }}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Input
            label={
              <>
                Select NIN Card Image: <i className="text-[10px]">Image or PDF</i>
              </>
            }
            {...register("IdentificationImage")}
            error={errors?.IdentificationImage?.message}
            type="file"
            className="file:bg-black file:text-white file:rounded-sm file:text-sm"
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
            className="file:bg-black file:text-white file:rounded-sm file:text-sm"
            disabled={isSubmitting}
            accept="image/*"
          />
        </div>
        <div>
          <Input
            label={
              <>
                Other Supporting Document{" "}
                <i className="font-normal text-[10px]">
                  Optional Image or PDF file
                </i>
              </>
            }
            {...register("otherDocument")}
            type="file"
            className="file:bg-black file:text-white file:rounded-sm file:text-sm"
            disabled={isSubmitting}
            accept="image/*, application/pdf"
          />
        </div>
        <div className="lg:col-span-full">
          <hr />
          <h4 className="text-sm font-semibold my-3">SIGNATURE: </h4>
          <div className="flex flex-col lg:flex-row items-center gap-2">
            <div>
              <Input
                label="Upload a signature Image: "
                error={errors?.CustomerSignature?.message}
                type="file"
                className="file:bg-black file:text-white file:rounded-sm file:text-sm"
                onChange={handleUploadSignature}
                disabled={isSubmitting}
              />
            </div>
            <strong>OR</strong>
            <button
              className="bg-black text-xs py-1 px-2 rounded-sm text-white"
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
              <div className="flex items-center mt-2 gap-1">
                <button
                  className="bg-green-700 text-white py-1 px-2 rounded-sm text-xs font-semibold"
                  onClick={save}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="bg-red-700 text-white py-1 px-2 rounded-sm text-xs font-semibold"
                  onClick={clear}
                  type="button"
                >
                  Clear
                </button>
                <button
                  className="bg-black text-white py-1 px-2 rounded-sm text-xs font-semibold"
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
        <p className="lg:col-span-full my-1 text-sm text-red-600 font-semibold">
          {errors?.root?.message}
        </p>
        <div className="flex items-center gap-2 lg:col-span-full">
          <Button
            className="max-w-[175px] bg-black"
            type="button"
            onClick={handleBackClick}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button className="max-w-[175px]">
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
    </>
  );
};
