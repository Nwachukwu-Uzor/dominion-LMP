import { useState } from "react";
import {
  Container,
  // DataTable,
  NonPaginatedTable,
  PageTitle,
} from "@/components/shared";
import { CustomerType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { formatDate, isValid } from "date-fns";

import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY, USER_ROLES } from "@/constants";
import { AccountService } from "@/services/account-service";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IoMdDownload } from "react-icons/io";
import * as XLSX from "xlsx";
import { formatDataForReport } from "@/utils";
import { FETCH_ALL_CUSTOMERS_PAGINATED } from "@/constants/query-keys";
import { useUser } from "@/hooks";

const initialPageConfig = {
  size: 10,
  total: 1,
  page: 1,
};

const GENDER_ENUM: Record<string, string> = {
  "0": "Male",
  "1": "Female",
};

const Customers = () => {
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
    queryKey: [FETCH_ALL_CUSTOMERS_PAGINATED, pageConfig.page],
    queryFn: async ({ queryKey }) => {
      const page = queryKey[1];
      const data = await accountsService.getCustomers(
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

  const columns: ColumnDef<CustomerType>[] = [
    {
      header: "S/N",
      accessorKey: "id",
      cell: ({ row }) => <span className="bold">{row.index + 1}. </span>,
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "First Name",
      accessorKey: "FirstName",
    },
    {
      header: "Last Name",
      accessorKey: "LastName",
    },
    {
      header: "Phone Number",
      accessorKey: "PhoneNo",
    },
    {
      header: "Email",
      accessorKey: "Email",
    },
    {
      header: "BVN",
      accessorKey: "BVN",
    },
    {
      header: "NIN",
      accessorKey: "NationalIdentityNo",
    },
    {
      header: "Address",
      accessorKey: "Address",
    },
    {
      header: "Gender",
      accessorFn: (value) => GENDER_ENUM[value.Gender] ?? value.Gender,
    },
    {
      header: "Date of Birth",
      accessorFn: (row) => isValid(row?.DateOfBirth) ? formatDate(row?.DateOfBirth, "dd-MM-yyyy") : row?.DateOfBirth ?? "",
    },
    {
      header: "Opened Date",
      accessorFn: (row) =>  isValid(row?.createdAt) ? formatDate(row?.createdAt, "dd-MM-yyy hh:mm:ss a") : "",
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: ({ row }) => (
        <Link
          to={`${row?.original?.profileId}`}
          className="group relative mt-2 w-fit text-center text-xs font-medium text-primary duration-200"
        >
          View Account
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
      const { Gender, createdAt, state, ...rest } = account;

      return {
        ...rest,
        gender: GENDER_ENUM[Gender] ?? "",
        openedDate: formatDate(createdAt, "dd-MM-yyy hh:mm:ss a"),
        stateOfOrigin: state,
      };
    });
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        formatDataForReport(formattedData, [
          "workIdentification",
          "id",
          "profileId",
          "loanAmount",
          "loanTenor",
          "loanAgreement",
          "status",
          "stageStatus",
          "approved",
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
      const fileName = `Customer-${new Date().getTime().toString()}`;

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
        <PageTitle title="Customers" />
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
              <p>No account available</p>
            )
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default Customers;
