import { useState } from "react";
import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { UnCompletedLoanRequestType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { formatDate } from "date-fns";

import { useQuery } from "@tanstack/react-query";
import {
  FETCH_ALL_LOAN_REQUESTS_PAGINATED,
  SESSION_STORAGE_KEY,
} from "@/constants";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { Link, useParams } from "react-router-dom";
import { LoanService } from "@/services";
import { formatCurrency } from "@/utils/format-number-with-commas";

const initialPageConfig = {
  size: 10,
  total: 1,
  page: 1,
};

const AccountRequests = () => {
  const [pageConfig, setPageConfig] = useState(initialPageConfig);

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const { stage } = useParams<{ stage: string }>();

  const {
    data: accounts,
    isError: isAccountsError,
    error: accountError,
    isLoading: isLoadingAccounts,
  } = useQuery({
    queryKey: [
      FETCH_ALL_LOAN_REQUESTS_PAGINATED,
      stage?.toUpperCase(),
      pageConfig.page,
    ],
    queryFn: async ({ queryKey }) => {
      const page = queryKey[2];
      const stage = (queryKey[1] as string) ?? "";
      const data = await loanService.getLoanRequestForStage(
        stage,
        Number(page),
        pageConfig.size
      );

      setPageConfig((prev) => ({
        ...prev,
        total: data?.payload?.totalPages ?? 1,
      }));
      if (!data?.payload?.requestRecords) {
        return [];
      }
      return data?.payload?.requestRecords;
    },
  });

  const columns: ColumnDef<UnCompletedLoanRequestType>[] = [
    {
      header: "Customer Name",
      accessorFn: (row) =>
        `${row?.customerDetails?.LastName ?? ""} ${row?.customerDetails?.FirstName ?? ""}`,
    },
    {
      header: "Phone Number",
      accessorFn: (row) => `${row?.customerDetails?.PhoneNo ?? ""}`,
    },
    {
      header: "BVN",
      accessorFn: (row) => row?.customerDetails?.BVN ?? "",
    },
    {
      header: "NIN",
      accessorKey: "customerDetails.NationalIdentityNo",
    },
    {
      header: "Account Officer Code",
      accessorKey: "accountDetails.AccountOfficerCode",
    },
    {
      header: "Request Date",
      accessorFn: (row) => formatDate(row?.createdAt, "dd-MM-yyy hh:mm:ss a"),
    },
    {
      header: "Loan Amount",
      accessorKey: "customerDetails.loanAmount",
      cell: ({ getValue }) => <>{formatCurrency(getValue() as string)}</>,
    },
    {
      header: "Loan Tenor",
      accessorKey: "customerDetails.loanTenor",
    },
    {
      header: "Stage",
      accessorKey: "stage",
      cell: ({ getValue }) => (
        <span className="text-xs font-semibold">{getValue() as string}</span>
      ),
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: ({ row }) => (
        <Link
          to={`${row?.original?.accountDetails?.id}/${row?.original?.id}`}
          className="mt-2 text-primary text-xs group font-medium duration-200 relative w-fit text-center"
        >
          View Details
          <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
        </Link>
      ),
    },
  ];

  const handlePaginate = (page: number) => {
    setPageConfig((prev) => ({ ...prev, page }));
  };

  return (
    <>
      <Container>
        <PageTitle title="Loan Requests" />
        <Card className="my-2">
          {isLoadingAccounts ? (
            <div className="min-h-[25vh] flex items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : isAccountsError ? (
            <div>{accountError?.message}</div>
          ) : accounts ? (
            <>
              <NonPaginatedTable columns={columns} data={accounts} />
              <div>
                <Pagination
                  totalPages={pageConfig.total}
                  currentPage={pageConfig.page}
                  handlePageClick={handlePaginate}
                />
              </div>
            </>
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default AccountRequests;
