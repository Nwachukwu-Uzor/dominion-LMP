import { baseUrl } from "@/config";
import { APIResponseType } from "@/types/shared";
import axios from "axios";

export class SettingsService {
  private _token?: string | null;

  constructor(token?: string | null) {
    this._token = token;
  }

  async getLinkStatus() {
    const response = await axios.get<APIResponseType<{ linkStatus: string }>>(
      `${baseUrl}/setting/view/current/status`,
    );
    return response?.data?.payload;
  }

  async updateLoanApplicationLink(payload: { status: string }) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/setting/link/status`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }
}
