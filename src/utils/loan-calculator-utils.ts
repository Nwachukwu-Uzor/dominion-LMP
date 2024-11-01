const POLICE_INTEREST_RATE = 4.5;
const OTHERS_INTEREST_RATE = 5.0;
const NIGERIAN_POLICE_FORCE = "NIGERIAN POLICE FORCE";

const calculateLoan = (
  loanAmount: number,
  interestRate: number,
  tenureInMonths: number,
) => {
  try {
    if (!loanAmount || !interestRate || !tenureInMonths) {
      return {
        monthlyInstallment: "0",
        totalRepayment: "0",
        InterestRate: 0
      };
    }
    const PERCENTAGE_TO_DECIMAL = 100.0;
    const interestRateDecimal = interestRate / PERCENTAGE_TO_DECIMAL;
    const monthlyInstallment =
      (loanAmount / tenureInMonths) *
      (1 + interestRateDecimal * tenureInMonths);

    return {
      monthlyInstallment: monthlyInstallment.toFixed(2),
      totalRepayment: (monthlyInstallment * tenureInMonths).toFixed(2),
      InterestRate: interestRate
    };
  } catch (error) {
    return {
      monthlyInstallment: "0",
      totalRepayment: "0",
      InterestRate: 0
    };
  }
};

export const calculateLoanForOrganization = (
  organizationName: string,
  loanAmount: number,
  tenureInMonths: number,
) => {
  if (organizationName.toUpperCase() === NIGERIAN_POLICE_FORCE) {
    return calculateLoan(loanAmount, POLICE_INTEREST_RATE, tenureInMonths);
  }
  return calculateLoan(loanAmount, OTHERS_INTEREST_RATE, tenureInMonths);
};
