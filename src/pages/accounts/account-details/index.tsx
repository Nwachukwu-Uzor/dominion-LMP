import {
  Container,
  DataTable,
  FileViewer,
  PageTitle,
} from "@/components/shared";
import { AccountLoanType } from "@/types/shared";
import { Card } from "@/components/ui/card";
// import { IoEye } from "react-icons/io5";
import { formatDate } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { FETCH_ACCOUNT_DETAILS_BY_ID, SESSION_STORAGE_KEY } from "@/constants";

import { ClipLoader } from "react-spinners";

import { Link, useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { AccountService } from "@/services";

const GENDER_ENUM: Record<string, string> = {
  "0": "Male",
  "1": "Female",
};

const Record = ({
  header,
  content,
}: {
  header: string;
  content?: string | number;
}) => (
  <div>
    <h3 className="text-gray-400 text-xs font-medium">
      {header.toUpperCase()}:
    </h3>
    <h6 className="text-sm mt-1">{content}</h6>
  </div>
);

const AccountDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const accountService = new AccountService(token);

  const {
    data: accountInfo,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [FETCH_ACCOUNT_DETAILS_BY_ID, customerId],
    queryFn: async ({ queryKey }) => {
      const customerId = queryKey[1];
      console.log(customerId);
      if (!customerId) {
        return;
      }
      const accountData = await accountService.getAccountByCustomerId(
        customerId
      );
      return accountData?.accountRecords;
    },
  });

  const columns: ColumnDef<AccountLoanType>[] = [
    {
      header: "Amount",
      accessorKey: "Amount",
    },
    {
      header: "Product Code",
      accessorKey: "LoanProductCode",
    },
    {
      header: "Tenure",
      accessorKey: "Tenure",
    },
    {
      header: "Interest Rate (%)",
      accessorKey: "InterestRate",
    },
    {
      header: "Moratorium",
      accessorKey: "Moratorium",
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      cell: ({ getValue }) =>
        formatDate(getValue() as string, "dd-MM-yyyy HH:mm:ss") ?? "",
    },
    {
      header: "Interest Accrual Commencement Date",
      accessorKey: "InterestAccrualCommencementDate",
    },
    {
      header: "Collateral Type",
      accessorKey: "CollateralType",
    },
    {
      header: "Collateral Details",
      accessorKey: "CollateralDetails",
    },
    {
      header: "Loan Status",
      accessorKey: "loanAccountStatus",
    },
    {
      header: "Linked Account Number",
      accessorKey: "LinkedAccountNumber",
    },
    {
      header: "Principal Payment Frequency",
      accessorKey: "PrincipalPayloadFrequency",
    },
    {
      header: "Interest Payment Frequency",
      accessorKey: "InterestPaymentFrequency",
    },
    {
      header: "Computation Mode",
      accessorKey: "ComputationMode",
    },
    {
      header: "Transaction Tracking Ref",
      accessorKey: "TransactionTrackingRef",
    },
    {
      header: "View Repayments",
      accessorKey: "loanloanId",
      cell: ({ getValue }) => (
        <Link
          to={`/accounts/loan/${getValue()}`}
          className="mt-2 text-primary text-xs group font-medium duration-200 relative w-fit text-center"
        >
          View
          <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
        </Link>
      ),
    },
  ];

  // const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  // const accountsService = new AccountService(token);

  return (
    <>
      <Container>
        <PageTitle title="Account Details" />
        <Card className="my-2 rounded-sm">
          {isLoading ? (
            <div className="min-h-[25vh] flex items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : isError ? (
            <div>{JSON.stringify(error)}</div>
          ) : accountInfo ? (
            <>
              <div>
                <h2 className="text-gray-400 text-sm mb-2 font-medium uppercase">
                  Customer Passport Image:
                </h2>
                <img
                  src={accountInfo?.profile?.CustomerImage}
                  alt="Customer Photo"
                  className="h-10 md:h-20 lg:h-32 aspect-square rounded-sm mb-4 object-center"
                />
              </div>
              <article>
                <h3 className="text-sm font-semibold text-gray-400 py-1 border-b border-b-gray-400">
                  ACCOUNT INFO
                </h3>
                <div className="grid grid-cols-1 md:grid-col-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  <Record
                    header="Title"
                    content={accountInfo?.profile?.title}
                  />
                  <Record
                    header="First Name"
                    content={accountInfo?.profile?.FirstName}
                  />
                  <Record
                    header="Last Name"
                    content={accountInfo?.profile?.LastName}
                  />
                  <Record
                    header="Account Number"
                    content={accountInfo?.accountNumber}
                  />
                  <Record
                    header="Customer Number"
                    content={accountInfo?.customerNumber}
                  />
                  <Record header="BVN" content={accountInfo?.profile?.BVN} />
                  <Record
                    header="Product Code"
                    content={accountInfo?.ProductCode}
                  />
                  <Record
                    header="Account Officer"
                    content={accountInfo?.AccountOfficerCode}
                  />
                  <Record
                    header="Opened Date"
                    content={
                      formatDate(
                        accountInfo.createdAt,
                        "dd-MM-yyyy hh:mm:ss a"
                      ) ?? ""
                    }
                  />
                </div>
              </article>
              <article className="mt-4">
                <h3 className="text-sm font-semibold text-gray-400 py-1 border-b border-b-gray-400">
                  PERSONAL INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-col-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  <Record
                    header="Date of Birth"
                    content={
                      accountInfo?.profile?.DateOfBirth
                        ? formatDate(
                            accountInfo?.profile?.DateOfBirth,
                            "dd-MM-yy"
                          )
                        : ""
                    }
                  />
                  <Record
                    header="Gender"
                    content={
                      accountInfo?.profile?.Gender
                        ? GENDER_ENUM[accountInfo?.profile?.Gender] ??
                          accountInfo?.profile?.Gender
                        : ""
                    }
                  />
                  <Record
                    header="Address"
                    content={accountInfo?.profile?.Address}
                  />
                  <Record
                    header="Email"
                    content={accountInfo?.profile?.Email}
                  />
                  <Record
                    header="State"
                    content={accountInfo?.profile?.state}
                  />
                  <Record
                    header="NIN"
                    content={accountInfo?.profile?.NationalIdentityNo}
                  />
                  <Record
                    header="Next of Kin"
                    content={accountInfo?.profile?.NextOfKinName}
                  />
                  <Record
                    header="Next of Kin Phon Number"
                    content={accountInfo?.profile?.NextOfKinPhoneNo}
                  />
                </div>
              </article>
              <article className="mt-4">
                <h3 className="text-sm font-semibold text-gray-400 py-1 border-b border-b-gray-400 uppercase">
                  Documents
                </h3>
                <div className="mt-2 border-b-gray-200 pb-2 border-b-[0.15px]">
                  <h2 className="text-gray-400 text-sm font-medium">NIN: </h2>
                  {accountInfo?.profile?.IdentificationImage && (
                    <FileViewer
                      url={accountInfo?.profile?.IdentificationImage}
                      maxWidth={400}
                    />
                  )}
                </div>
                <div className="mt-2 border-b-gray-200 pb-2 border-b-[0.15px]">
                  <h2 className="text-gray-400 text-sm mb-2 font-medium uppercase">
                    Signature:{" "}
                  </h2>
                  {accountInfo?.profile?.CustomerSignature && (
                    <FileViewer
                      url={accountInfo?.profile?.CustomerSignature}
                      maxWidth={250}
                    />
                  )}
                </div>
                <div
                  className={`mt-2 ${
                    accountInfo?.profile?.otherDocument &&
                    "border-b-gray-200 pb-2 border-b-[0.15px]"
                  }`}
                >
                  <h2 className="text-gray-400 text-sm mb-2 font-medium uppercase">
                    Other Documents:{" "}
                  </h2>
                  {accountInfo?.profile?.otherDocument && (
                    <FileViewer url={accountInfo?.profile?.otherDocument} />
                  )}
                </div>
              </article>
              <article className="mt-10">
                <h3 className="text-sm font-semibold text-gray-400 py-1 border-b border-b-gray-400">
                  LOAN ACCOUNTS:
                </h3>
                {accountInfo?.accountLoans &&
                accountInfo?.accountLoans?.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={accountInfo.accountLoans}
                  />
                ) : (
                  <p className="my-2 text-center">No Loan Found</p>
                )}
              </article>
            </>
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default AccountDetails;
