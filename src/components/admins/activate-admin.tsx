import { Dialog, DialogContent } from "../ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { IoMdClose } from "react-icons/io";
import { AdminType } from "@/types/shared";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaCheck } from "react-icons/fa";
import { FETCH_ALL_ADMINS, SESSION_STORAGE_KEY } from "@/constants";
import { AdminService } from "@/services";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { Label } from "../ui/label";
import { MultiSelect } from "../ui/multi-select";
import { useEffect, useState } from "react";

type Props = {
  openModal: boolean;
  onClose: () => void;
  admin?: AdminType | null;
};

const ADMIN_OPTIONS = [
  {
    id: 1,
    label: "Super Admin",
    value: "superAdmin",
  },
  {
    id: 2,
    label: "Admin",
    value: "admin",
  },
  {
    id: 3,
    label: "Supervisor",
    value: "SUPERVISOR",
  },
  {
    id: 2,
    label: "Reviewer",
    value: "REVIEWER",
  },
];

const schema = z.object({
  roleType: z.string({ required_error: "Role is required" }),
});

type FormFields = z.infer<typeof schema>;

export const ActivateAdmin = ({ openModal, onClose, admin }: Props) => {
  const {
    setError,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const adminService = new AdminService(token);

  useEffect(() => {
    if (!selectedRoles || !selectedRoles.length) {
      setValue("roleType", "");
    } else {
      setValue("roleType", selectedRoles.join(","));
      trigger("roleType");
    }
  }, [selectedRoles, setValue, trigger]);

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      if (!admin) {
        return;
      }

      const roles = values.roleType.split(",");
      let message = "";
      for (const roleType of roles) {
        const payload = {
          userID: admin.id,
          actionType: "active",
          requestType: "add",
          roleType,
        };
        const response = await adminService.updateAdminStatus(payload);
        message = response.message ?? "";
      }
      toast.success(message);
      queryClient.invalidateQueries({
        queryKey: [FETCH_ALL_ADMINS],
      });
      setSelectedRoles([]);
      onClose();
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
    <>
      <Dialog open={openModal}>
        <DialogContent className="gap-0">
          <div className="flex justify-end">
            <button disabled={isSubmitting}>
              <IoMdClose
                className="cursor-pointer hover:scale-150 transition-all"
                onClick={onClose}
              />
            </button>
          </div>
          <div className="h-10 w-10 lg:h-[60px] lg:w-[60px] bg-green-100 rounded-full mx-auto flex justify-center items-center">
            <FaCheck className="text-green-700 scale-150 text-xl lg:text-2xl" />
          </div>
          <h3 className="text-lg font-bold mt-5 text-center">
            Confirm Activation
          </h3>
          <p className="mt-[5px] text-center">
            Are you sure you want to activate{" "}
            <strong>{admin?.fullName ?? admin?.email}</strong>?
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-2.5">
              <Label className="mb-1.5 block text-sm font-semibold">
                State(s)
              </Label>

              <MultiSelect
                options={ADMIN_OPTIONS}
                selected={selectedRoles}
                onChange={setSelectedRoles}
                placeholder={
                  selectedRoles.length > 0
                    ? "Please select an account..."
                    : "No accounts to assign..."
                }
                disabled={isSubmitting}
              />
              <p className="h-1 mt-0.5 text-red-500 text-[10px]">
                {errors?.roleType?.message}
              </p>
            </div>
            <p className="h-1 mt-0.5 text-red-500 text-[10px]">
              {errors?.root?.message}
            </p>
            <Button
              className="bg-green-600 w-full text-white mt-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ClipLoader size={12} color="#fff" /> <span>Loading...</span>
                </>
              ) : (
                "Yes"
              )}
            </Button>
            <Button
              className="bg-[#2D2D2D] text-white mt-0 lg:mt-4 w-full"
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
            >
              No, Cancel
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
