import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Container, FileViewer, PageTitle } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { formatDate } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { FETCH_ACCOUNT_DETAILS_BY_ID, SESSION_STORAGE_KEY } from "@/constants";

import { ClipLoader } from "react-spinners";

import { useParams } from "react-router-dom";
import { LoanService } from "@/services";
import { formatCurrency } from "@/utils/format-number-with-commas";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks";

const GENDER_ENUM: Record<string, string> = {
  "1": "Male",
  "2": "Female",
};

const schema = z.object({
  approved: z
    .string({ required_error: "Action is required" })
    .min(2, "Action is required"),
  note: z
    .string({ required_error: "Note is required" })
    .min(2, "Note is required"),
});

type FormFields = z.infer<typeof schema>;

const VALID_STAGES: Record<string, string> = {
  REVIEWER: "REVIEWER",
  SUPERVISOR: "SUPERVISOR",
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

const RequestDetails = () => {
  let ACTION_OPTIONS = [
    {
      id: 1,
      label: "Approve",
      value: "approve",
    },
    {
      id: 2,
      label: "Reject",
      value: "reject",
    },
  ];
  const { requestId, stage } = useParams<{
    requestId: string;
    stage: string;
  }>();
  const { user } = useUser();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);
  const {
    data: accountInfo,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: [FETCH_ACCOUNT_DETAILS_BY_ID, requestId],
    queryFn: async ({ queryKey }) => {
      const requestId = queryKey[1];

      if (!requestId || !stage) {
        return;
      }
      const accountData = await loanService.getLoanRequestById(requestId);
      return accountData?.accountRecords;
    },
  });

  if (accountInfo?.stage?.toUpperCase() === VALID_STAGES.SUPERVISOR) {
    ACTION_OPTIONS = [
      ...ACTION_OPTIONS,
      {
        id: 3,
        label: "Close",
        value: "close",
      },
    ];
  }

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    if (!requestId || !user?.UserId) {
      return;
    }
    try {
      if (stage?.toUpperCase() === VALID_STAGES.REVIEWER) {
        const payload = {
          ...values,
          requestId,
          reviewerUserId: user?.UserId,
        };
        const response = await loanService.reviewLoanRequest(payload);
        toast.success(response?.message);
        refetch();
        return;
      }
      if (stage?.toUpperCase() === VALID_STAGES.SUPERVISOR) {
        const payload = {
          ...values,
          requestId,
          approvalUserId: user?.UserId,
        };
        const response = await loanService.reviewLoanRequestSupervisor(payload);
        toast.success(response?.message);
        refetch();
      }
    } catch (error: any) {
      setError("root", {
        type: "deps",
        message:
          error?.response?.data?.message ??
          error?.message ??
          "An error occurred",
      });
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred"
      );
    }
  };

  const [approved] = watch(["approved"]);

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
            <div>{error?.message}</div>
          ) : accountInfo ? (
            <>
              <div>
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
                    header="First Names"
                    content={accountInfo?.profile?.FirstName}
                  />
                  <Record
                    header="Last Name"
                    content={accountInfo?.profile?.LastName}
                  />
                  <Record
                    header="Loan Amount"
                    content={formatCurrency(accountInfo?.profile?.loanAmount)}
                  />
                  <Record
                    header="Loan Tenor"
                    content={accountInfo?.profile?.loanTenor}
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
                  <Record header="Request Stage" content={accountInfo?.stage} />
                  {accountInfo?.stage?.toUpperCase() ===
                    VALID_STAGES.SUPERVISOR && (
                    <>
                      <Record
                        header="Reviewer Recommendation"
                        content={accountInfo?.reviewerRecommendation}
                      />
                      <Record
                        header="Reviewer Note"
                        content={accountInfo?.reviewerNote}
                      />
                    </>
                  )}
                  {accountInfo?.stage?.toUpperCase() ===
                    VALID_STAGES.REVIEWER &&
                    accountInfo?.supervisorUserId && (
                      <>
                        <Record
                          header="Reviewer Recommendation"
                          content={accountInfo?.supervisorRecommendation}
                        />
                        <Record
                          header="Reviewer Note"
                          content={accountInfo?.supervisorNote}
                        />
                      </>
                    )}
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
                  <Record
                    header="Account Officer"
                    content={accountInfo?.AccountOfficerCode}
                  />
                </div>
              </article>
              <article className="mt-4">
                <h3 className="text-sm font-semibold text-gray-400 py-1 border-b border-b-gray-400">
                  Documents
                </h3>
                <div className="mt-2">
                  <h2 className="text-gray-400 text-sm font-medium">NIN: </h2>
                  {accountInfo?.profile?.IdentificationImage && (
                    <FileViewer
                      url={accountInfo?.profile?.IdentificationImage}
                      maxWidth={400}
                    />
                  )}
                </div>
                <div className="mt-2">
                  <h2 className="text-gray-400 text-sm font-medium">
                    Signature:{" "}
                  </h2>
                  {accountInfo?.profile?.CustomerSignature && (
                    <FileViewer
                      url={accountInfo?.profile?.CustomerSignature}
                      maxWidth={250}
                    />
                  )}
                </div>
                <div className="mt-2">
                  <h2 className="text-gray-400 text-sm font-medium">
                    Other Documents:{" "}
                  </h2>
                  {accountInfo?.profile?.otherDocument && (
                    <FileViewer url={accountInfo?.profile?.otherDocument} />
                  )}
                </div>
                {stage?.trim()?.toUpperCase() ===
                  accountInfo?.stage?.trim()?.toUpperCase() &&
                  (accountInfo?.stage?.toUpperCase() ===
                    VALID_STAGES.REVIEWER ||
                    accountInfo?.stage?.toUpperCase() ===
                      VALID_STAGES.SUPERVISOR) && (
                    <div className="mt-2">
                      <h2 className="text-gray-400 text-sm font-medium">
                        Action:
                      </h2>
                      <form
                        className="mt-3 max-w-[700px] flex flex-col gap-2.5"
                        onSubmit={handleSubmit(onSubmit)}
                      >
                        <div>
                          <Label
                            htmlFor="alertType"
                            className="mb-1 font-semibold"
                          >
                            Select Action:
                          </Label>
                          <Select
                            value={approved}
                            disabled={isSubmitting}
                            onValueChange={async (value) => {
                              setValue("approved", value);
                              await trigger("approved");
                            }}
                          >
                            <SelectTrigger className="">
                              <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Status</SelectLabel>
                                {ACTION_OPTIONS?.map((opt) => (
                                  <SelectItem value={opt.value} key={opt.id}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <p className="h-1 mt-0.5 text-red-500 text-[10px]">
                            {errors?.approved?.message}
                          </p>
                        </div>
                        <Textarea
                          label="Note: "
                          {...register("note")}
                          error={errors?.note?.message}
                          disabled={isSubmitting}
                          rows={10}
                        />
                        <p className="lg:col-span-full my-1 text-sm text-red-600 font-semibold">
                          {errors?.root?.message}
                        </p>
                        <Button
                          className="rounded-sm max-w-[250px] mt-3"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <ClipLoader color="#fff" size={10} /> Loading
                            </>
                          ) : (
                            <>Submit</>
                          )}
                        </Button>
                      </form>
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

export default RequestDetails;
