import { APIResponseType } from "@/types/shared";
import axios from "axios";
import { baseUrl } from "@/config";

export class AuthService {
  async signup(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/user/register`,
      data
    );
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/user/login`,
      data
    );
    return response.data;
  }
}
