import {
  // useEffect,
  useState,
} from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { SubmitHandler, useForm } from "react-hook-form";
import {
  Container,
  // DataTable,
  NonPaginatedTable,
  PageTitle,
} from "@/components/shared";
import { CustomerType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
// import { dummyRequests } from "@/data/";
import { Card } from "@/components/ui/card";
// import { IoEye } from "react-icons/io5";
import { formatDate } from "date-fns";

import { useQuery } from "@tanstack/react-query";
import {
  FETCH_ALL_CUSTOMERS_PAGINATED,
  SESSION_STORAGE_KEY,
} from "@/constants";
import { AccountService } from "@/services/account-service";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";

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
        pageConfig.size
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
      cell: ({row}) => <span className="bold">{row.index + 1}. </span>
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
      accessorFn: (row) => formatDate(row.DateOfBirth, "dd-MM-yyyy"),
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
          to={`/accounts/${row?.original?.customerNumber}`}
          className="mt-2 text-primary text-xs group font-medium duration-200 relative w-fit text-center"
        >
          View Account
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
        <PageTitle title="Customers" />
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

export default Customers;
