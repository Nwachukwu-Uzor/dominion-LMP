import { format } from "date-fns"

export function formatDateLiteral(date: Date) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsOfYear = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const month = monthsOfYear[date.getMonth()];
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();

  // Function to get the ordinal suffix for the day of the month (e.g., "st", "nd", "rd", "th")
  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const ordinalSuffix = getOrdinalSuffix(dayOfMonth);

  return `${dayOfWeek} ${month} ${dayOfMonth}${ordinalSuffix} ${year}`;
}

export const getDaysFromToday = (numberOfDays: number) => {
  const today: Date = new Date();
  const other: Date = new Date(today);
  other.setDate(today.getDate() + numberOfDays);

  return {
    today: format(today, "yyyy-MM-dd"),
    other: format(other, "yyyy-MM-dd"),
  };
};
