import { Container, PageTitle } from "@/components/shared";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import sampleUploadFile from "@/assets/documents/ippis-upload-sample.xlsx";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { MdOutlineCloudUpload } from "react-icons/md";
import { SESSION_STORAGE_KEY } from "@/constants";
import { LoanService } from "@/services";

const NewIPPIS = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const formData = new FormData();
        if (!uploadedFile) {
          return;
        }

        formData.append("documentUpload", uploadedFile);
        const response = await loanService.uploadIPPISRecordFileOnly(formData);
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
      }
    } catch (error: unknown) {
      toast.error(error as string);
      setUploadError(error as string);
    }
  };

  return (
    <Container>
      <PageTitle title="New IPPIS Data Upload" />
      <Card className="rounded-sm">
        <p className="text-sm font-medium">
          Upload IPPIS records in the approved CSV format. <br /> <br />
          <br />
        </p>
        <a
          href={sampleUploadFile}
          download
          className="my-2 text-sm font-semibold text-[#7E21CF]"
        >
          Download a Sample CSV File
        </a>
        <div>
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

          {uploadError?.length > 0 && (
            <p className="my-1 text-xs font-medium text-red-700">
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
      </Card>
    </Container>
  );
};

export default NewIPPIS;
