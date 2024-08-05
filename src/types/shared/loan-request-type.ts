import { ProfileType } from "./profile-type";

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
  stageStatus: string
  reviewerUserId?: string;
  supervisorUserId?: string;
  stage: string;
  rejectionReason?: string;
  reviewerRecommendation?: string;
  supervisorRecommendation?: string;
  supervisorNote?: string;
  reviewerNote?: string;
  approved?: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileType
};
