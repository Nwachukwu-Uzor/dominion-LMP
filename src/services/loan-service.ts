import { baseUrl } from "@/config";
import {
  APIResponseType,
  LoanRepaymentType,
  LoanRequestType,
  PaginatedResponseType,
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
      }
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
      }
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
      }
    );
    return response?.data;
  }

  async getAllLoanRequests(stage: string, page = 1, size = 10) {
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
      }
    );
    return response.data;
  }

  async getRequestStats() {
    try {
      const LOAN_STAGES = {
        REVIEWER: "REVIEWER",
        SUPERVISOR: "SUPERVISOR",
        COMPLETED: "COMPLETED",
      };
      const data = {
        pendingReviewer:
          (await this.getAllLoanRequests(LOAN_STAGES.REVIEWER, 1, 1))?.payload
            ?.totalRecords ?? 0,
        pendingAuthorizer:
          (await this.getAllLoanRequests(LOAN_STAGES.SUPERVISOR, 1, 1))?.payload
            ?.totalRecords ?? 0,
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
    return response?.data?.payload;
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
      }
    );
    return response?.data;
  }
  async reviewLoanRequestSupervisor(payload: {
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
      }
    );
    return response?.data;
  }
}
