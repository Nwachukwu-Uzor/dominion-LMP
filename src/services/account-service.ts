import { baseUrl } from "@/config";
import {
  AccountType,
  APIResponseType,
  BVNValidationType,
  CustomerType,
  IPPISResponseType,
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
    try {
      const response = await axios.get<
        APIResponseType<PaginatedAccountResponseType>
      >(
        `${baseUrl}/account/view/all?size=${size}&page=${page}&option=status&gSearch=COMPLETED`,
        {
          headers: {
            Authorization: `Bearer ${this._token}`,
          },
        },
      );
      return response.data;
    } catch (_error: unknown) {
      return {
        payload: {
          totalRecords: 0,
          accountRecords: [],
          totalPages: 0,
        },
      };
    }
  }
  async getCustomers(page = 1, size = 10) {
    try {
      const response = await axios.get<
        APIResponseType<
          PaginatedResponseType & { accountRecords: CustomerType[] }
        >
      >(
        `${baseUrl}/account/view/all/customer?size=${size}&page=${page}&option=status&gSearch=COMPLETED`,
        {
          headers: {
            Authorization: `Bearer ${this._token}`,
          },
        },
      );
      return response.data;
    } catch (_error: unknown) {
      return {
        payload: {
          totalRecords: 0,
          accountRecords: [],
          totalPages: 0,
        },
      };
    }
  }

  async getAccountByCustomerId(customerId: string) {
    const response = await axios.get<
      APIResponseType<{ accountRecords: AccountType }>
    >(`${baseUrl}/account/view/single/${customerId}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    if (!response?.data?.payload?.accountRecords) {
      throw new Error(response?.data?.message);
    }

    return response?.data?.payload;
  }

  async createAccountRequest(data: Record<string, unknown>) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/account/new/customer/account`,
      data,
    );
    return response?.data;
  }
  async editLoanRequest(data: Record<string, unknown>) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/account/modify/customer/account`,
      data,
    );
    return response?.data;
  }

  async validateBVN(data: { id: string }) {
    const response = await axios.post<APIResponseType<BVNValidationType>>(
      `${baseUrl}/bankOne/bvn/validate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }

  async validateIPPISNumber(data: { IppisNumber: string }) {
    const response = await axios.post<APIResponseType<IPPISResponseType>>(
      `${baseUrl}/IPPIS/view/single`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    if (!response?.data?.payload?.fullName) {
      throw new Error(response?.data?.message);
    }
    return response?.data;
  }

  async editCustomerInfo(data: {
    CustomerID: string;
    LastName: string;
    FirstName: string;
    OtherNames?: string;
    City?: string;
    Address: string;
    Gender: string;
    DateOfBirth: string;
    PhoneNo: string;
    NationalIdentityNo?: string;
    NextOfKinFirstName: string;
    NextOfKinLastName: string;
    NextOfKinPhoneNumber: string;
    ReferralName?: string;
    ReferralPhoneNo?: string;
    Email: string;
    BVN: string;
    AccountOfficerEmail: string;
    AccountOfficerCode: string;
  }) {
    const response = await axios.put<APIResponseType<string>>(
      `${baseUrl}/account/update/customer/account`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }
}
