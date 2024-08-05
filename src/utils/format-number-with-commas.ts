export const formatNumberWithCommas = (amount: number | string) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatNumberWithCommasWithOptionPeriodSign = (
  amount: number | string
) => {
  const [integerPart, decimalPart] = amount.toString().split(".");

  // Format the integer part with commas
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Combine the formatted integer part with the decimal part if it exists
  return decimalPart !== undefined
    ? `${formattedIntegerPart}.${decimalPart}`
    : formattedIntegerPart;
};

export const formatCurrency = (currency: string) => {
  const parsedCurrency = currency?.toString()?.replace(/,/g, "");
  if (parsedCurrency == null || Number.isNaN(parsedCurrency)) {
    return currency;
  }

  // Convert to number if it's not already
  let num = parseFloat(parsedCurrency);

  // Check if the number is negative
  const isNegative = num < 0;

  // Remove commas if present
  currency = currency.toString().replace(/,/g, "");

  // Round to two decimal places
  num = Math.round((num + Number.EPSILON) * 100) / 100;

  // Convert back to string with two decimal places
  let formattedCurrency = Math.abs(num).toFixed(2);

  // Add commas for thousands separator
  formattedCurrency = formattedCurrency.replace(
    /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Add negative sign back if necessary
  if (isNegative) {
    formattedCurrency = "-" + formattedCurrency;
  }

  return formattedCurrency;
};
