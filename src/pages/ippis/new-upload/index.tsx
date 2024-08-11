import { Container, DataTable, PageTitle } from "@/components/shared";
import { extractDataFromFile, ExtractedData } from "@/utils";
import { useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import sampleUploadFile from "@/assets/documents/repayment-upload-sample.xlsx";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { MdOutlineCloudUpload } from "react-icons/md";
import { SESSION_STORAGE_KEY } from "@/constants";
import { LoanService } from "@/services";

const VALID_IPPIS_COLUMNS = [
  "STAFF_ID",
  "FULL_NAME",
  "EMPLOYMENT_STATUS",
  "ASSIGNMENT_STATUS",
  "HIRE_DATE",
  "BIRTH_DATE",
  "JOB_TITLE",
  "COMMAND",
  "TELEPHONE_NUMBER",
  "BANK_NAME",
  "ACCOUNT_NUMBER",
  "STAFF_CATEGORY",
  "EMPLOYEE_TYPE",
  "NETPAY",
  "PERIOD",
];

const MAX_IPPIS_RECORD_COUNT = 1000;

const NewIPPIS = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [data, setData] = useState<ExtractedData[]>([]);
  const [uploadError, setUploadError] = useState("");

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);

  const columns: ColumnDef<ExtractedData>[] = [
    {
      header: "Staff ID",
      accessorKey: "staffId",
    },
    {
      header: "Full Name",
      accessorKey: "fullName",
    },
    {
      header: "Employeement Status",
      accessorKey: "employeeStatus",
    },
    {
      header: "Assignment Status",
      accessorKey: "assignmentStatus",
    },
    {
      header: "Hire Date",
      accessorKey: "hireDate",
    },
    {
      header: "Birth Date",
      accessorKey: "birthDate",
    },
    {
      header: "Job Title",
      accessorKey: "jobTitle",
    },
    {
      header: "Command",
      accessorKey: "command",
    },
    {
      header: "Phone Number",
      accessorKey: "Number",
    },
    {
      header: "Bank Name",
      accessorKey: "bankName",
    },
    {
      header: "Account Number",
      accessorKey: "accountNumber",
    },
    {
      header: "Staff Category",
      accessorKey: "staffCategory",
    },
    {
      header: "Employee Type",
      accessorKey: "employeeType",
    },
    {
      header: "Net Pay",
      accessorKey: "netPay",
    },
    {
      header: "Period",
      accessorKey: "period",
    },
  ];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const formData = new FormData();
        if (!uploadedFile || !(data.length > 0)) {
          return;
        }

        console.log(data);

        formData.append("documentUpload", uploadedFile);
        formData.append("bulkUpload", JSON.stringify(data));
        const response = await loanService.uploadIPPISRecord(formData);
        toast.success(response.message);
        handleClearFile();
      } catch (error: any) {
        toast.error(
          error?.response?.message ??
            error?.response?.data?.message ??
            error?.message
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
        setUploadedFile(file);
        await handleDataExtraction(file);
      }
    } catch (error: unknown) {
      toast.error(error as string);
      setUploadError(error as string);
    }
  };

  const handleDataExtraction = async (file: File) => {
    setUploadError("");
    const extractedData = await extractDataFromFile(file, VALID_IPPIS_COLUMNS, {
      STAFF_ID: "staffId",
      FULL_NAME: "fullName",
      EMPLOYMENT_ID: "employeeId",
      ASSIGNMENT_STATUS: "assignmentStatus",
      HIRE_DATE: "hireDate",
      BIRTH_DATE: "birthDate",
      JOB_TITLE: "jobTitle",
      COMMAND: "command",
      TELEPHONE_NUMBER: "phoneNumber",
      BANK_NAME: "bankName",
      ACCOUNT_NUMBER: "accountNumber",
      STAFF_CATEGORY: "staffCategory",
      EMPLOYEE_TYPE: "employeeType",
      NETPAY: "netPay",
      PERIOD: "period",
      EMPLOYMENT_STATUS: "employmentStatus",
    });

    if (extractedData.length > MAX_IPPIS_RECORD_COUNT) {
      setUploadError(
        `The maximum number of records allowed is ${MAX_IPPIS_RECORD_COUNT} but you provided ${extractedData.length}`
      );
      setUploadedFile(null);
      return;
    }

    setData(extractedData);
  };

  return (
    <Container>
      <PageTitle title="New IPPIS Upload" />
      <Card className="rounded-sm">
        <p className="text-sm font-medium">
          Create bulk notification by uploading a formatted .CSV sheet <br />{" "}
          <br />
          <span className="font-light">
            <strong>Note: </strong> You can only upload{" "}
            <strong className="font-black">{MAX_IPPIS_RECORD_COUNT}</strong>{" "}
            records a time.{" "}
          </span>
          <br />
        </p>
        <a
          href={sampleUploadFile}
          download
          className="my-1 text-[#7E21CF] font-bold"
        >
          Download Sample CSV
        </a>
        <div className="max-w-[400px]">
          <div
            className={`${dragging ? "opacity-60 bg-gray-500 rounded-lg" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <label
              htmlFor="bulk-file"
              className={`mt-4 border-2 border-dashed border-[#A8A8A8] flex flex-col items-center justify-center gap-[10px] p-4 py-10 lg:py-6 lg:p-6 rounded-lg cursor-pointer`}
            >
              <p className="flex items-center justify-center h-12 w-12 lg:h-[60px] lg:w-[60px] rounded-full bg-gray-200 active:scale-95 duration-150">
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

          {uploadError?.length > 0 && (
            <p className="text-red-700 font-medium text-xs my-1">
              {uploadError}
            </p>
          )}
          {uploadedFile && !(uploadError?.length > 0) && (
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
        </div>
        {data.length > 0 && <DataTable columns={columns} data={data} />}
      </Card>
    </Container>
  );
};

export default NewIPPIS;
