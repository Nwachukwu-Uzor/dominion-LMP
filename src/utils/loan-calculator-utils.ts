const LOAN_CONFIG_BY_PREFIX = {
  PF: {
    interestRate: 5,
    cutOffPercentage: 0.33,
  },
  OTHERS: {
    interestRate: 5,
    cutOffPercentage: 0.32,
  },
};

const calculateLoan = (
  loanAmount: number,
  interestRate: number,
  tenureInMonths: number,
  netPay: number,
  cutOffPercentage: number,
) => {
  try {
    if (!loanAmount || !interestRate || !tenureInMonths || !netPay) {
      return {
        monthlyInstallment: "0",
        totalRepayment: "0",
        InterestRate: 0,
        eligibleAmount: "0",
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
      InterestRate: interestRate,
      eligibleAmount: calculateEligibleAmount(
        netPay,
        tenureInMonths,
        interestRate,
        cutOffPercentage
      ).toFixed(2),
    };
  } catch (error) {
    return {
      monthlyInstallment: "0",
      totalRepayment: "0",
      InterestRate: 0,
      eligibleAmount: "0",
    };
  }
};

export const calculateLoanForOrganizationForIppisPrefix = (
  ippisNumber: string,
  loanAmount: number,
  tenureInMonths: number,
  netPay: number,
) => {
  const interestInfo = getInterestRateByOrganizationUsingIppisPrefix(ippisNumber)
  return calculateLoan(
    loanAmount,
    interestInfo.interestRate,
    tenureInMonths,
    netPay,
    interestInfo.cutOffPercentage
  );
};

export const calculateEligibleAmount = (
  netPay: number,
  tenor: number,
  interestRate: number,
  cutOffPercentage: number,
): number => {
  const numerator = netPay * cutOffPercentage * tenor;
  const interestRateInDecimal = interestRate / 100;
  const denominator = 1 + interestRateInDecimal * tenor;
  const result = numerator / denominator;

  const roundedResult = Math.floor(result / 1000) * 1000;

  return roundedResult;
};

const getInterestRateByOrganizationUsingIppisPrefix = (ippisNumber: string) => {
  const matches = ippisNumber.match(/^[A-Za-z]+/);
  const prefix = matches ? matches[0] : "";
  const POLICE_FORCE_PREFIX = "PF";

  if (prefix?.toUpperCase() === POLICE_FORCE_PREFIX) {
    return LOAN_CONFIG_BY_PREFIX.PF;
  }
  return LOAN_CONFIG_BY_PREFIX.OTHERS;
};

export const calculateEligibleAmountByOrganizationUsingIppisPrefix = (
  netPay: number,
  tenor: number,
  ippisNumber: string,
) => {
  const interestRate =
    getInterestRateByOrganizationUsingIppisPrefix(ippisNumber);
  return calculateEligibleAmount(netPay, tenor, interestRate.interestRate, interestRate.cutOffPercentage);
};

export const getLoanRepaymentInfo = (
  loanAmount: number,
  loanTenorInMonths: number,
  organizationName: string,
) => {

  if (
    !loanAmount ||
    !loanTenorInMonths ||
    Number.isNaN(loanAmount) ||
    Number.isNaN(loanTenorInMonths)
  ) {
    return {
      totalRepayment: "0",
      monthlyRepayment: "0",
      interestRate: 0,
    };
  }

  const interestInfo =
    getInterestRateByOrganizationUsingIppisPrefix(organizationName);
  const interestRateInDecimal = interestInfo.interestRate / 100;

  const monthlyRepayment =
    ((1 + interestRateInDecimal * loanTenorInMonths) * loanAmount) /
    loanTenorInMonths;
  return {
    totalRepayment: (monthlyRepayment * loanTenorInMonths).toFixed(2),
    monthlyRepayment: monthlyRepayment.toFixed(2),
    interestRate: interestInfo.interestRate,
  };
};
