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

  const parsedFoods = foods.split(/[ 　]/);

  return [parsedFoods, form];
};

export const KondateSolver: NextPage = () => {
  const [carbo, carboForm] = useFoods({
    category: "炭水化物",
    default: "そうめん",
  });
  const [protein, proteinForm] = useFoods({
    category: "タンパク質",
    default: "豆腐 鯛 ヒラメ",
  });
  const [vitamin, vitaminForm] = useFoods({
    category: "ビタミン",
    default: "にんじん かぶ キャベツ ほうれん草 かぼちゃ",
  });

  const [newCarbo, newCarboForm] = useFoods({
    category: "炭水化物",
    default: "オートミール",
  });
  const [newProtein, newProteinForm] = useFoods({
    category: "タンパク質",
    default: "おにく おさかな",
  });
  const [newVitamin, newVitaminForm] = useFoods({
    category: "ビタミン",
    default: "きゅうり なす ぴーまん",
  });

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
      <button onClick={showKondate}>考える!</button>
      <div>{kondate && <KondateTable kondate={kondate} />}</div>
      {totalOfFoods && (
        <div>
          <h3>合計料</h3>
          <div>
            {Object.entries(totalOfFoods).map(([k, v]) => {
              return (
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
