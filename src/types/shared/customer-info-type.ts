import { LoanType } from "./loan-type"

export interface CustomerInfoType {
    id: string
    profileId: string
    LastName: string
    FirstName: string
    BVN: string
    PhoneNo: string
    alternatePhoneNo: string
    title: string
    Gender: string
    PlaceOfBirth: string
    DateOfBirth: string
    Address: string
    NationalIdentityNo: string
    NextOfKinPhoneNo: string
    NextOfKinName: string
    ReferralPhoneNo?: string
    ReferralName?: string
    Email: string
    workIdentification: string
    loanAgreement: string
    organizationEmployer: string
    ippisNumber: string
    loanTenor: string
    loanAmount: string
    state: string
    language?: string
    createdAt: string
    updatedAt: string
    accountInfo: AccountInfoType[]
  }
  
  export interface AccountInfoType {
    id: string
    TransactionTrackingRef: string
    BVN: string
    AccountOpeningTrackingRef: string
    ProductCode: string
    customerNumber: string
    accountNumber: string
    accountStatus: string
    accountMessage?: string
    status: string
    HasSufficientInfoOnAccountInfo: boolean
    AccountInformationSource: number
    OtherAccountInformationSource: string
    AccountOfficerCode: string
    AccountOfficerEmail: string
    NotificationPreference: string
    TransactionPermission: string
    AccountTier: number
    stageStatus: string
    reviewerUserId: string
    supervisorUserId: string
    stage: string
    rejectionReason: string
    reviewerRecommendation: string
    supervisorRecommendation: string
    supervisorNote: string
    reviewerNote: string
    approved: string
    createdAt: string
    updatedAt: string
    accountLoans: LoanType[]
  }