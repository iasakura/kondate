import format from "date-fns/format";
import React from "react";

export const useDays = (
  defaultDate?: Date
): {
  form: React.ReactElement;
  startDay: Date;
} => {
  const [startDay, setStartDay] = React.useState(
    format(defaultDate ?? new Date(), "yyyy-MM-dd")
  );

  const handleChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      ev.preventDefault();
      setStartDay(format(new Date(ev.target.value), "yyyy-MM-dd"));
    },
    []
  );

  const selector = (
    <label>
      始まり日:
      <input type="date" value={startDay} onChange={handleChange} />
    </label>
  );

  return { form: selector, startDay: new Date(startDay) };
};
