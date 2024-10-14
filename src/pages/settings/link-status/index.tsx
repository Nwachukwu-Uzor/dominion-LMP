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
import {
  LINK_STATUS_UPDATE_TYPE,
  LINK_STATUS_UPDATE_VALUE,
  SESSION_STORAGE_KEY,
  USER_ROLES,
} from "@/constants";
import { LoanService } from "@/services";
import { ClipLoader } from "react-spinners";
import { FaInfoCircle } from "react-icons/fa";
import { RiExpandDiagonalFill } from "react-icons/ri";
import { useUser } from "@/hooks";

const schema = z.object({
  type: z
    .string({
      required_error: "Type is required",
    })
    .min(2, "Type is required"),
  status: z
    .string({
      required_error: "Status is required",
    })
    .min(2, "Status is required"),
});

type FormFields = z.infer<typeof schema>;

const LinkStatus = () => {
  const {
    setError,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "USER",
    },
  });

  const { user } = useUser();

  const [type, status] = watch(["type", "status"]);

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const loanService = new LoanService(token);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const response = await loanService.updateLoanApplicationLink(values);
      toast.success(response?.message);
      reset();
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

      <Card className="mt-2">
        <h3 className="mb-2 flex items-center gap-2 border-y-[0.5px] border-y-gray-400 py-1.5 text-sm font-semibold uppercase">
          <RiExpandDiagonalFill /> <span>Update Loan Request Link Status:</span>{" "}
        </h3>
        <div className="rounded-xs my-2 bg-gray-100 p-2">
          <p className="flex items-center gap-2 text-sm">
            <FaInfoCircle /> Control whether your loan application link will be
            visible.
          </p>
        </div>
        <form
          className="flex max-w-[500px] flex-col gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          {user &&
          user.role
            .map((role) => role.toUpperCase())
            .includes(USER_ROLES.SUPER_ADMIN.toUpperCase()) ? (
            <div className="col-span-full">
              <Label htmlFor="alertType" className="mb-1 font-semibold">
                Update Type
              </Label>
              <Select
                disabled={isSubmitting}
                value={type}
                onValueChange={async (value) => {
                  setValue("type", value, { shouldValidate: true });
                  await trigger("type");
                }}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Update Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Update Type: </SelectLabel>
                    {LINK_STATUS_UPDATE_TYPE?.map((opt) => (
                      <SelectItem value={opt.value} key={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="mt-0.5 h-1 text-[10px] text-red-500">
                {errors?.type?.message}
              </p>
            </div>
          ) : null}
          <div className="col-span-full">
            <Label htmlFor="alertType" className="mb-1 font-semibold">
              Status:
            </Label>
            <Select
              disabled={isSubmitting}
              value={status}
              onValueChange={async (value) => {
                setValue("status", value, { shouldValidate: true });
                await trigger("status");
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status: </SelectLabel>
                  {LINK_STATUS_UPDATE_VALUE?.map((opt) => (
                    <SelectItem value={opt.value} key={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="mt-0.5 h-1 text-[10px] text-red-500">
              {errors?.status?.message}
            </p>
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

export default LinkStatus;
