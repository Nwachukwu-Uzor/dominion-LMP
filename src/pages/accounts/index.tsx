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
import {
  AccountType,
  // RequestType
} from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
// import { dummyRequests } from "@/data/";
import { Card } from "@/components/ui/card";
// import { IoEye } from "react-icons/io5";
import { formatDate } from "date-fns";
// import {
//   formatNumberWithCommas,
//   generateTransactionStatusStyle,
//   getDaysFromToday,
// } from "@/utils";
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
import { useQuery } from "@tanstack/react-query";
import { FETCH_ACCOUNTS_PAGINATED, SESSION_STORAGE_KEY } from "@/constants";
import { AccountService } from "@/services/account-service";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom";

// const schema = z
//   .object({
//     status: z.optional(z.string()),
//     startDate: z.string().refine(
//       (value) => {
//         // Validate that startDate is at least today's date
//         const today = new Date();
//         const selectedDate = new Date(value);
//         return selectedDate <= today;
//       },
//       {
//         message: "Start date must not exceed today's date",
//       }
//     ),
//     endDate: z.string().refine(
//       (value) => {
//         // Validate that endDate is after startDate
//         const today = new Date();
//         const selectedDate = new Date(value);
//         return selectedDate <= today;
//       },
//       {
//         message: "End date must not exceed today's date",
//       }
//     ),
//   })
//   .refine(
//     (data) => {
//       const startDate = new Date(data.startDate);
//       const endDate = new Date(data.endDate);
//       return endDate > startDate;
//     },
//     {
//       message: "End date must be more than start date",
//       path: ["endDate"],
//     }
//   );

// type FormFields = z.infer<typeof schema>;

// const STATUS_OPTIONS = [
//   {
//     id: 1,
//     value: "All",
//     label: "All",
//   },
//   {
//     id: 2,
//     value: "Successful",
//     label: "Successful",
//   },
//   {
//     id: 3,
//     value: "Pending",
//     label: "Pending",
//   },
//   {
//     id: 4,
//     value: "Declined",
//     label: "Declined",
//   },
//   {
//     id: 5,
//     value: "Failed",
//     label: "Failed",
//   },
// ];

const initialPageConfig = {
  size: 10,
  total: 1,
  page: 1,
};

const Accounts = () => {
  // const {
  //   register,
  //   setError,
  //   handleSubmit,
  //   watch,
  //   setValue,
  //   trigger,
  //   formState: { errors, isSubmitting },
  // } = useForm<FormFields>({
  //   resolver: zodResolver(schema),
  // });

  const [pageConfig, setPageConfig] = useState(initialPageConfig);

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

  return (
    <>
      <Container>
        <PageTitle title="Accounts" />
        <Card className="my-2">
          {/* <form
          className="flex my-2 flex-col lg:flex-row gap-3 lg:gap-2 justify-between items-start lg:items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full max-w-[400px]">
            <Label htmlFor="alertType" className="mb-1 font-semibold">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={async (value) => {
                setValue("status", value);
                await trigger(["status"]);
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {STATUS_OPTIONS?.map((opt) => (
                    <SelectItem value={opt.value} key={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Input
              type="date"
              label="Start Date"
              className="cursor-pointer w-full"
              {...register("startDate")}
              error={errors?.startDate?.message}
              disabled={isSubmitting}
            />
            <Input
              type="date"
              label="End Date"
              className="cursor-pointer w-full"
              {...register("endDate")}
              error={errors?.endDate?.message}
              disabled={isSubmitting}
            />
          </div>
          <Button>Search</Button>
        </form> */}
          {isLoadingAccounts ? (
            <div className="flex min-h-[25vh] items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : isAccountsError ? (
            <div>{accountError?.message}</div>
          ) : accounts ? (
            accounts?.length > 0 ? (
              <>
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
