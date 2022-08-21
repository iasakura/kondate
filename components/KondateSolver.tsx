import React from "react";
import { KondateTable } from "./KondateTable";
import { computeKondate, computeTotal, type Kondate } from "../models/Kondate";
import { saveAs } from "file-saver";

import { DefaultFoods, Foods, useFoodsForm } from "../hooks/useFoods";
import { useStartDay } from "../hooks/date";
import { useDrop } from "../hooks/fileDrop";
import { useShareURLButton } from "../hooks/useShareURL";

const download = (foods: Foods) => {
  saveAs(
    new Blob([JSON.stringify(foods, null, 2)], {
      type: "application/json",
    }),
    "kondate.json"
  );
};

export const KondateSolver = (props: { defaultFoods?: DefaultFoods }) => {
  const [weekdayForm, weekdays] = useStartDay();

  const [kondate, setKondate] = React.useState<Kondate | undefined>(undefined);
  const defaultFoods = props.defaultFoods ?? {
    carbo: undefined,
    vitamin: undefined,
    protein: undefined,
    newCarbo: undefined,
    newVitamin: undefined,
    newProtein: undefined,
    stockCarbo: undefined,
    stockVitamin: undefined,
    stockProtein: undefined,
  };

  const { form: foodsForm, setFoods, foods } = useFoodsForm({ defaultFoods });

  const showKondate = () => {
    const kondate = computeKondate(foods);
    setKondate(kondate);
  };

  const totalOfFoods = kondate ? computeTotal(kondate) : undefined;

  const handleFile = async (file: File) => {
    const data = await file.text();
    if (data != null) {
      const formData = Foods.safeParse(JSON.parse(data));
      if (formData.success) {
        setFoods(formData.data);
      }
    }
  };

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

  const { handleDragOver, handleDragLeave, handleDrop, isDraggedOver } =
    useDrop({
      handleFileDrop: handleFile,
    });

  const shareURLButton = useShareURLButton(foods);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ backgroundColor: isDraggedOver ? "#e1e7f0" : "#ffffff" }}
    >
      <div>{weekdayForm}</div>
      {foodsForm}
      <button onClick={showKondate}>考える!</button>
      <button onClick={() => download(foods)}>ダウンロード</button>
      {shareURLButton}
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
