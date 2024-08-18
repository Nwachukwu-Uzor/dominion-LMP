import { baseUrl } from "@/config";
import {
  APIResponseType,
  LoanFrequencyType,
  LoanRepaymentType,
  LoanRequestType,
  PaginatedResponseType,
  UnCompletedLoanRequestType,
} from "@/types/shared";
import axios from "axios";

export class LoanService {
  private _token?: string | null;

  constructor(token?: string | null) {
    this._token = token;
  }

  async uploadRepayment(data: FormData) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/account/loan/repayment`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response?.data;
  }
  async uploadIPPISRecord(data: FormData) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/IPPIS/bulkCreate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response?.data;
  }

  async getAllLoanRepayments(page = 1, size = 10) {
    const response = await axios.get<
      APIResponseType<
        PaginatedResponseType & { loanRepaymentRecords: LoanRepaymentType[] }
      >
    >(`${baseUrl}/account/view/all/loan/repayment?size=${size}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response?.data;
  }

  async getLoanRepaymentsByLoanId(loanId: string, page = 1, size = 10) {
    const response = await axios.get<
      APIResponseType<
        PaginatedResponseType & { accountRecords: LoanRepaymentType[] }
      >
    >(
      `${baseUrl}/account/view/all/filter/loan/repayment?size=${size}&page=${page}&option=loanloanId&gSearch=${loanId}`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }
  async getLoanRepaymentsByUploadId(uploadId: string, page = 1, size = 10) {
    const response = await axios.get<
      APIResponseType<
        PaginatedResponseType & { accountRecords: LoanRepaymentType[] }
      >
    >(
      `${baseUrl}/account/view/all/filter/loan/repayment?size=${size}&page=${page}&option=UploadedFileID&gSearch=${uploadId}`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }

  async getAllLoanRequests(stage: string, page = 1, size = 10) {
    try {
      const response = await axios.get<
        APIResponseType<
          PaginatedResponseType & { accountRecords: LoanRequestType[] }
        >
      >(
        `${baseUrl}/account/view/all?size=${size}&page=${page}&option=stage&gSearch=${stage}`,
        {
          headers: {
            Authorization: `Bearer ${this._token}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.log({ error });

      return {
        payload: {
          totalRecords: 0,
        },
      };
    }
  }

  async getLoanRequestForStage(stage: string, page = 1, size = 10) {
    try {
      const response = await axios.get<
        APIResponseType<
          PaginatedResponseType & {
            requestRecords: UnCompletedLoanRequestType[];
          }
        >
      >(
        `${baseUrl}/account/view/all/request?size=${size}&page=${page}&option=stage&gSearch=${stage}`,
        {
          headers: {
            Authorization: `Bearer ${this._token}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      return {
        payload: {
          totalRecords: 0,
          requestRecords: [],
          totalPages: 0,
        },
      };
    }
  }

  async getRequestStats() {
    try {
      const LOAN_STAGES = {
        REVIEWER: "REVIEWER",
        AUTHORIZER: "AUTHORIZER",
        COMPLETED: "COMPLETED",
      };
      const data = {
        pendingReviewer:
          (await this.getLoanRequestForStage(LOAN_STAGES.REVIEWER, 1, 1))
            ?.payload?.totalRecords ?? 0,
        pendingAuthorizer:
          (await this.getLoanRequestForStage(LOAN_STAGES.AUTHORIZER, 1, 1))
            ?.payload?.totalRecords ?? 0,
        completed:
          (await this.getAllLoanRequests(LOAN_STAGES.COMPLETED, 1, 1))?.payload
            ?.totalRecords ?? 0,
      };

      return data;
    } catch (_err: unknown) {
      return {
        pendingReviewer: 0,
        pendingAuthorizer: 0,
        completed: 0,
      };
    }
  }

  async getLoanRequestById(requestId: string) {
    const response = await axios.get<
      APIResponseType<{ accountRecords: LoanRequestType }>
    >(`${baseUrl}/account/view/single/${requestId}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    if (!response?.data?.payload?.accountRecords) {
      throw new Error(response?.data?.message);
    }

    return response?.data?.payload;
  }

  async validateOtp(payload: { userCode: string; token: string }) {
    const response = await axios.post<APIResponseType<any>>(
      `${baseUrl}/otp/validate`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }

  async reviewLoanRequest(payload: {
    approved: string;
    note: string;
    requestId: string;
    reviewerUserId: string;
  }) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/account/review/customer/account`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }
  async reviewLoanRequestAuthorizer(payload: {
    approved: string;
    note: string;
    requestId: string;
    approvalUserId: string;
  }) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/account/approve/reject/customer/account`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }

  async updateLoanFrequency(payload: { period: string; frequency: string }) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/eligibility/add`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }

  async fetchLoanFrequency() {
    const response = await axios.get<
      APIResponseType<PaginatedResponseType & { data: LoanFrequencyType[] }>
    >(
      `${baseUrl}/eligibility/view/all?size=10&page=1&sort=ASC&orderBy=createdAt&gSearch=active&option=status`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      },
    );
    return response?.data;
  }
}
