import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { IoMdClose } from "react-icons/io";
import { FaExclamation } from "react-icons/fa6";
import { AdminType } from "@/types/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { AdminService } from "@/services";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { FETCH_ALL_ADMINS } from "@/constants/query-keys";

type Props = {
  openModal: boolean;
  onClose: () => void;
  admin?: AdminType | null;
};

export const DisableAdmin = ({ openModal, onClose, admin }: Props) => {
  const queryClient = useQueryClient();

  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const adminService = new AdminService(token);

  const { isPending, mutate, isError, error } = useMutation({
    mutationFn: async () => {
      if (!admin) {
        return;
      }
      let roles: string[] = [];

      if (typeof admin.role === "string") {
        roles = admin?.role?.split(",");
      } else {
        roles = admin?.role;
      }
      let message = "";
      for (const roleType of roles) {
        const payload = {
          userID: admin.id,
          actionType: "disabled",
          requestType: "remove",
          roleType,
        };
        const response = await adminService.updateAdminStatus(payload);
        message = response.message ?? "";
      }

      toast.success(message);
      queryClient.resetQueries({
        queryKey: [FETCH_ALL_ADMINS],
      });
      onClose();
    },
  });

  return (
    <>
      <Dialog open={openModal}>
        <DialogContent className="gap-0">
          <div className="flex justify-end">
            <button disabled={isPending}>
              <IoMdClose
                className="cursor-pointer transition-all hover:scale-150"
                onClick={onClose}
              />
            </button>
          </div>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 lg:h-[60px] lg:w-[60px]">
            <FaExclamation className="scale-150 text-xl text-red-700 lg:text-2xl" />
          </div>
          <h3 className="mt-5 text-center text-lg font-bold">
            Confirm Deactivation
          </h3>
          <p className="mt-[5px] text-center">
            Are you sure you want to deactivate{" "}
            <strong>{admin?.fullName ?? admin?.email}</strong>?
          </p>

          <p className="my-1 h-1 text-xs text-red-500">
            {(isError && (error as any)?.response?.data?.message) ??
              error?.message ??
              "An error occurred"}
          </p>

          <Button
            className="mt-8 bg-red-500 text-white lg:mt-4"
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <ClipLoader size={12} color="#fff" /> <span>Loading...</span>
              </>
            ) : (
              "Yes"
            )}
          </Button>
          <Button
            className="mt-0 bg-[#2D2D2D] text-white lg:mt-4"
            onClick={onClose}
            disabled={isPending}
          >
            No, Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
