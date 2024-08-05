import { baseUrl } from "@/config";
import { APIResponseType, AdminType } from "@/types/shared";
import axios from "axios";

type FetchAdminPaginatedType = {
  currentPage: number;
  totalPages: number;
  currentRecords: number;
  total: number;
  staffRecords: AdminType[];
};

export class AdminService {
  private _token?: string | null;

  constructor(token?: string | null) {
    this._token = token;
  }

  async getAdmins(config?: Record<string, string | number>) {
    let temp = "";
    if (config) {
      temp = Object.keys(config)
        .reduce((initial, current) => {
          let val = initial;
          if (current in config) {
            val = val + `${current}=${config[current]}&`;
          }
          return val;
        }, "?sort=ASC&orderBy=createdAt&")
        .slice(0, -1);
    }

    const response = await axios.get<APIResponseType<FetchAdminPaginatedType>>(
      `${baseUrl}/user/view/all${temp}`,
      { headers: { Authorization: `Bearer ${this._token}` } }
    );
    return response?.data;
  }

  async updateAdminStatus(data: {
    userID: string | number;
    actionType: string;
  }) {
    const response = await axios.post<APIResponseType<null>>(
      `${baseUrl}/user/approve/declined/account`,
      data,
      { headers: { Authorization: `Bearer ${this._token}` } }
    );

    return response.data;
  }
}
