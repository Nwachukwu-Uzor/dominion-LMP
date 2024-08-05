import { useState } from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { SubmitHandler, useForm } from "react-hook-form";
import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { LoanRepaymentType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { IoEye } from "react-icons/io5";

// import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { FETCH_ALL_LOAN_REPAYMENTS, SESSION_STORAGE_KEY } from "@/constants";
import { LoanService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { Pagination } from "@/components/shared/pagination";
import { formatDate } from "date-fns";


const INITIAL_CONFIG = {
  page: 1,
  size: 10,
  totalPages: 0,
};

const BulkNotifications = () => {
  

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const [pageConfig, setPageConfig] = useState(INITIAL_CONFIG);

  const { isLoading, data } = useQuery({
    queryKey: [FETCH_ALL_LOAN_REPAYMENTS, pageConfig.page],
    queryFn: async ({ queryKey }) => {
      const page = queryKey[1];
      

      const data = await loanService.getAllLoanRepayments(
        Number(page),
        pageConfig.size
      );
      if (data && data?.payload) {
        setPageConfig((current) => ({
          ...current,
          totalPages: data?.payload?.totalPages ?? 1,
        }));
      }
      return data?.payload;
    },
  });


  const columns: ColumnDef<LoanRepaymentType>[] = [
    {
      header: "File ID",
      accessorKey: "UploadedFileID",
    },
    {
      header: "Uploaded By",
      accessorKey: "createdByProfile.fullName",
    },
    {
      header: "Upload At",
      accessorKey: "createdAt",
      cell: ({ getValue }) => (
        <>{formatDate(getValue() as string, "dd-MM-yyyy hh:mm:ss a")}</>
      ),
    },
    {
      header: "",
      accessorKey: "id",
      cell: ({ row }) => (
        <Link
          to={`/bulk-notifications/${row?.original?.UploadedFileID}`}
          className="text-primary relative group w-fit font-bold text-sm flex items-center justify-center gap-0.5 hover:opacity-85"
        >
          <IoEye /> Details
          <span className="absolute left-0 h-[1.25px] -bottom-0.5 w-0 group-hover:w-full bg-primary ease-linear duration-150 opacity-85"></span>
        </Link>
      ),
    },
  ];


  const handlePageNumberClick = (pageNumber: number) => {
    setPageConfig((current) => ({ ...current, page: pageNumber }));
  };

  return (
    <Container>
      <Link
        to="new"
        className="max-w-[180px] gap-1 rounded-md active:scale-75 hover:opacity-60 duration-150 py-2 px-1 mb-4 flex items-center justify-center ml-auto bg-[#7E21CF] text-white text-xs font-medium"
      >
        New Bulk Notifications
      </Link>
      <PageTitle title="Bulk Notifications" />
      <Card className="my-2 rounded-md">
        
        {isLoading ? (
          <div className="min-h-[25vh] flex items-center justify-center">
            <ClipLoader size={25} color="#5b21b6" />
          </div>
        ) : data?.loanRepaymentRecords &&
          data?.loanRepaymentRecords?.length > 0 ? (
          <>
            <NonPaginatedTable
              columns={columns}
              data={data.loanRepaymentRecords}
            />
            <div>
              <Pagination
                totalPages={pageConfig.totalPages}
                currentPage={pageConfig.page}
                handlePageClick={handlePageNumberClick}
              />
            </div>
          </>
        ) : (
          <p>No Records found</p>
        )}
      </Card>
    </Container>
  );
};

export default BulkNotifications;
