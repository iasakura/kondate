import React, { useEffect } from "react";
import { KondateTable } from "./KondateTable";
import { computeKondate, computeTotal, type Kondate } from "../models/Kondate";
import { saveAs } from "file-saver";

import { Foods, useFoodsForm } from "../hooks/useFoods";
import { useDrop } from "../hooks/fileDrop";
import { useShareURLButton } from "../hooks/useShareURL";
import { colors } from "../ui";
import { japaneseFoodName, KindWithOther } from "../models/foods";

const download = (foods: Foods) => {
  saveAs(
    new Blob([JSON.stringify(foods, null, 2)], {
      type: "application/json",
    }),
    "kondate.json"
  );
};

export const KondateSolver = (props: { defaultFoods?: Foods }) => {
  const [kondate, setKondate] = React.useState<Kondate | undefined>(undefined);
  const defaultFoods = props.defaultFoods;
  const { form: foodsForm, setFoods, foods } = useFoodsForm({ defaultFoods });

  useEffect(() => {
    if (defaultFoods) {
      showKondate();
    }
  }, []);

  const showKondate = () => {
    const kondate = computeKondate(foods, foods.startDay);
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
      {foodsForm}
      <button onClick={showKondate}>考える!</button>
      <button onClick={() => download(foods)}>ダウンロード</button>
      {shareURLButton}
      <input type="file" onChange={(ev) => handleFileChange(ev)} />
      <div>{kondate && <KondateTable kondate={kondate} />}</div>
      {totalOfFoods && (
        <div>
          <h3>合計料</h3>
          {(["carbon", "protein", "vitamin", "other"] as KindWithOther[]).map(
            (kind) => {
              return (
                <div key={kind}>
                  <h4>{japaneseFoodName[kind]}</h4>
                  {totalOfFoods
                    .filter(({ kind: k }) => k === kind)
                    .map(({ name, total, kind }) => {
                      return (
                        <div
                          style={{
                            background: colors[kind],
                            width: "fit-content",
                          }}
                          key={name}
                        >
                          {name}: {total}回
                        </div>
                      );
                    })}
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};
