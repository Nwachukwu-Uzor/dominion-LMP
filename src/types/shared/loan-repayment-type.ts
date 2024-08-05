export type LoanRepaymentType = {
  employeeName: string;
  serviceNumber: string;
  ippisNo: string;
  pencomID: string;
  accountId: number;
  bankCode: number;
  amount: number;
  deductionBeneficiary: string;
  elementName: string;
  nhfNumber: string;
  narration: string;
  loanloanId: string;
  createdAt?: string;
  createdBy?: string;
  UploadedFileID?: string;
  createdByProfile?: {
    username: string;
    fullName: string;
    id: string;
  };
};
