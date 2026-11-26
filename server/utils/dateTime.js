import { turfConfig } from "../config/turf.js";

const getToday = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: turfConfig.timeZone,
  });
};

const getCurrentHour = () => {
  const hour = new Date().toLocaleString("en-US", {
    timeZone: turfConfig.timeZone,
    hour: "numeric",
    hour12: false,
  });

  return Number(hour) % 24;
};

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

const isValidDateString = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
};

const isDateInWindow = (date) => {
  const today = getToday();
  const last = addDays(today, turfConfig.bookingWindowDays - 1);

  return date >= today && date <= last;
};

const getSlotHours = () => {
  const hours = [];

  for (let hour = turfConfig.openHour; hour < turfConfig.closeHour; hour += 1) {
    hours.push(hour);
  }

  return hours;
};

const isSlotPast = (date, slotStart) => {
  const today = getToday();

  if (date < today) {
    return true;
  }

  if (date === today) {
    return slotStart <= getCurrentHour();
  }

  return false;
};

export {
  getToday,
  isValidDateString,
  isDateInWindow,
  getSlotHours,
  isSlotPast,
};