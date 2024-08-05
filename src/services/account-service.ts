import { baseUrl } from "@/config";
import {
  AccountType,
  APIResponseType,
  CustomerType,
  PaginatedAccountResponseType,
  PaginatedResponseType,
} from "@/types/shared";
import axios from "axios";

export class AccountService {
  private _token?: string | null;

  constructor(token?: string | null) {
    this._token = token;
  }

  async getAccounts(page = 1, size = 10) {
    const response = await axios.get<
      APIResponseType<PaginatedAccountResponseType>
    >(
      `${baseUrl}/account/view/all?size=${size}&page=${page}&option=status&gSearch=COMPLETED`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response.data;
  }
  async getCustomers(page = 1, size = 10) {
    const response = await axios.get<
      APIResponseType<PaginatedResponseType & { accountRecords: CustomerType[] }>
    >(
      `${baseUrl}/account/view/all/customer?size=${size}&page=${page}&option=status&gSearch=COMPLETED`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response.data;
  }

  async getAccountByCustomerId(customerId: string) {
    const response = await axios.get<
      APIResponseType<{ accountRecords: AccountType }>
    >(`${baseUrl}/account/view/single/${customerId}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response?.data?.payload;
  }

  async createAccountRequest(data: Record<string, unknown>) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/account/new/customer/account`,
      data
    );
    return response?.data;
  }
}
