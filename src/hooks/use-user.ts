import { useEffect, useState } from "react";
import { TokenType } from "@/types/shared";
import { SESSION_STORAGE_KEY, WHITE_LISTED_PATHS } from "@/constants";
import { useLocation, useNavigate } from "react-router-dom";
import { decodeAuthToken } from "@/utils/";

export const useUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<TokenType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (
      WHITE_LISTED_PATHS.map((url) => url.toUpperCase()).includes(
        location.pathname.toUpperCase(),
      )
    ) {
      return;
    }
    const dataFromSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!dataFromSession) {
      navigate("/auth/login");
      return;
    }
    const user = decodeAuthToken(dataFromSession);
    setUser(user);
    setIsLoading(false);
  }, [navigate]);

  return { user, isLoading };
};
