export type IPPISInfoType = {
  staffId: string;
  fullName: string;
  employmentStatus: string;
  assignmentStatus: string;
  hireDate: string;
  birthDate: string;
  jobTitle: string;
  telephoneNumber: string;
  command: string;
  bankName: string;
  accountNumber: string;
  staffCategory: string;
  employmentType: string;
  netPay: string;
  period: string;
};

export type IPPISResponseType = {
  id: string;
  staffId: string;
  ippisNumber: string;
  fullName: string;
  employmentStatus: string;
  assignmentStatus: string;
  hireDate: string;
  birthDate: string;
  jobTitle: string;
  command: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  staffCategory: string;
  employeeType: string;
  netPay: string;
  period: string;
  UploadedFileID: string;
  documentUploadPath: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  employerOrganization: string;
};
