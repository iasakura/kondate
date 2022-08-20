import type { NextPage } from "next";
import React from "react";
import { KondateTable } from "./KondateTable";
import { computeKondate, computeTotal, type Kondate } from "../models/Kondate";
import { add, format } from "date-fns";
import { useLocalStorage } from "../hooks";
import { saveAs } from "file-saver";

import { z } from "zod";

const formJSON = z.object({
  carbo: z.array(z.string()),
  vitamin: z.array(z.string()),
  protein: z.array(z.string()),
  newCarbo: z.array(z.string()),
  newVitamin: z.array(z.string()),
  newProtein: z.array(z.string()),
  stockCarbo: z.array(z.string()),
  stockVitamin: z.array(z.string()),
  stockProtein: z.array(z.string()),
});

const download = (
  carbo: string[],
  vitamin: string[],
  protein: string[],
  newCarbo: string[],
  newVitamin: string[],
  newProtein: string[],
  stockCarbo: string[],
  stockVitamin: string[],
  stockProtein: string[]
) => {
  const data = {
    carbo,
    vitamin,
    protein,
    newCarbo,
    newVitamin,
    newProtein,
    stockCarbo,
    stockVitamin,
    stockProtein,
  };

  saveAs(
    new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    }),
    "kondate.json"
  );
};

const useFoods = (props: {
  category: string;
  default: string;
  key: string;
  withNumber?: boolean;
}): [string[], (foods: string[]) => void, React.ReactElement] => {
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

  // eslint-disable-next-line no-irregular-whitespace
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

  return [parsedFoods, (foods) => setFoods(foods.join(" ")), form];
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
  const [carbo, setCarbo, carboForm] = useFoods({
    category: "炭水化物",
    default: "そうめん オートミール",
    key: "carbo-eaten",
  });
  const [protein, setProtein, proteinForm] = useFoods({
    category: "タンパク質",
    default: "豆腐 鯛 しらす",
    key: "protein-eaten",
  });
  const [vitamin, setVitamin, vitaminForm] = useFoods({
    category: "ビタミン",
    default: "トマト かぶ キャベツ ほうれん草 にんじん りんご",
    key: "vitamin-eaten",
  });

  const [newCarbo, setNewCarbo, newCarboForm] = useFoods({
    category: "炭水化物",
    default: "",
    key: "carbo-new",
  });
  const [newProtein, setNewProtein, newProteinForm] = useFoods({
    category: "タンパク質",
    default: "",
    key: "protein-new",
  });
  const [newVitamin, setNewVitamin, newVitaminForm] = useFoods({
    category: "ビタミン",
    default: "",
    key: "vitamin-stock",
  });

  const [stockCarbo, setStockCarbo, stockCarboForm] = useFoods({
    category: "炭水化物",
    default: "",
    key: "carbo-stock",
    withNumber: true,
  });
  const [stockProtein, setStockProtein, stockProteinForm] = useFoods({
    category: "タンパク質",
    default: "",
    key: "protein-stock",
    withNumber: true,
  });
  const [stockVitamin, setStockVitamin, stockVitaminForm] = useFoods({
    category: "ビタミン",
    default: "",
    key: "vitamin-stock",
    withNumber: true,
  });

  const [weekdayForm, weekdays] = useStartDay();

  const [kondate, setKondate] = React.useState<Kondate | undefined>(undefined);

  const [dragOver, setDragOver] = React.useState(false);

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

  const handleFile = async (file: File) => {
    const data = await file.text();
    if (data != null) {
      const formData = formJSON.safeParse(JSON.parse(data));
      if (formData.success) {
        setCarbo(formData.data.carbo);
        setProtein(formData.data.protein);
        setVitamin(formData.data.vitamin);
        setNewProtein(formData.data.newProtein);
        setNewCarbo(formData.data.newCarbo);
        setNewVitamin(formData.data.newVitamin);
        setStockCarbo(formData.data.stockCarbo);
        setStockProtein(formData.data.stockProtein);
        setStockVitamin(formData.data.stockVitamin);
      }
    }
  };

  const handleDrop = React.useCallback(
    async (ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      setDragOver(false);
      const items = [...ev.dataTransfer.items];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            await handleFile(file);
          }
        }
      }
    },
    []
  );

  const handleDragOver = React.useCallback(
    (ev: React.DragEvent<HTMLDivElement>) => {
      ev.stopPropagation();
      ev.preventDefault();
      setDragOver(true);
    },
    []
  );

  const handleDragLeave = React.useCallback(
    (ev: React.DragEvent<HTMLDivElement>) => {
      ev.stopPropagation();
      ev.preventDefault();
      setDragOver(false);
    },
    []
  );

  const handleFileChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      const files = ev.target.files;
      if (files) {
        handleFile(files[0]);
      }
    },
    []
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ backgroundColor: dragOver ? "#e1e7f0" : "#ffffff" }}
    >
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
      <button
        onClick={() =>
          download(
            carbo,
            vitamin,
            protein,
            newCarbo,
            newVitamin,
            newProtein,
            stockCarbo,
            stockVitamin,
            stockProtein
          )
        }
      >
        ダウンロード
      </button>
      <input type="file" onChange={(ev) => handleFileChange(ev)} />
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
    </div>
  );
};
