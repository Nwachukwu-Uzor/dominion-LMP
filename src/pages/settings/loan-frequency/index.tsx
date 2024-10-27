import { Container, PageTitle } from "@/components/shared";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SESSION_STORAGE_KEY,
} from "@/constants";
import { LoanService } from "@/services";
import { ClipLoader } from "react-spinners";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaInfoCircle } from "react-icons/fa";
import { formatDate } from "date-fns";
import { RiExpandDiagonalFill } from "react-icons/ri";
import { FETCH_LOAN_FREQUENCY_SETTINGS } from "@/constants/query-keys";

const PERIOD_OPTIONS = [
  {
    id: 1,
    value: "annually",
    label: "Annually",
  },
  {
    id: 2,
    value: "semi-annually",
    label: "Semi-Annually",
  },
  {
    id: 3,
    value: "quarterly",
    label: "Quarterly",
  },
  {
    id: 4,
    value: "monthly",
    label: "Monthly",
  },
];

const schema = z.object({
  period: z
    .string({
      required_error: "Period is required",
    })
    .min(2, "Period is required"),
  frequency: z.string({ required_error: "Frequency is required" }).refine(
    (value) => {
      return !Number.isNaN(value) && Number(value) > 0;
    },
    { message: "Frequency is required" },
  ),
});

type FormFields = z.infer<typeof schema>;

const LoanFrequency = () => {
  const queryClient = useQueryClient();
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [period] = watch(["period"]);

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);

  const { data: loanFrequency, isLoading: isLoadingLoanFrequency } = useQuery({
    queryKey: [FETCH_LOAN_FREQUENCY_SETTINGS],
    queryFn: async () => {
      const data = await loanService.fetchLoanFrequency();
      return data?.payload?.data;
    },
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const response = await loanService.updateLoanFrequency(values);
      toast.success(response?.message);
      reset();
      queryClient.invalidateQueries({
        queryKey: [FETCH_LOAN_FREQUENCY_SETTINGS],
      });
    } catch (error: any) {
      setError("root", {
        type: "deps",
        message:
          error?.response?.data?.message ??
          error?.message ??
          "An error occurred",
      });
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    }
  };

  return (
    <Container>
      <PageTitle title="Loan Frequency" />
      <article className="mt-2 flex min-h-[10vh] items-center rounded-sm bg-gray-50 px-2 py-4">
        <>
          {isLoadingLoanFrequency ? (
            <ClipLoader size={16} color="#5b21b6" />
          ) : loanFrequency ? (
            <div className="w-full">
              <h3 className="mb-2 flex items-center gap-2 border-y-[0.5px] border-y-gray-400 py-1.5 text-sm font-semibold uppercase">
                <FaInfoCircle /> <span>Loan Frequency Setting:</span>{" "}
              </h3>
              <div className="flex flex-col gap-2">
                {loanFrequency?.map((loanFrequency) => (
                  <div
                    key={loanFrequency.id}
                    className="flex flex-col gap-1 pl-5"
                  >
                    <h4 className="text-sm">
                      <strong>Period: </strong> {loanFrequency.period}
                    </h4>
                    <h4 className="text-sm">
                      <strong>Frequency: </strong> {loanFrequency.frequency}
                    </h4>
                    <h4 className="text-sm">
                      <strong>Last Updated: </strong>{" "}
                      {formatDate(
                        loanFrequency.createdAt,
                        "dd-MM-yyyy hh:mm:ss a",
                      )}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      </article>
      <Card className="mt-2">
        <h3 className="mb-2 flex items-center gap-2 border-y-[0.5px] border-y-gray-400 py-1.5 text-sm font-semibold uppercase">
          <RiExpandDiagonalFill /> <span>Update Frequency Setting:</span>{" "}
        </h3>
        <div className="rounded-xs my-2 bg-gray-100 p-2">
          <p className="flex items-center gap-2 text-sm">
            <FaInfoCircle /> Control how many loans a customer can take within a
            predefined time interval.
          </p>
        </div>
        <form
          className="flex max-w-[500px] flex-col gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="col-span-full">
            <Label htmlFor="alertType" className="mb-1 font-semibold">
              Period
            </Label>
            <Select
              disabled={isSubmitting}
              value={period}
              onValueChange={async (value) => {
                setValue("period", value, { shouldValidate: true });
                await trigger("period");
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Loan Period: </SelectLabel>
                  {PERIOD_OPTIONS?.map((opt) => (
                    <SelectItem value={opt.value} key={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="mt-0.5 h-1 text-[10px] text-red-500">
              {errors?.period?.message}
            </p>
          </div>
          <div>
            <Input
              label="Frequency"
              {...register("frequency")}
              disabled={isSubmitting}
              error={errors?.frequency?.message}
              onChange={async (e) => {
                const value = e.target.value.replace(/\D/g, "");
                setValue("frequency", value);
                await trigger("frequency");
              }}
              placeholder="--"
            />
          </div>
          <p className="my-1 text-sm font-semibold text-red-600">
            {errors?.root?.message}
          </p>
          <Button className="max-w-[200px]">
            {isSubmitting ? (
              <>
                <ClipLoader size={12} color="#fff" /> <span>Loading...</span>
              </>
            ) : (
              "Update"
            )}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default LoanFrequency;
