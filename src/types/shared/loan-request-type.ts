import { AccountType } from "./account-type";
import { ProfileType } from "./profile-type";

type CustomerDetailsType = {
  id: string;
  profileId: string;
  LastName: string;
  FirstName: string;
  BVN: string;
  PhoneNo: string;
  alternatePhoneNo: string;
  title: string;
  Gender: string;
  DateOfBirth: string;
  Address: string;
  NationalIdentityNo: string;
  NextOfKinPhoneNo: string;
  NextOfKinName: string;
  ReferralPhoneNo: string | null;
  ReferralName: string | null;
  Email: string;
  loanAgreement: string;
  organizationEmployer: string;
  ippisNumber: string;
  loanTenor: string;
  loanAmount: string;
  state: string;
  language: string | null;
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
};
