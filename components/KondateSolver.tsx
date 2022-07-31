import type { NextPage } from "next";
import React from "react";
import { KondateTable } from "./KondateTable";
import { computeKondate, computeTotal, type Kondate } from "../models/Kondate";
import { add, format } from "date-fns";
import { useLocalStorage } from "../hooks";

const useFoods = (props: {
  category: string;
  default: string;
  key: string;
  withNumber?: boolean;
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

  let parsedFoods = foods !== "" ? foods.trim().split(/[ 　]+/) : [];
  if (props.withNumber) {
    parsedFoods = parsedFoods.flatMap((food) => {
      const foodWithNum = food.split("x");
      if (foodWithNum.length == 2) {
        const num = parseInt(foodWithNum[1]);
        if (Number.isInteger(num)) {
          return new Array(parseInt(foodWithNum[1])).fill(foodWithNum[0]);
        }
      }
      return [food];
    });
  }

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
    key: "vitamin-stock",
  });

  const [stockCarbo, stockCarboForm] = useFoods({
    category: "炭水化物",
    default: "",
    key: "carbo-stock",
    withNumber: true,
  });
  const [stockProtein, stockProteinForm] = useFoods({
    category: "タンパク質",
    default: "",
    key: "protein-stock",
    withNumber: true,
  });
  const [stockVitamin, stockVitaminForm] = useFoods({
    category: "ビタミン",
    default: "",
    key: "vitamin-stock",
    withNumber: true,
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
      newProtein,
      stockCarbo,
      stockVitamin,
      stockProtein
    );
    setKondate(kondate);
  };

  const totalOfFoods = kondate ? computeTotal(kondate) : undefined;

  return (
    <>
      <h2>食材</h2>
      <div>食材をスペース区切りで入力してください:</div>
      <div style={{ display: "box" }}>
        <div>これまで食べたことがあるもの</div>
        <div style={{ marginRight: "10px" }}>
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
        <div>
          ストック:
          {stockCarboForm}
          {stockVitaminForm}
          {stockProteinForm}
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
