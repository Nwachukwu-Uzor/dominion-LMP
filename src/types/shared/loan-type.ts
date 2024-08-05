export type LoanType = {
  id: string | number;
  amount: number;
  customerName: string;
  tenure: number;
  requestDate: string;
  startDate: string;
  nextPaymentDate: string;
  customerAccountNumber: string;
  interestRate: number;
  totalPayment: number;
};
