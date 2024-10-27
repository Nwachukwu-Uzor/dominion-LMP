import { Container, DashboardCard, PageTitle } from "@/components/shared";
import { LoanRepaymentType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";

import { Link } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { NonPaginatedTable } from "@/components/shared/data-table";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  SESSION_STORAGE_KEY,
} from "@/constants";
import { LoanService } from "@/services";
import { ClipLoader } from "react-spinners";
import { formatDate } from "date-fns";
import { FETCH_ALL_LOAN_REPAYMENTS, FETCH_STATS } from "@/constants/query-keys";

const Dashboard = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);

  const { isLoading, data } = useQuery({
    queryKey: [FETCH_ALL_LOAN_REPAYMENTS],
    queryFn: async () => {
      const data = await loanService.getAllLoanRepayments(1, 10);

      return data?.payload;
    },
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: [FETCH_STATS],
    queryFn: async () => {
      const data = await loanService.getRequestStats();
      return data;
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
          to={`/repayment-tracker/${row?.original?.UploadedFileID}`}
          className="text-primary relative group w-fit font-bold text-sm flex items-center justify-center gap-0.5 hover:opacity-85"
        >
          <IoEye /> Details
          <span className="absolute left-0 h-[1.25px] -bottom-0.5 w-0 group-hover:w-full bg-primary ease-linear duration-150 opacity-85"></span>
        </Link>
      ),
    },
  ];

  return (
    <Container>
      <PageTitle title="Dashboard" />
      <article className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <DashboardCard
          count={stats?.completed ?? 0}
          title="Completed Requests"
          theme="success"
          isLoading={isLoadingStats}
        />
        <DashboardCard
          count={stats?.pendingAuthorizer ?? 0}
          title="Pending Authorizer"
          theme="warn"
          isLoading={isLoadingStats}
        />
        <DashboardCard
          count={stats?.pendingReviewer ?? 0}
          title="Pending Reviewer"
          theme="dark"
          isLoading={isLoadingStats}
        />
      </article>
      <Card className="mt-4 rounded-md">
        <div className="flex justify-between items-center my-2">
          <h2 className="font-bold text-lg my-2">Repayment Tracker</h2>
          <Link
            to="/repayment-tracker"
            className="text-primary relative group w-fit font-semibold text-xs flex items-center justify-center gap-0.5 hover:opacity-85"
          >
            View All
            <span className="absolute left-0 h-[1.25px] -bottom-0.5 w-0 group-hover:w-full bg-primary ease-linear duration-150 opacity-85"></span>
          </Link>
        </div>
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
          </>
        ) : (
          <p>No Records found</p>
        )}
      </Card>
    </Container>
  );
};

export default Dashboard;
