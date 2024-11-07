import { Container, DashboardCard, PageTitle } from "@/components/shared";
import { LoanRepaymentType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";

import { Link } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { NonPaginatedTable } from "@/components/shared/data-table";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
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
          className="group relative flex w-fit items-center justify-center gap-0.5 text-sm font-bold text-primary hover:opacity-85"
        >
          <IoEye /> Details
          <span className="absolute -bottom-0.5 left-0 h-[1.25px] w-0 bg-primary opacity-85 duration-150 ease-linear group-hover:w-full"></span>
        </Link>
      ),
    },
  ];

  return (
    <Container>
      <PageTitle title="Dashboard" />
      <article className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="my-2 flex items-center justify-between">
          <h2 className="my-2 text-lg font-bold">Repayment Tracker (SMS)</h2>
          <Link
            to="/repayment-tracker"
            className="group relative flex w-fit items-center justify-center gap-0.5 text-xs font-semibold text-primary hover:opacity-85"
          >
            View All
            <span className="absolute -bottom-0.5 left-0 h-[1.25px] w-0 bg-primary opacity-85 duration-150 ease-linear group-hover:w-full"></span>
          </Link>
        </div>
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
          </>
        ) : (
          <p>No Records found</p>
        )}
      </Card>
    </Container>
  );
};

export default Dashboard;
