import add from "date-fns/add";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import React from "react";

const formatDate = (d: Date) => format(d, "MM/dd (eee)");

export const useDays = (): {
  form: React.ReactElement;
  days: string[];
  startDay: number;
} => {
  const [startDay, setStartDay] = React.useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const handleChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      ev.preventDefault();
      setStartDay(format(new Date(ev.target.value), "yyyy-MM-dd"));
    },
    []
  );

  const days = [...Array(7).keys()].map((i) =>
    formatDate(add(new Date(startDay), { days: i }))
  );

  const selector = (
    <label>
      始まり日:
      <input type="date" value={startDay} onChange={handleChange} />
    </label>
  );

  return { form: selector, days, startDay: getDay(new Date(startDay)) };
};
