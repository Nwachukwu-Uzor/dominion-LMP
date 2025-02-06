import { Container, FileViewer, PageTitle, Record } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { formatDate, isValid } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY, USER_ROLES } from "@/constants";

import { ClipLoader } from "react-spinners";

import { Link, useParams } from "react-router-dom";
import { AccountService } from "@/services";

import { useUser } from "@/hooks";
import { FETCH_CUSTOMER_DETAILS } from "@/constants/query-keys";

const GENDER_ENUM: Record<string, string> = {
  "0": "Male",
  "1": "Female",
};

const CustomerDetails = () => {
  const { requestId, customerId } = useParams<{
    requestId: string;
    stage: string;
    customerId: string;
  }>();

  const { user } = useUser();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const accountService = new AccountService(token);
  const {
    data: accountInfo,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [FETCH_CUSTOMER_DETAILS, customerId],
    queryFn: async ({ queryKey }) => {
      const [_, customerId] = queryKey;
      console.log({_});
      

      if (!customerId) {
        return null;
      }

      const accountData =
        await accountService.getAccountByCustomerId(customerId);
      return accountData?.accountRecords;
    },
  });

  const shouldShowEditOption = user?.role
    ?.map((role) => role.toUpperCase())
    ?.includes(USER_ROLES.EDITOR);

  return (
    <>
      <Container>
        <PageTitle title="Customer Details" />
        <Card className="my-2 rounded-sm">
          {isLoading ? (
            <div className="flex min-h-[25vh] items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : isError ? (
            <div className="text-sm text-red-600">{error?.message}</div>
          ) : accountInfo ? (
            <>
              <div>
                <img
                  src={accountInfo?.profile?.CustomerImage}
                  alt="Customer Photo"
                  className="mb-4 aspect-square h-10 rounded-sm object-center md:h-20 lg:h-32"
                />
              </div>
              <article>
                <h3 className="border-b border-b-gray-400 py-1 text-sm font-semibold text-gray-400">
                  ACCOUNT INFO
                </h3>
                <div className="md:grid-col-2 mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  <Record
                    header="Title"
                    content={accountInfo?.profile?.title}
                  />
                  <Record
                    header="First Names"
                    content={accountInfo?.profile?.FirstName}
                  />
                  <Record
                    header="Last Name"
                    content={accountInfo?.profile?.LastName}
                  />
                  <Record
                    header="Other Names"
                    content={accountInfo?.profile?.OtherName}
                  />

                  <Record header="BVN" content={accountInfo?.profile?.BVN} />
                  <Record
                    header="Salary Account Number"
                    content={accountInfo?.profile?.salaryAccountNumber}
                  />
                  <Record
                    header="Bank Name"
                    content={accountInfo?.profile?.bankName}
                  />
                  <Record
                    header="Account Officer Code"
                    content={accountInfo?.AccountOfficerCode}
                  />
                  <Record
                    header="Account Officer Email"
                    content={accountInfo?.AccountOfficerEmail}
                  />
                  <Record
                    header="Opened Date"
                    content={
                      isValid(accountInfo?.createdAt)
                        ? formatDate(
                            accountInfo.createdAt,
                            "dd-MM-yyyy hh:mm:ss a",
                          )
                        : accountInfo?.createdAt
                    }
                  />
                </div>
              </article>
              <article className="mt-4">
                <h3 className="border-b border-b-gray-400 py-1 text-sm font-semibold text-gray-400">
                  PERSONAL INFORMATION
                </h3>
                <div className="md:grid-col-2 mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  <Record
                    header="Date of Birth"
                    content={
                      isValid(accountInfo?.profile?.DateOfBirth)
                        ? formatDate(
                            accountInfo?.profile?.DateOfBirth,
                            "dd-MM-yy",
                          )
                        : accountInfo?.profile?.DateOfBirth
                    }
                  />
                  <Record
                    header="Gender"
                    content={
                      accountInfo?.profile?.Gender
                        ? (GENDER_ENUM[accountInfo?.profile?.Gender] ??
                          accountInfo?.profile?.Gender)
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
                    header="Phone Number"
                    content={accountInfo?.profile?.PhoneNo}
                  />
                  <Record
                    header="State of Origin"
                    content={accountInfo?.profile?.state}
                  />
                  <Record header="BVN" content={accountInfo?.profile?.BVN} />
                  <Record
                    header="IPPIS Number"
                    content={accountInfo?.profile?.ippisNumber}
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
                <h3 className="border-b border-b-gray-400 py-1 text-sm font-semibold text-gray-400">
                  DOCUMENTS
                </h3>
                <div className="mt-2 border-b-[0.15px] border-b-gray-200 pb-2">
                  <h2 className="text-sm font-medium text-gray-400">NIN: </h2>
                  {accountInfo?.profile?.IdentificationImage && (
                    <FileViewer
                      url={accountInfo?.profile?.IdentificationImage}
                      maxWidth={400}
                    />
                  )}
                </div>
                <div className="mt-2 border-b-[0.15px] border-b-gray-200 pb-2">
                  <h2 className="mb-2 text-sm font-medium uppercase text-gray-400">
                    Work Identification:{" "}
                  </h2>
                  {accountInfo?.profile?.workIdentification && (
                    <FileViewer
                      url={accountInfo?.profile?.workIdentification}
                      maxWidth={250}
                    />
                  )}
                </div>
                <div className="mt-2 border-b-[0.15px] border-b-gray-200 pb-2">
                  <h2 className="mb-2 text-sm font-medium uppercase text-gray-400">
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
                    accountInfo?.profile?.otherDocuments &&
                    "border-b-[0.15px] border-b-gray-200 pb-2"
                  }`}
                >
                  <h2 className="mb-2 text-sm font-medium uppercase text-gray-400">
                    Other Documents:{" "}
                  </h2>
                  {accountInfo?.profile?.otherDocuments &&
                    accountInfo?.profile?.otherDocuments?.length > 0 &&
                    accountInfo?.profile.otherDocuments?.map((doc, index) => (
                      <div key={doc.title}>
                        <h3 className="mb-2 text-xs font-medium uppercase text-gray-400">
                          <span className="text-black">{index + 1}</span>.{" "}
                          {doc.title}
                        </h3>
                        <FileViewer url={doc.otherDocument} maxWidth={250} />
                      </div>
                    ))}
                </div>
                {shouldShowEditOption && (
                  <div className="my-2 flex flex-col gap-2">
                    <Link
                      to={`/loan/requests/rejected/edit/${requestId}`}
                      className="group relative mt-2 w-fit text-center text-xs font-medium text-primary duration-200"
                    >
                      Edit
                      <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary duration-200 group-hover:w-full"></span>
                    </Link>
                  </div>
                )}
              </article>
            </>
          ) : null}
        </Card>
      </Container>
    </>
  );
};

export default CustomerDetails;
