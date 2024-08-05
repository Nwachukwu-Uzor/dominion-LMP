import { SESSION_STORAGE_KEY } from "@/constants";
import { decodeAuthToken } from "@/utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useRoleAccess = (role: string) => {
  const navigate = useNavigate();
  useEffect(() => {
    const dataFromSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!dataFromSession) {
      toast.error("Authorized, please login", {
        toastId: "unauthorized-toast-3338",
      });
      navigate("/auth/login");
      return;
    }
    const user = decodeAuthToken(dataFromSession);
    const transformedRoles = user.role.map((role) => role.toUpperCase());
    if (transformedRoles.includes(role.toUpperCase())) {
      return;
    }
    toast.warn("You do not have permission to access this page.", {
      toastId: "no-permission-33292",
    });
    navigate("/");
  }, [navigate, role]);
};
