import {
  Container,
  FullScreenLoader,
  PageTitle,
  Record,
} from "@/components/shared";
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
import { IoMdClose } from "react-icons/io";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";

const schema = z.object({
  IppisNumber: z
    .string({ required_error: "IPPIS Number is required" })
    .min(5, "IPPIS Number must be at least 5 characters"),
});

type FormFields = z.infer<typeof schema>;

const MODAL_TYPES = {
  DELETE_IPPIS_DATA: "DELETE_IPPIS_DATA",
};

const IPPISData = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const accountService = new AccountService(token);

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
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    }
  };

  const handleToggleModal = (modalType?: string) => {
    if (!modalType) {
      setOpenModal(false);
      setModalType("");
      return;
    }
    setModalType(modalType);
    setOpenModal(true);
  };


  const {isPending, mutate} = useMutation({
    mutationFn: async() => {
      const response = await accountService.clearIPPISRecord();
      toast.success(response?.message ?? "Records deleted successfully")
    }
  })

  return (
    <>
      <Container>
        <PageTitle title="IPPIS Data" />
        <Card className="mt-4">
          <div className="flex items-center justify-end gap-2">
            <Button
              className="bg-red-800"
              onClick={() => handleToggleModal(MODAL_TYPES.DELETE_IPPIS_DATA)}
            >
              Clear IPPIS Data
            </Button>
            <Link to="new-upload">
              <Button className="bg-black">New Upload</Button>
            </Link>
          </div>
          <h2 className="mb-6 font-semibold">Verify IPPIS Info</h2>
          <form
            className="flex flex-col gap-3 lg:flex-row lg:items-start"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex-1">
              <Input
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
            <Button className="min-w-[250px]">
              {isSubmitting ? <ClipLoader color="#fff" size={12} /> : "Search"}
            </Button>
          </form>
          <p className="my-0.5 h-1 text-[10px] text-red-500">
            {errors?.root?.message}
          </p>
          <article>
            {isSubmitting ? (
              <div className="flex h-[10vh] items-center justify-center">
                <ClipLoader color="#5b21b6" size={12} />
              </div>
            ) : IPPISInfo ? (
              <article>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <Record
                    header="IPPIS Number"
                    content={IPPISInfo?.ippisNumber}
                  />
                  <Record header="Full Name" content={IPPISInfo?.fullName} />
                  <Record
                    header="Employer Organization"
                    content={IPPISInfo?.employerOrganization}
                  />
                  <Record header="Staff ID" content={IPPISInfo?.staffId} />
                  <Record
                    header="Employment Status"
                    content={IPPISInfo?.employmentStatus}
                  />
                  <Record
                    header="Assignment Status"
                    content={IPPISInfo?.assignmentStatus}
                  />
                  <Record header="Hire Date" content={IPPISInfo?.hireDate} />
                  <Record header="Birth Date" content={IPPISInfo?.birthDate} />
                  <Record header="Job Title" content={IPPISInfo?.jobTitle} />
                  <Record header="Command" content={IPPISInfo?.command} />
                  <Record
                    header="Phone Number"
                    content={IPPISInfo?.phoneNumber}
                  />
                  <Record header="Bank Name" content={IPPISInfo?.bankName} />
                  <Record
                    header="Account Number"
                    content={IPPISInfo?.accountNumber}
                  />
                  <Record
                    header="Staff Category"
                    content={IPPISInfo?.staffCategory}
                  />
                  <Record
                    header="Employee Type"
                    content={IPPISInfo?.employeeType}
                  />
                  <Record
                    header="Net Pay"
                    content={formatCurrency(IPPISInfo?.netPay)}
                  />
                  <Record header="Period" content={IPPISInfo?.period} />

                  <Record header="Status" content={IPPISInfo?.status} />
                </div>
              </article>
            ) : null}
          </article>
        </Card>
      </Container>
      <Dialog open={openModal}>
        <DialogContent className="gap-0">
          <div className="flex justify-end">
            <button disabled={isSubmitting} onClick={() => handleToggleModal()}>
              <IoMdClose className="cursor-pointer transition-all hover:scale-150" />
            </button>
          </div>
          {modalType === MODAL_TYPES.DELETE_IPPIS_DATA ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold">
                Clear IPPIS Records
              </h3>
              <p className="text-sm font-light">
                Are you sure you want to clear IPPIS data?
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  className="min-w-[100px] bg-blue-800 text-white hover:bg-blue-700"
                  onClick={() => {
                    mutate()
                    handleToggleModal();
                  }}
                >
                  Yes
                </Button>
                <Button
                  className="min-w-[100px] bg-gray-500 text-white hover:bg-gray-400"
                  onClick={() => handleToggleModal()}
                >
                  No
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <FullScreenLoader loading={isPending} />
    </>
  );
};

export default IPPISData;
