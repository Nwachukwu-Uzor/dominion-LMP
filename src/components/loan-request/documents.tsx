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
import { useSearchParams } from "react-router-dom";
import { Checkbox } from "../ui/checkbox";
import {
  CustomerInfoType,
  EligibilityDataType,
  IPPISResponseType,
} from "@/types/shared";
import { Dialog, DialogContent } from "../ui/dialog";
import { IoMdClose } from "react-icons/io";
import { convertToBase64 } from "@/utils";
import { AddDocumentForm, NonPaginatedTable } from "../shared";
import { ColumnDef } from "@tanstack/react-table";

type Props = {
  handleUpdateStep: (isForward?: boolean) => void;
};

const schema = z.object({
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
    .refine((files: FileList) => files.length > 0, "File is required"),
  IdentificationImage: z.optional(z.instanceof(FileList)),
  CustomerImage: z
    .instanceof(FileList, { message: "Please provide a valid file" })
    .refine((files: FileList) => files.length > 0, "File is required")
    .refine((files) => files.length > 0 && files[0].type.startsWith("image/"), {
      message: "Please upload an image file",
    }),
  CustomerSignature: z
    .string({ required_error: "Signature is required" })
    .min(10, "Please provide a valid signature"),
});

type DocumentType = {
  id: number;
  title: string;
  path: string;
};

const MODAL_TYPES = {
  TERMS_AND_CONDITIONS: "TERMS_AND_CONDITIONS",
  ADD_DOCUMENT: "ADD_DOCUMENT",
};

export const Documents: React.FC<Props> = ({ handleUpdateStep }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoType | null>(
    null,
  );
  const [otherDocuments, setOtherDocuments] = useState<DocumentType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [searchParams] = useSearchParams();
  const accountOfficerCode = searchParams.get("accountOfficerCode") as
    | string
    | undefined;
  const [agreedToTAC, setAgreedToTAC] = useState(false);

  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const sigCanvas = useRef<any>();

  const accountService = new AccountService();

  type FormFields = z.infer<typeof schema>;

  const otherDocumentsTableColumns: ColumnDef<DocumentType>[] = [
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
              onClick={() => handleRemoveDocument(id)}
            >
              Remove
            </button>
          </div>
        );
      },
    },
  ];

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    getValues,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [customerSignature] = watch(["CustomerSignature"]);

  useEffect(() => {
    if (accountOfficerCode) {
      setValue("AccountOfficerCode", accountOfficerCode);
    }
  }, [accountOfficerCode, setValue]);

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

  const handleAddDocument = (data: { title: string; path: string }) => {
    setOtherDocuments((docs) => [
      ...docs,
      { ...data, id: new Date().getTime() },
    ]);
    handleToggleModal();
  };

  const handleRemoveDocument = (id: number) => {

    setOtherDocuments((docs) => docs.filter((d) => d.id !== id));
  };

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

      const eligibilityInformation = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_ELIGIBILITY_INFORMATION`,
      ) as string;
      const parsedEligibilityInfo = JSON.parse(
        eligibilityInformation,
      ) as Record<string, string>;

      for (const key in parsedEligibilityInfo) {
        payload[key] = parsedEligibilityInfo[key];
      }

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
      if (otherDocuments.length > 0) {
        payload["otherDocument"] = otherDocuments.map(({path, title}) => ({path, title}));
      }

      const loanRepayment = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_ELIGIBILITY`,
      );
      if (loanRepayment) {
        const eligibilityInfo = JSON.parse(
          loanRepayment,
        ) as EligibilityDataType;
        payload["monthlyPayment"] = eligibilityInfo.monthlyRepayment.replace(
          /,/g,
          "",
        );
        payload["totalPayment"] = eligibilityInfo.totalRepayment.replace(
          /,/g,
          "",
        );
        payload["InterestRate"] = eligibilityInfo.interestRate;
      }

      const loanAmount = parsedEligibilityInfo["loanAmount"];
      payload["loanAmount"] =
        loanAmount && typeof loanAmount === "string"
          ? Number(loanAmount.replace(/,/g, ""))
          : "";
      payload["loanAgreement"] = "Agreed";

      const ippisData = sessionStorage.getItem(
        `${SESSION_STORAGE_KEY}_IPPIS_INFO`,
      ) as string;
      const parsedIppisInfo = JSON.parse(ippisData) as IPPISResponseType;
      payload["bankName"] = parsedIppisInfo?.bankName;
      payload["salaryAccountNumber"] = parsedIppisInfo?.accountNumber;
      const response = await accountService.createAccountRequest(payload);
      toast.success(response?.message);
      sessionStorage.setItem(
        `${SESSION_STORAGE_KEY}_MESSAGE`,
        response?.message ?? "",
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

  const handleToggleModal = (modalType?: string) => {
    if (!modalType) {
      setShowModal(false);
      setModalType("");
      return;
    }
    setModalType(modalType);
    setShowModal(true);
  };

  const handleToggleTACPopup = () => {
    if (showModal) {
      handleToggleModal();
      return;
    }
    handleToggleModal(MODAL_TYPES.TERMS_AND_CONDITIONS);
  };

  return (
    <>
      <form
        className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
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
          <h3 className="text-sm font-semibold">Supporting Documents</h3>
          <Button
            className="mt-1 border-0 bg-transparent text-xs text-primary ring-0"
            type="button"
            onClick={() => handleToggleModal(MODAL_TYPES.ADD_DOCUMENT)}
          >
            Click to Add Supporting Document
          </Button>
        </div>
        {otherDocuments.length > 0 && (
          <div className="col-span-full">
            <h2>Documents</h2>
            <NonPaginatedTable
              columns={otherDocumentsTableColumns}
              data={otherDocuments}
              isSearchable={false}
            />
          </div>
        )}
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
            className="w-full bg-black md:max-w-[200px]"
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
      <Dialog open={showModal}>
        <DialogContent className="w-[90vw] gap-0 md:max-w-[600px]">
          <div className="flex justify-end">
            <button disabled={isSubmitting}>
              <IoMdClose
                className="cursor-pointer transition-all hover:scale-150"
                onClick={handleToggleTACPopup}
              />
            </button>
          </div>
          {modalType === MODAL_TYPES.TERMS_AND_CONDITIONS && (
            <>
              <h3 className="mt-5 text-center text-lg font-bold">
                TERMS AND CONDITIONS
              </h3>
              <p className="mt-[5px] text-center">
                <span className="font-semibold"> Loan Agreement *</span> <br />{" "}
                <br />
                <span className="font-semibold">CONFIRMATION</span> <br />{" "}
                <br />
                <span>
                  I confirm that the information given in this form is true,
                  complete and accurate I confirm that I have read and
                  understood Dominion Merchants and Partners Limited ("the
                  Lender”) Terms and Conditions Governing the Operations of
                  Borrower-Lender relationship and agree to abide and be bound
                  by these terms and conditions. I understand that my submission
                  of this application and acceptance of this application by
                  Dominion Merchants and Partners Limited shall in no way be
                  construed as approval of my application and that the Lender
                  reserves the right to decline this application without giving
                  any reasons whatsoever.
                </span>
              </p>
              <p className="mt-6 text-center text-sm font-semibold">
                &copy; {new Date().getFullYear()}
                <span className="ml-1 inline-block font-semibold">
                  Dominion Merchants and Partners Limited
                </span>
              </p>
            </>
          )}
          {modalType === MODAL_TYPES.ADD_DOCUMENT && (
            <>
              <AddDocumentForm handleAddDocument={handleAddDocument} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
