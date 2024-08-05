import { useState } from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { SubmitHandler, useForm } from "react-hook-form";
import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { LoanRepaymentType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";

// import { getDaysFromToday } from "@/utils";
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
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { formatDate } from "date-fns";

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

const INITIAL_CONFIG = {
  page: 1,
  size: 10,
  totalPages: 0,
};

const BulkNotificationDetails = () => {
  const { id } = useParams<{ id: string }>();

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

  // const [status] = watch(["status"]);

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const [pageConfig, setPageConfig] = useState(INITIAL_CONFIG);

  const { isLoading, data } = useQuery({
    queryKey: [FETCH_ALL_LOAN_REPAYMENTS, id, pageConfig.page],
    queryFn: async ({ queryKey }) => {
      const page = queryKey[2];
      if (!id) {
        return;
      }

      const data = await loanService.getLoanRepaymentsByUploadId(
        id,
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

  console.log({ isLoading, data });

  // useEffect(() => {
  //   const dates = getDaysFromToday(-5);
  //   setValue("startDate", dates.other);
  //   setValue("endDate", dates.today);
  // }, [setValue, handleSubmit]);

  const columns: ColumnDef<LoanRepaymentType>[] = [
    {
      header: "Employee Name",
      accessorKey: "employeeName",
    },
    {
      header: "Service Number",
      accessorKey: "serviceNumber",
    },
    {
      header: "IPPIS Number",
      accessorKey: "ippisNo",
    },
    {
      header: "Account ID",
      accessorKey: "accountId",
    },
    {
      header: "Pencom ID",
      accessorKey: "pencomID",
    },
    {
      header: "Bank Code",
      accessorKey: "bankCode",
    },
    {
      header: "Amount",
      accessorKey: "amount",
    },
    {
      header: "Loan Id",
      accessorKey: "loanloanId",
    },
    {
      header: "Deduction Beneficiary",
      accessorKey: "deductionBeneficiary",
    },
    {
      header: "Element Name",
      accessorKey: "elementName",
    },
    {
      header: "Narration",
      accessorKey: "narration",
    },
    {
      header: "NHF Number",
      accessorKey: "nhfNumber",
    },
    {
      header: "Upload By",
      accessorKey: "createdByProfile.fullName",
    },
    {
      header: "Upload At",
      accessorKey: "createdAt",
      cell: ({ getValue }) => (
        <>{formatDate(getValue() as string, "dd-MM-yyyy hh:mm:ss a")}</>
      ),
    },
  ];

  // const onSubmit: SubmitHandler<FormFields> = async (values) => {
  //   try {
  //     console.log({ values });

  //     // const data = await transactionService.getTransactionsByDate(values);
  //     // setTransactions(data);
  //   } catch (error: any) {
  //     setError("root", {
  //       type: "deps",
  //       message:
  //         error?.response?.data?.message ??
  //         error?.message ??
  //         "An error occurred",
  //     });
  //     toast.error(
  //       error?.response?.data?.message ?? error?.message ?? "An error occurred",
  //       { toastId: "transactions-fetch-202233" }
  //     );
  //     return;
  //   }
  // };

  const handlePageNumberClick = (pageNumber: number) => {
    setPageConfig((current) => ({ ...current, page: pageNumber }));
  };

  return (
    <Container>
      {/* <Link
        to="/requests/new"
        className="max-w-[100px] gap-1 rounded-md active:scale-75 hover:opacity-60 duration-150 text-sm py-1.5 px-1 mb-2 flex items-center justify-center ml-auto bg-black text-white"
      >
        <FaPlus /> New
      </Link> */}
      <PageTitle title="Bulk Notification Details" />
      <Card className="my-2 rounded-md">
        {isLoading ? (
          <div className="min-h-[25vh] flex items-center justify-center">
            <ClipLoader size={25} color="#5b21b6" />
          </div>
        ) : data?.accountRecords && data?.accountRecords?.length > 0 ? (
          <>
            <NonPaginatedTable columns={columns} data={data.accountRecords} />
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

export default BulkNotificationDetails;
