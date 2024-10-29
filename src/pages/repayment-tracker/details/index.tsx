import { useState } from "react";
import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { LoanRepaymentType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { SESSION_STORAGE_KEY, USER_ROLES } from "@/constants";
import { LoanService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@/components/shared/pagination";
import { ClipLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { formatDate, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { IoMdDownload } from "react-icons/io";
import { formatDataForReport } from "@/utils";
import { FETCH_ALL_LOAN_REPAYMENTS } from "@/constants/query-keys";
import { useUser } from "@/hooks";
const INITIAL_CONFIG = {
  page: 1,
  size: 10,
  totalPages: 0,
};

const RepaymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser()

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
        pageConfig.size,
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

  const handlePageNumberClick = (pageNumber: number) => {
    setPageConfig((current) => ({ ...current, page: pageNumber }));
  };

  const handleDownload = () => {
    if (!data || data?.accountRecords?.length === 0) {
      return;
    }
    const formattedData = data?.accountRecords?.map((record) => {
      const { loanloanId, createdAt, ...rest } = record;
      return {
        ...rest,
        loanId: loanloanId,
        uploadedAt:
          isValid(createdAt) && createdAt
            ? formatDate(createdAt, "dd-MM-yyyy hh:mm:ss a")
            : "",
      };
    });

    try {
      const worksheet = XLSX.utils.json_to_sheet(
        formatDataForReport(formattedData, [
          "UploadedFileID",
          "id",
          "updatedAt",
          "createdBy",
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
      const fileName = `Bulk-Repayment-${new Date().getTime().toString()}`;

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
    <Container>
      <PageTitle title="Bulk Repayment Details" />
      <Card className="my-2 rounded-md">
        {isLoading ? (
          <div className="flex min-h-[25vh] items-center justify-center">
            <ClipLoader size={25} color="#5b21b6" />
          </div>
        ) : data?.accountRecords && data?.accountRecords?.length > 0 ? (
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

export default RepaymentDetails;
