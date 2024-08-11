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

const INTERVAL_OPTIONS = [
  {
    id: 1,
    value: "Annual",
    label: "Annual",
  },
  {
    id: 2,
    value: "Bi-Annual",
    label: "Bi-Annual",
  },
  {
    id: 3,
    value: "Quarterly",
    label: "Quarterly",
  },
  {
    id: 4,
    value: "Monthly",
    label: "Monthly",
  },
];

const schema = z.object({
  interval: z
    .string({
      required_error: "Interval is required",
    })
    .min(2, "Interval is required"),
  loanCount: z.string({ required_error: "Loan count is required" }).refine(
    (value) => {
      return !Number.isNaN(value) && Number(value) > 0;
    },
    { message: "Loan is required" }
  ),
});

type FormFields = z.infer<typeof schema>;

const LoanFrequency = () => {
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [interval] = watch(["interval"]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      console.log({ values });
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
      <PageTitle title="Loan Frequency" />
      <Card className="mt-2">
        <p className="mb-3 text-sm">Update Loan Frequency</p>
        <form
          className="max-w-[500px] flex flex-col gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="col-span-full">
            <Label htmlFor="alertType" className="mb-1 font-semibold">
              Interval
            </Label>
            <Select
              value={interval}
              onValueChange={async (value) => {
                setValue("interval", value, { shouldValidate: true });
                await trigger("interval");
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Loan Interval: </SelectLabel>
                  {INTERVAL_OPTIONS?.map((opt) => (
                    <SelectItem value={opt.value} key={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="h-1 mt-0.5 text-red-500 text-[10px]">
              {errors?.interval?.message}
            </p>
          </div>
          <div>
            <Input
              label="Loan Count"
              {...register("loanCount")}
              error={errors?.loanCount?.message}
              onChange={async (e) => {
                const value = e.target.value.replace(/\D/g, "");
                setValue("loanCount", value);
                await trigger("loanCount");
              }}
              placeholder="--"
            />
          </div>
          <Button className="max-w-[200px]">Update</Button>
        </form>
      </Card>
    </Container>
  );
};

export default LoanFrequency;
