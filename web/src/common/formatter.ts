import dayjs from "dayjs";
import { format } from "numerable";

function formatDate(value: Date, withTime: boolean = true) {
  const format = withTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY";
  return dayjs(value).format(format);
}

function formatWeekDay(value: Date, withTime: boolean = true) {
  const format = withTime ? "dddd DD/MM/YYYY HH:mm" : "dddd DD/MM/YYYY";
  return dayjs(value).format(format);
}

function formatTime(value: Date) {
  return dayjs(value).format("hh:mm A");
}

function formatDateRange(start: Date, end: Date) {
  if (dayjs(start).isSame(end, "date")) {
    return `${dayjs(start).format("DD/MM/YYYY")} ${dayjs(start).format("hh:mm A")} - ${dayjs(end).format("hh:mm A")}`;
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function duration(start: Date, end: Date) {
  return `${dayjs(end).diff(start, "hour")} hrs`;
}

function currency(val: number) {
  return format(val, "$0.00", { currency: "GBP" });
}

function minute(val: number) {
  return `${val} ${val > 1 ? "mins" : "min"}`;
}

export default {
  formatDate,
  formatWeekDay,
  formatTime,
  formatDateRange,
  duration,
  currency,
  minute,
};
