import { useState } from "react";

import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { AccountType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { formatDate } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY, USER_ROLES } from "@/constants";
import { AccountService } from "@/services/account-service";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IoMdDownload } from "react-icons/io";
import { formatDataForReport } from "@/utils";
import * as XLSX from "xlsx";
import { FETCH_ACCOUNTS_PAGINATED } from "@/constants/query-keys";
import { useUser } from "@/hooks";

const initialPageConfig = {
  size: 10,
  total: 1,
  page: 1,
};

const Accounts = () => {
  const [pageConfig, setPageConfig] = useState(initialPageConfig);
  const { user } = useUser();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const accountsService = new AccountService(token);

  const {
    data: accounts,
    isError: isAccountsError,
    error: accountError,
    isLoading: isLoadingAccounts,
  } = useQuery({
    queryKey: [FETCH_ACCOUNTS_PAGINATED, pageConfig.page],
    queryFn: async ({ queryKey }) => {
      const page = queryKey[1];
      const data = await accountsService.getAccounts(
        Number(page),
        pageConfig.size,
      );

      setPageConfig((prev) => ({
        ...prev,
        total: data?.payload?.totalPages ?? 1,
      }));
      if (!data?.payload?.accountRecords) {
        return [];
      }
      return data?.payload?.accountRecords;
    },
  });

  // const [status] = watch(["status"]);

  // useEffect(() => {
  //   const dates = getDaysFromToday(-5);
  //   setValue("startDate", dates.other);
  //   setValue("endDate", dates.today);
  // }, [setValue, handleSubmit]);

  const columns: ColumnDef<AccountType>[] = [
    {
      header: "S/N",
      accessorKey: "id",
      cell: ({ row }) => <span className="bold">{row.index + 1}. </span>,
    },
    {
      header: "Account Number",
      accessorKey: "accountNumber",
    },
    {
      header: "Customer Number",
      accessorKey: "customerNumber",
    },
    {
      header: "Account Tier",
      accessorKey: "AccountTier",
    },
    {
      header: "Customer Name",
      accessorFn: (row) =>
        `${row?.profile?.LastName ?? ""} ${row?.profile?.FirstName ?? ""}`,
    },
    {
      header: "Phone Number",
      accessorFn: (row) => `${row?.profile?.PhoneNo ?? ""}`,
    },
    {
      header: "BVN",
      accessorFn: (row) => row?.profile?.BVN ?? "",
    },
    {
      header: "Account Officer Code",
      accessorKey: "AccountOfficerCode",
    },
    {
      header: "Opened Date",
      accessorFn: (row) => formatDate(row?.createdAt, "dd-MM-yyy hh:mm:ss a"),
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: ({ row }) => (
        <Link
          to={`${row?.original?.customerNumber}`}
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
    if (!accounts || accounts?.length === 0) {
      return;
    }
    const formattedData = accounts.map((account) => {
      const {
        profile,
        ProductCode,
        customerNumber,
        accountNumber,
        accountStatus,
        status,
        AccountOfficerCode,
        AccountOfficerEmail,
      } = account;

      return {
        ...profile,
        ProductCode,
        customerNumber,
        accountNumber,
        accountStatus,
        status,
        AccountOfficerCode,
        AccountOfficerEmail,
        loanCount: account?.accountLoans?.length?.toString() ?? "0",
      };
    });
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        formatDataForReport(formattedData, [
          "workIdentification",
          "id",
          "profileId",
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
      const fileName = `loan-account-details-${new Date()
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
        <PageTitle title="Loan Accounts Details" />
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
                {user?.role?.includes(USER_ROLES.SUPER_ADMIN) ||
                user?.role?.includes(USER_ROLES.AUDITOR) ? (
                  <div className="my-1 flex items-center justify-end">
                    <Button
                      className="rounded-sm bg-black text-xs text-white"
                      onClick={handleDownload}
                    >
                      <IoMdDownload /> Export as CSV
                    </Button>
                  </div>
                ) : null}
                <NonPaginatedTable
                  columns={columns}
                  data={accounts.filter(
                    (acc) =>
                      acc.customerNumber !== null && acc.accountNumber !== null,
                  )}
                />
                <div>
                  <Pagination
                    totalPages={pageConfig.total}
                    currentPage={pageConfig.page}
                    handlePageClick={handlePaginate}
                  />
                </div>
              </>
            ) : (
              <p>No accounts available</p>
            )
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default Accounts;
