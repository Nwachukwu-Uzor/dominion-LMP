import { AccountType } from "./account-type";
import { ProfileType } from "./profile-type";

type AccountLoanRequestType = {
  id: string;
  loanAccountId: string;
  BVN: string;
  TransactionTrackingRef: string;
  createAccountTrackingReference: string;
  LoanProductCode: string;
  CustomerID?: string;
  LinkedAccountNumber?: string;
  CollateralDetails: string;
  CollateralType: string;
  ComputationMode: string;
  Tenure: string;
  Moratorium: string;
  InterestAccrualCommencementDate: string;
  monthlyPayment: string;
  totalPayment: string;
  oldAmount: string;
  Amount: string;
  approvedAmount: string;
  rePaymentAmount: string;
  paidAmount?: string;
  totalRepaymentAmount?: string;
  totalLoanAmountPaidPercent?: string;
  outStandingLoanAmount?: string;
  InterestRate: string;
  PrincipalPaymentFrequency: string;
  InterestPaymentFrequency: string;
  loanAccountStatus: string;
  accountMessage: string;
  stageStatus: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerDetailsType = {
  id: string;
  profileId: string;
  LastName: string;
  FirstName: string;
  OtherName?: string;
  BVN: string;
  ProductCode?: string;
  PhoneNo: string;
  alternatePhoneNo: string;
  title: string;
  Gender: string;
  PlaceOfBirth?: any;
  DateOfBirth: string;
  Address: string;
  NationalIdentityNo: string;
  NextOfKinPhoneNo: string;
  NextOfKinName: string;
  ReferralPhoneNo: string | null;
  ReferralName: string | null;
  Email: string;
  NotificationPreference?: string;
  CustomerImage?: string;
  CustomerSignature?: string;
  IdentificationImage?: any;
  workIdentification?: string;
  otherDocument?: any;
  otherDocuments?: any[];
  loanAgreement: string;
  organizationEmployer: string;
  ippisNumber: string;
  loanTenor: string;
  loanAmount: string;
  state: string;
  loanType?: string;
  language: string | null;
  salaryAccountNumber: string;
  bankName: string;
  createdAt: string;
  updatedAt: string;
};

export type LoanRequestType = {
  id: string;
  TransactionTrackingRef: string;
  AccountOpeningTrackingRef: string;
  ProductCode: string;
  accountMessage: string;
  status: string;
  AccountOfficerCode: string;
  AccountOfficerEmail: string;
  NotificationPreference: string;
  TransactionPermission: string;
  AccountTier: number;
  stageStatus: string;
  reviewerUserId?: string;
  authorizerUserId?: string;
  stage: string;
  rejectionReason?: string;
  reviewerRecommendation?: string;
  authorizerRecommendation?: string;
  authorizerNote?: string;
  reviewerNote?: string;
  approved?: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileType;
  accountLoansRequest: AccountLoanRequestType[];
};

export type UnCompletedLoanRequestType = {
  id: string;
  profileId: string;
  TransactionTrackingRef: string;
  stageStatus: string;
  stage: string;
  reviewerUserId: string | null;
  authorizerUserId: string | null;
  rejectionReason: string | null;
  reviewerRecommendation: string | null;
  authorizerRecommendation: string | null;
  authorizerNote: string | null;
  reviewerNote: string | null;
  createdAt: string;
  updatedAt: string;
  customerDetails: CustomerDetailsType;
  accountDetails: AccountType;
  loanAccountDetails: AccountLoanRequestType;
  loanAccountId: string;
  supervisorUserId?: string;
  supervisorRecommendation?: string;
  supervisorNote?: string;
};
