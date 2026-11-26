const TIME_ZONE = "Asia/Karachi";

const getNextDates = (count = 14) => {
  const dates = [];

  for (let i = 0; i < count; i += 1) {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);

    dates.push(
      date.toLocaleDateString("en-CA", {
        timeZone: TIME_ZONE,
      }),
    );
  }

  return dates;
};

const formatDateParts = (date) => {
  const parsed = new Date(`${date}T00:00:00`);

  return {
    weekday: parsed.toLocaleDateString("en-US", {
      weekday: "short",
    }),
    day: parsed.getDate(),
    month: parsed.toLocaleDateString("en-US", {
      month: "short",
    }),
  };
};

const formatHour = (hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;

  return `${display}:00 ${suffix}`;
};

export {
  getNextDates,
  formatDateParts,
  formatHour,
};