import { AccountType } from "./account-type";

export type PaginatedAccountResponseType = {
  currentPage: number;
  totalRecords: number;
  totalPages: number;
  nextPage: number;
  accountRecords: AccountType[];
};
