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

import { SESSION_STORAGE_KEY } from "@/constants";
import { LoanService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { Pagination } from "@/components/shared/pagination";
import { formatDate } from "date-fns";
import { FETCH_ALL_LOAN_REPAYMENTS } from "@/constants/query-keys";

const INITIAL_CONFIG = {
  page: 1,
  size: 10,
  totalPages: 0,
};

const RepaymentTracker = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const [pageConfig, setPageConfig] = useState(INITIAL_CONFIG);

  const { isLoading, data } = useQuery({
    queryKey: [FETCH_ALL_LOAN_REPAYMENTS, pageConfig.page],
    queryFn: async ({ queryKey }) => {
      const page = queryKey[1];

      const data = await loanService.getAllLoanRepayments(
        Number(page),
        pageConfig.size,
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
          className="group relative flex w-fit items-center justify-center gap-0.5 text-sm font-bold text-primary hover:opacity-85"
        >
          <IoEye /> Details
          <span className="absolute -bottom-0.5 left-0 h-[1.25px] w-0 bg-primary opacity-85 duration-150 ease-linear group-hover:w-full"></span>
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
        className="mb-4 ml-auto flex max-w-[180px] items-center justify-center gap-1 rounded-md bg-[#7E21CF] px-1 py-2 text-xs font-medium text-white duration-150 hover:opacity-60 active:scale-75"
      >
        New Repayment Upload
      </Link>
      <PageTitle title="Loan Repayment (SMS)" />
      <Card className="my-2 rounded-md">
        {isLoading ? (
          <div className="flex min-h-[25vh] items-center justify-center">
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

export default RepaymentTracker;
