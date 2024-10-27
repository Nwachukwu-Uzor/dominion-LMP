import React, { useRef, useState } from "react";
import { Container, DataTable, PageTitle } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { Card } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { MdOutlineCloudUpload } from "react-icons/md";
import { extractDataFromFile, ExtractedData } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { LoanService } from "@/services";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import sampleUploadFile from "@/assets/documents/repayment-upload-sample.xlsx";

const VALIDCOLUMNS = [
  "EMPLOYEE NAME",
  "SERVICE NUMBER",
  "IPPIS NO",
  "PENCOMID",
  "ACCOUNT ID",
  "BANK CODE",
  "AMOUNT",
  "DEDUCTION BENEFICIARY",
  "ELEMENT NAME",
  "NHF NUMBER",
  "NARRATION",
  "LOAN ID",
];

const NewRepaymentUpload = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [data, setData] = useState<ExtractedData[]>([]);
  const [uploadError, setUploadError] = useState("");

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);

  const columns: ColumnDef<ExtractedData>[] = [
    {
      header: "Employee Name",
      accessorKey: "employeeName",
    },
    {
      header: "Service Number",
      accessorKey: "serviceNumber",
    },
    {
      header: "IPPIS Number",
      accessorKey: "ippisNo",
    },
    {
      header: "Account ID",
      accessorKey: "accountId",
    },
    {
      header: "Pencom ID",
      accessorKey: "pencomID",
    },
    {
      header: "Bank Code",
      accessorKey: "bankCode",
    },
    {
      header: "Amount",
      accessorKey: "amount",
    },
    {
      header: "Loan Id",
      accessorKey: "loanloanId",
    },
    {
      header: "Deduction Beneficiary",
      accessorKey: "deductionBeneficiary",
    },
    {
      header: "Element Name",
      accessorKey: "elementName",
    },
    {
      header: "Narration",
      accessorKey: "narration",
    },
    {
      header: "NHF Number",
      accessorKey: "nhfNumber",
    },
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const formData = new FormData();
        if (!uploadedFile || !(data.length > 0)) {
          return;
        }

        formData.append("documentUpload", uploadedFile);
        formData.append("bulkUpload", JSON.stringify(data));
        const response = await loanService.uploadRepayment(formData);
        toast.success(response.message);
        handleClearFile();
      } catch (error: any) {
        toast.error(
          error?.response?.message ??
            error?.response?.data?.message ??
            error?.message,
        );
      }
    },
  });

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    try {
      if (file) {
        await handleDataExtraction(file);
        setUploadedFile(file);
      }
    } catch (error: unknown) {
      toast.error(error as string);
      setUploadError(error as string);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setData([]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const file = Array.from(e.dataTransfer.files)[0];
    try {
      if (file) {
        await handleDataExtraction(file);
        setUploadedFile(file);
      }
    } catch (error: unknown) {
      toast.error(error as string);
      setUploadError(error as string);
    }
  };

  const handleDataExtraction = async (file: File) => {
    setUploadError("");
    const extractedData = await extractDataFromFile(file, VALIDCOLUMNS, {
      PENCOMID: "pencomID",
      "LOAN ID": "loanloanId",
    });

    setData(extractedData);
  };

  return (
    <Container>
      <PageTitle title="New Repayment Upload" />
      <Link
        to="/repayment-tracker"
        className="my-2 flex items-center gap-1 text-sm font-bold text-black hover:opacity-75"
      >
        <IoChevronBack /> Back
      </Link>
      <Card className="rounded-sm">
        <p className="text-sm font-medium">
          Create bulk notification by uploading a formatted .CSV sheet
        </p>
        <a
          href={sampleUploadFile}
          download
          className="my-1 font-bold text-[#7E21CF]"
        >
          Download a Sample CSV File
        </a>
        <div
          className={`${dragging ? "rounded-lg bg-gray-500 opacity-60" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <label
            htmlFor="bulk-file"
            className={`mt-4 flex min-h-[30vh] cursor-pointer flex-col items-center justify-center gap-[10px] rounded-lg border-2 border-dashed border-[#A8A8A8] p-4 py-10 lg:p-6 lg:py-6`}
          >
            <p className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 duration-150 active:scale-95 lg:h-[60px] lg:w-[60px]">
              <MdOutlineCloudUpload className="text-3xl" />
            </p>
            <div>
              <p className="mt-2 text-center">
                <strong>Click to upload</strong> or drag and drop Only .CSV
                files are allowed
              </p>
            </div>
          </label>
        </div>
        <input
          type="file"
          name="bulk-file"
          id="bulk-file"
          hidden
          ref={fileInputRef}
          onChange={handleFileUpload}
          disabled={isPending}
        />

        {uploadError.length > 0 && (
          <p className="my-1 text-xs font-medium text-red-700">{uploadError}</p>
        )}
        {uploadedFile && (
          <>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-[100px] bg-green-700"></div>
                <h3 className="font-semibold text-green-700">
                  {uploadedFile.name}
                </h3>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <Button onClick={() => mutate()}>
                  {isPending ? (
                    <>
                      <ClipLoader size={12} color="#fff" />{" "}
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Process Bulk"
                  )}
                </Button>
                <Button
                  onClick={handleClearFile}
                  className="bg-gray-800 text-white"
                  disabled={isPending}
                >
                  Clear File
                </Button>
              </div>
            </div>
          </>
        )}

        {data.length > 0 && <DataTable columns={columns} data={data} />}
      </Card>
    </Container>
  );
};

export default NewRepaymentUpload;
