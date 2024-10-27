import { useState } from "react";
import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { LoanRepaymentType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";

import { SESSION_STORAGE_KEY } from "@/constants";
import { LoanService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { formatDate } from "date-fns";
import { FETCH_ALL_LOAN_REPAYMENTS } from "@/constants/query-keys";

const INITIAL_CONFIG = {
  page: 1,
  size: 10,
  totalPages: 0,
};

const LoanRepaymentsByLoanId = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const [pageConfig, setPageConfig] = useState(INITIAL_CONFIG);

  const { isLoading, data } = useQuery({
    queryKey: [FETCH_ALL_LOAN_REPAYMENTS, loanId, pageConfig.page],
    queryFn: async ({ queryKey }) => {
      if (!loanId) {
        return;
      }
      const page = queryKey[2];

      const data = await loanService.getLoanRepaymentsByLoanId(
        loanId,
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

  const columns: ColumnDef<LoanRepaymentType>[] = [
    {
      header: "S/N",
      accessorKey: "id",
      cell: ({row}) => <span className="bold">{row.index + 1}. </span>
    },
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
      accessorKey: "createdByProfile.fullName"
    },
    {
      header: "Upload At",
      accessorKey: "createdAt",
      cell: ({ getValue }) => (
        <>{formatDate(getValue() as string, "dd-MM-yyyy hh:mm:ss a")}</>
      ),
    },
  ];

  const handlePageNumberClick = (pageNumber: number) => {
    setPageConfig((current) => ({ ...current, page: pageNumber }));
  };

  return (
    <Container>
      <PageTitle title="Loan Repayments" />
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
          <p>No Repayment Records Found</p>
        )}
        <>
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
        </form>
        <DataTable columns={columns} data={dummyLoans} /> */}
        </>
      </Card>
    </Container>
  );
};

export default LoanRepaymentsByLoanId;
