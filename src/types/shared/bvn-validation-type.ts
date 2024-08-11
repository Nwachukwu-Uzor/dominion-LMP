export type BVNType = {
  BVN: string;
  phoneNumber: string;
  FirstName: string;
  LastName: string;
  OtherNames: string;
  DOB: string;
};

export type BVNValidationType = {
  RequestStatus: boolean;
  ResponseMessage: string;
  isBvnValid: boolean;
  bvnDetails: BVNType;
};
