import { Container, PageTitle, Record } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AccountService } from "@/services";
import { Link } from "react-router-dom";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useState } from "react";
import { IPPISResponseType } from "@/types/shared";
import { ClipLoader } from "react-spinners";
import { formatCurrency } from "@/utils";

const schema = z.object({
  IppisNumber: z
    .string({ required_error: "IPPIS Number is required" })
    .min(5, "IPPIS Number must be at least 5 characters"),
});

type FormFields = z.infer<typeof schema>;

const IPPISData = () => {
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  // const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const accountService = new AccountService(/*token*/);

  const [IPPISInfo, setIPPISInfo] = useState<IPPISResponseType | null>(null);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const data = await accountService.validateIPPISNumber(values);
      const info = data?.payload;

      if (info) {
        setIPPISInfo(info);
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

  return (
    <Container>
      <PageTitle title="IPPIS Data" />
      <Card className="mt-4">
        <Link
          to="new-upload"
          className="max-w-[180px] gap-1 rounded-md active:scale-75 hover:opacity-60 duration-150 py-2 px-1 mb-4 flex items-center justify-center ml-auto bg-[#7E21CF] text-white text-xs font-medium"
        >
          Upload New
        </Link>
        <h2 className="mb-6 font-semibold">Verify IPPIS Info</h2>
        <form className="max-w-[600px]" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              label="Enter IPPIS Number"
              placeholder="Enter IPPIS Number"
              {...register("IppisNumber")}
              error={errors?.IppisNumber?.message}
              onChange={(event) => {
                setIPPISInfo(null);
                const { value } = event.target;
                setValue("IppisNumber", value);
              }}
            />
          </div>
          <p className="h-1 my-0.5 text-red-500 text-[10px]">
            {errors?.root?.message}
          </p>
          <Button className="min-w-[250px] mt-2">
            {isSubmitting ? <ClipLoader color="#fff" size={12} /> : "Search"}
          </Button>
        </form>
        <article>
          {isSubmitting ? (
            <div className="flex items-center justify-center h-[10vh]">
              <ClipLoader color="#5b21b6" size={12} />
            </div>
          ) : IPPISInfo ? (
            <article>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                <Record header="Staff ID" content={IPPISInfo.staffId} />
                <Record header="Full Name" content={IPPISInfo.fullName} />
                <Record
                  header="Employment Status"
                  content={IPPISInfo.employmentStatus}
                />
                <Record
                  header="Assignment Status"
                  content={IPPISInfo.assignmentStatus}
                />
                <Record header="Hire Date" content={IPPISInfo.hireDate} />
                <Record header="Birth Date" content={IPPISInfo.birthDate} />
                <Record header="Job Title" content={IPPISInfo.jobTitle} />
                <Record header="Command" content={IPPISInfo.command} />
                <Record header="Phone Number" content={IPPISInfo.phoneNumber} />
                <Record header="Bank Name" content={IPPISInfo.bankName} />
                <Record
                  header="Account Number"
                  content={IPPISInfo.accountNumber}
                />
                <Record
                  header="Staff Category"
                  content={IPPISInfo.staffCategory}
                />
                <Record
                  header="Employee Type"
                  content={IPPISInfo.employeeType}
                />
                <Record
                  header="Net Pay"
                  content={formatCurrency(IPPISInfo.netPay)}
                />
                <Record header="Period" content={IPPISInfo.period} />

                <Record header="Status" content={IPPISInfo.status} />
              </div>
            </article>
          ) : null}
        </article>
      </Card>
    </Container>
  );
};

export default IPPISData;
