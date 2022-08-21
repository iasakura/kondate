import { useLocalStorage } from "./localStorage";
import { z } from "zod";

export const Foods = z.object({
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

export type Foods = z.infer<typeof Foods>;

export const DefaultFoods = z.object({
  carbo: z.optional(z.string()),
  vitamin: z.optional(z.string()),
  protein: z.optional(z.string()),
  newCarbo: z.optional(z.string()),
  newVitamin: z.optional(z.string()),
  newProtein: z.optional(z.string()),
  stockCarbo: z.optional(z.string()),
  stockVitamin: z.optional(z.string()),
  stockProtein: z.optional(z.string()),
});

export type DefaultFoods = z.infer<typeof DefaultFoods>;

const useCategoryForm = (props: {
  category: string;
  default: string | undefined;
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

export const useFoodsForm = (props: {
  defaultFoods: DefaultFoods;
}): {
  form: React.ReactElement;
  setFoods: (foods: Foods) => void;
  foods: Foods;
} => {
  const [carbo, setCarbo, carboForm] = useCategoryForm({
    category: "炭水化物",
    default: props.defaultFoods.carbo,
    key: "carbo-eaten",
  });
  const [protein, setProtein, proteinForm] = useCategoryForm({
    category: "タンパク質",
    default: props.defaultFoods.protein,
    key: "protein-eaten",
  });
  const [vitamin, setVitamin, vitaminForm] = useCategoryForm({
    category: "ビタミン",
    default: props.defaultFoods.vitamin,
    key: "vitamin-eaten",
  });

  const [newCarbo, setNewCarbo, newCarboForm] = useCategoryForm({
    category: "炭水化物",
    default: props.defaultFoods.newCarbo,
    key: "carbo-new",
  });
  const [newProtein, setNewProtein, newProteinForm] = useCategoryForm({
    category: "タンパク質",
    default: props.defaultFoods.newProtein,
    key: "protein-new",
  });
  const [newVitamin, setNewVitamin, newVitaminForm] = useCategoryForm({
    category: "ビタミン",
    default: props.defaultFoods.newVitamin,
    key: "vitamin-stock",
  });

  const [stockCarbo, setStockCarbo, stockCarboForm] = useCategoryForm({
    category: "炭水化物",
    default: props.defaultFoods.stockCarbo,
    key: "carbo-stock",
    withNumber: true,
  });
  const [stockProtein, setStockProtein, stockProteinForm] = useCategoryForm({
    category: "タンパク質",
    default: props.defaultFoods.stockProtein,
    key: "protein-stock",
    withNumber: true,
  });
  const [stockVitamin, setStockVitamin, stockVitaminForm] = useCategoryForm({
    category: "ビタミン",
    default: props.defaultFoods.stockVitamin,
    key: "vitamin-stock",
    withNumber: true,
  });

  const form = (
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
    </>
  );

  const setFoods = (foods: Foods) => {
    setCarbo(foods.carbo);
    setProtein(foods.protein);
    setVitamin(foods.vitamin);
    setNewProtein(foods.newProtein);
    setNewCarbo(foods.newCarbo);
    setNewVitamin(foods.newVitamin);
    setStockCarbo(foods.stockCarbo);
    setStockProtein(foods.stockProtein);
    setStockVitamin(foods.stockVitamin);
  };

  return {
    form,
    setFoods,
    foods: {
      carbo,
      protein,
      vitamin,
      newCarbo,
      newProtein,
      newVitamin,
      stockCarbo,
      stockProtein,
      stockVitamin,
    },
  };
};
