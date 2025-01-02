const POLICE_INTEREST_RATE = 4.5;
const OTHERS_INTEREST_RATE = 5.0;
const NIGERIAN_POLICE_FORCE = "NIGERIAN POLICE FORCE";

const calculateLoan = (
  loanAmount: number,
  interestRate: number,
  tenureInMonths: number,
  netPay: number,
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

export const calculateLoanForOrganization = (
  organizationName: string,
  loanAmount: number,
  tenureInMonths: number,
  netPay: number,
) => {
  if (organizationName.toUpperCase() === NIGERIAN_POLICE_FORCE) {
    return calculateLoan(
      loanAmount,
      POLICE_INTEREST_RATE,
      tenureInMonths,
      netPay,
    );
  }
  return calculateLoan(
    loanAmount,
    OTHERS_INTEREST_RATE,
    tenureInMonths,
    netPay,
  );
};

export const calculateEligibleAmount = (
  netPay: number,
  tenor: number,
  interestRate: number,
): number => {
  const numerator = netPay * 0.32 * tenor;
  const interestRateInDecimal = interestRate / 100;
  const denominator = 1 + interestRateInDecimal * tenor;
  const result = numerator / denominator;

  const roundedResult = Math.floor(result / 1000) * 1000;

  return roundedResult;
};

const getInterestRateByOrganization = (organizationName: string) => {
  let interestRate = OTHERS_INTEREST_RATE;

  if (organizationName.toUpperCase() === NIGERIAN_POLICE_FORCE) {
    interestRate = POLICE_INTEREST_RATE;
  }
  return interestRate;
};

export const calculateEligibleAmountByOrganization = (
  netPay: number,
  tenor: number,
  organizationName: string,
) => {
  const interestRate = getInterestRateByOrganization(organizationName);
  return calculateEligibleAmount(netPay, tenor, interestRate);
};

export const getLoanRepaymentInfo = (
  loanAmount: number,
  loanTenorInMonths: number,
  organizationName: string,
) => {
  console.log({ loanAmount, loanTenorInMonths });

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

  const interestRate = getInterestRateByOrganization(organizationName);
  const interestRateInDecimal = interestRate / 100;
  console.log({ interestRate, interestRateInDecimal });

  const monthlyRepayment =
    ((1 + interestRateInDecimal * loanTenorInMonths) * loanAmount) /
    loanTenorInMonths;
  return {
    totalRepayment: (monthlyRepayment * loanTenorInMonths).toFixed(2),
    monthlyRepayment: monthlyRepayment.toFixed(2),
    interestRate,
  };
};
