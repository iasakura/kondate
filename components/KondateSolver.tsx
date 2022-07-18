import type { NextPage } from "next";
import React from "react";
import { KondateTable } from "./KondateTable";
import { computeKondate, computeTotal, type Kondate } from "../models/Kondate";

const useFoods = (props: {
  category: string;
  default: string;
}): [string[], React.ReactElement] => {
  const [foods, setFoods] = React.useState(props.default);
  const handleChange = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setFoods(ev.target.value);
  };

  const form = (
    <div>
      <label>
        {props.category}:{" "}
        <input
          type="text"
          name={props.category}
          onChange={handleChange}
          size={50}
          value={foods}
        ></input>
      </label>
    </div>
  );

  const parsedFoods = foods !== "" ? foods.trim().split(/[ 　]+/) : [];

  return [parsedFoods, form];
};

const useWeekday = (): [React.ReactElement, string[]] => {
  const weekdays = [
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
    "日曜日",
  ];
  const doubleWeekdays = [...weekdays, ...weekdays];

  const [startDay, setStartDay] = React.useState(0);

  const handleChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    ev.preventDefault();
    const selected = weekdays.findIndex((day) => day === ev.target.value);
    console.log(ev.target.value);
    console.log(selected);
    if (selected >= 0) {
      setStartDay(selected);
    }
  };

  const selector = (
    <label>
      始まり曜日:
      <select onChange={handleChange}>
        {weekdays.map((day, idx) => (
          <option key={day}>{day}</option>
        ))}
      </select>
    </label>
  );

  return [selector, doubleWeekdays.slice(startDay, startDay + 7)];
};

export const KondateSolver: NextPage = () => {
  const [carbo, carboForm] = useFoods({
    category: "炭水化物",
    default: "そうめん オートミール",
  });
  const [protein, proteinForm] = useFoods({
    category: "タンパク質",
    default: "豆腐 鯛 しらす",
  });
  const [vitamin, vitaminForm] = useFoods({
    category: "ビタミン",
    default: "トマト かぶ キャベツ ほうれん草 にんじん りんご",
  });

  const [newCarbo, newCarboForm] = useFoods({
    category: "炭水化物",
    default: "",
  });
  const [newProtein, newProteinForm] = useFoods({
    category: "タンパク質",
    default: "",
  });
  const [newVitamin, newVitaminForm] = useFoods({
    category: "ビタミン",
    default: "",
  });

  const [weekdayForm, weekdays] = useWeekday();
  console.log(weekdays);

  const [kondate, setKondate] = React.useState<Kondate | undefined>(undefined);

  const showKondate = () => {
    const kondate = computeKondate(
      carbo,
      vitamin,
      protein,
      newCarbo,
      newVitamin,
      newProtein
    );
    setKondate(kondate);
  };

  const totalOfFoods = kondate ? computeTotal(kondate) : undefined;

  return (
    <>
      <div>食材をスペース区切りで入力してください:</div>
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "10px" }}>
          これまで食べたことがあるもの:
          {carboForm}
          {vitaminForm}
          {proteinForm}
        </div>
        <div>
          初めて食べるもの:
          {newCarboForm}
          {newVitaminForm}
          {newProteinForm}
        </div>
      </div>
      <div>{weekdayForm}</div>
      <button onClick={showKondate}>考える!</button>
      <div>
        {kondate && <KondateTable kondate={kondate} weekdays={weekdays} />}
      </div>
      {totalOfFoods && (
        <div>
          <h3>合計料</h3>
          <div>
            {Object.entries(totalOfFoods).map(([k, v]) => {
              return (
                // eslint-disable-next-line react/jsx-key
                <div>
                  {k}: {v}回
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
