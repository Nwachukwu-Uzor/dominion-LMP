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


export function parseDateToInputFormat(dateStr: string): string {
  // Define month mappings
  const monthMap: { [key: string]: string } = {
    "Jan": "01",
    "Feb": "02",
    "Mar": "03",
    "Apr": "04",
    "May": "05",
    "Jun": "06",
    "Jul": "07",
    "Aug": "08",
    "Sep": "09",
    "Oct": "10",
    "Nov": "11",
    "Dec": "12"
  };

  const [day, monthAbbr, year] = dateStr.split('-');
  const month = monthMap[monthAbbr];

  let fullYear = '';
  const yearNum = parseInt(year);
  if (yearNum < 50) {
    fullYear = `20${year.padStart(2, '0')}`;
  } else {
    fullYear = `19${year}`;
  }

  const formattedDay = day.padStart(2, '0');
  return `${fullYear}-${month}-${formattedDay}`;
}