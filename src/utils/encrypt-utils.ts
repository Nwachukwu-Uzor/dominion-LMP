import { TokenType } from "@/types/shared";
import { jwtDecode } from "jwt-decode";

export const decodeAuthToken = (token: string) => {
  const decoded = jwtDecode(token) as TokenType;
  return decoded;
};
