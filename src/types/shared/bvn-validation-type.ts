import { CustomerInfoType } from "./customer-info-type";

export type BVNType = {
  BVN: string;
  phoneNumber: string;
  FirstName: string;
  LastName: string;
  OtherNames: string;
  DOB: string;
};

export type MainOneDetailsType = {
  RequestStatus: boolean;
  ResponseMessage: string;
  isBvnValid: boolean;
  bvnDetails: BVNType;
};

export type BVNValidationType = {
  mainOneDetails: MainOneDetailsType;
  customerInfo: CustomerInfoType;
};
