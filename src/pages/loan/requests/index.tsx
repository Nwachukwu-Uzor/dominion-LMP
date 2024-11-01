import { useState } from "react";
import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { UnCompletedLoanRequestType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { formatDate } from "date-fns";
import * as XLSX from "xlsx";

import { useQuery } from "@tanstack/react-query";
import {
  GENDER_ENUM,
  SESSION_STORAGE_KEY,
  USER_ROLES,
} from "@/constants";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { Link, useParams } from "react-router-dom";
import { LoanService } from "@/services";
import { formatCurrency } from "@/utils/format-number-with-commas";
import { Button } from "@/components/ui/button";
import { IoMdDownload } from "react-icons/io";
import { formatDataForReport } from "@/utils";
import { FETCH_ALL_LOAN_REQUESTS_PAGINATED } from "@/constants/query-keys";
import { useUser } from "@/hooks";

const initialPageConfig = {
  size: 10,
  total: 1,
  page: 1,
};

const AccountRequests = () => {
  const [pageConfig, setPageConfig] = useState(initialPageConfig);
  const { user } = useUser()

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
        pageConfig.size,
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
      header: "S/N",
      accessorKey: "id",
      cell: ({ row }) => <span className="bold">{row.index + 1}. </span>,
    },
    {
      header: "Customer Name",
      accessorFn: (row) =>
        `${row?.customerDetails?.LastName ?? ""} ${
          row?.customerDetails?.FirstName ?? ""
        }`,
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
          className="group relative mt-2 w-fit text-center text-xs font-medium text-primary duration-200"
        >
          View Details
          <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary duration-200 group-hover:w-full"></span>
        </Link>
      ),
    },
  ];

  const handlePaginate = (page: number) => {
    setPageConfig((prev) => ({ ...prev, page }));
  };

  const handleDownload = () => {
    if (!accounts || accounts.length === 0) {
      return;
    }
    const formattedData = accounts.map((account) => {
      const { customerDetails } = account;
      const { state, createdAt, Gender, ...rest } = customerDetails;

      return {
        ...rest,
        stateOfOrigin: state,
        createdAt: formatDate(createdAt, "dd-MM-yyy hh:mm:ss a"),
        gender: GENDER_ENUM[Gender] ?? ""
      };
    });
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        formatDataForReport(formattedData, [
          "workIdentification",
          "id",
          "profileId",
          "updatedAt"
        ]),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `${stage}-Loan-account-details-${new Date()
        .getTime()
        .toString()}`;

      if (window.navigator && (window as any).navigator.msSaveOrOpenBlob) {
        // For IE browser
        (window as any).navigator.msSaveOrOpenBlob(excelBlob, fileName);
      } else {
        // For other modern browsers
        const url = URL.createObjectURL(excelBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Container>
        <PageTitle title="Loan Requests" />
        <Card className="my-2">
          {isLoadingAccounts ? (
            <div className="flex min-h-[25vh] items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : isAccountsError ? (
            <div>{accountError?.message}</div>
          ) : accounts ? (
            accounts?.length > 0 ? (
              <>
                {user?.role?.map(r => r.toUpperCase())?.includes(USER_ROLES.SUPER_ADMIN.toUpperCase()) ||
                user?.role?.map(r => r.toUpperCase())?.includes(USER_ROLES.AUDITOR.toUpperCase()) ? (
                  <div className="my-1 flex items-center justify-end">
                    <Button
                      className="rounded-sm bg-black text-xs text-white"
                      onClick={handleDownload}
                    >
                      <IoMdDownload /> Export as CSV
                    </Button>
                  </div>
                ) : null}
                <NonPaginatedTable columns={columns} data={accounts} />
                <div>
                  <Pagination
                    totalPages={pageConfig.total}
                    currentPage={pageConfig.page}
                    handlePageClick={handlePaginate}
                  />
                </div>
              </>
            ) : (
              <p>No Loan Requests to treat</p>
            )
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default AccountRequests;
