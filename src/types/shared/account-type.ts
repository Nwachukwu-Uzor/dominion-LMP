import { AccountLoanType } from "./account-loan-type";
import { ProfileType } from "./profile-type";

export type AccountType = {
  id: string;
  TransactionTrackingRef: string;
  BVN: string;
  AccountOpeningTrackingRef: string;
  ProductCode: string;
  customerNumber?: string;
  accountNumber?: string;
  accountStatus: string;
  accountMessage: string;
  status: string;
  HasSufficientInfoOnAccountInfo: boolean;
  AccountInformationSource: number;
  OtherAccountInformationSource: string;
  AccountOfficerCode: string;
  AccountOfficerEmail: string;
  NotificationPreference: string;
  TransactionPermission: string;
  AccountTier: number;
  stageStatus: string;
  reviewerUserId?: string;
  supervisorUserId?: string;
  stage: string;
  rejectionReason?: string;
  reviewerRecommendation?: string;
  supervisorRecommendation?: string;
  supervisorNote?: string;
  reviewerNote?: string;
  loantype: string;
  approved?: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileType,
  accountLoans?: AccountLoanType[]
};
