import type { NextPage } from "next";
import React from "react";
import { KondateTable } from "./KondateTable";
import { computeKondate, computeTotal, type Kondate } from "../models/Kondate";
import { add, format } from "date-fns";
import { useLocalStorage } from ".";

const useFoods = (props: {
  category: string;
  default: string;
  key: string;
}): [string[], React.ReactElement] => {
  const [foods, setFoods] = useLocalStorage(props.key, props.default);
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

const formatDate = (d: Date) => format(d, "MM/dd (eee)");

const useStartDay = (): [React.ReactElement, string[]] => {
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

  const days = [...Array(10).keys()].map((i) =>
    formatDate(add(new Date(startDay), { days: i }))
  );

  const selector = (
    <label>
      始まり日:
      <input type="date" value={startDay} onChange={handleChange} />
    </label>
  );

  return [selector, days];
};

export const KondateSolver: NextPage = () => {
  const [carbo, carboForm] = useFoods({
    category: "炭水化物",
    default: "そうめん オートミール",
    key: "carbo-eaten",
  });
  const [protein, proteinForm] = useFoods({
    category: "タンパク質",
    default: "豆腐 鯛 しらす",
    key: "protein-eaten",
  });
  const [vitamin, vitaminForm] = useFoods({
    category: "ビタミン",
    default: "トマト かぶ キャベツ ほうれん草 にんじん りんご",
    key: "vitamin-eaten",
  });

  const [newCarbo, newCarboForm] = useFoods({
    category: "炭水化物",
    default: "",
    key: "carbo-new",
  });
  const [newProtein, newProteinForm] = useFoods({
    category: "タンパク質",
    default: "",
    key: "protein-new",
  });
  const [newVitamin, newVitaminForm] = useFoods({
    category: "ビタミン",
    default: "",
    key: "vitamin-new",
  });

  const [weekdayForm, weekdays] = useStartDay();

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
