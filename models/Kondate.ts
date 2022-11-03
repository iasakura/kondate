import { isHoliday } from "@holiday-jp/holiday_jp";
import add from "date-fns/add";
import getDay from "date-fns/getDay";
import { Foods } from "../hooks/useFoods";
import { Kind, KindWithOther } from "./foods";

export type Food = { food: string; isStock: boolean };
export type Meal = { p: Food; c: Food; v: Food[] };
export type Kondate = {
  meals: (Meal | undefined)[];
  newFood?: { name: string; kind: KindWithOther };
  date: Date;
}[];

export const N = 7;
export const PER_DAY = 3;
export const N_VITAMIN = 3;
const NEW_FOOD_DAY = [1, 2, 3, 5, 6];

const shuffle = <T>(array: T[]) => {
  const shuffled = [...array];
  let currentIndex = shuffled.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
};

export const computeCarbo = (carbos: string[], n: number) => {
  const res = [];
  let i = 0;
  while (res.length < n) {
    res.push("米");
    res.push(carbos[i]);
    i = (i + 1) % carbos.length;
  }
  return res.slice(0, n);
};

export const computeProtein = (proteins: string[], n: number) => {
  const shuffledProteins = shuffle([...proteins]);
  const res = [];
  let i = 0;
  while (res.length < n) {
    res.push(shuffledProteins[i]);
    i = (i + 1) % shuffledProteins.length;
  }
  return res.slice(0, n);
};

export const computeVitamin = (
  vitamins: string[],
  n: number,
  perMeal: number
) => {
  const shuffledVitamins = shuffle([...vitamins]);
  const arr = [...shuffledVitamins, ...shuffledVitamins];
  const res = [];
  let i = 0;
  while (res.length < n) {
    res.push(arr.slice(i, i + perMeal));
    i = (i + perMeal) % shuffledVitamins.length;
  }
  return res.slice(0, n);
};

class FoodsQueue {
  private queues: { [k in Kind]: Food[] };
  private usedQueues: { [k in Kind]: Food[] };
  private newFoodsQueue: {
    kind: KindWithOther;
    food: string;
  }[];

  resetQueue = (kind: Kind) => {
    this.queues[kind].push(...this.usedQueues[kind]);
    this.usedQueues[kind] = [];
  };

  constructor(foods: Foods) {
    this.queues = {
      ["carbon"]: [
        ...foods.stockCarbo.map((food) => ({ food, isStock: true })),
        ...foods.carbo.map((food) => ({ food, isStock: false })),
      ],
      ["vitamin"]: [
        ...foods.stockVitamin.map((food) => ({ food, isStock: true })),
        ...foods.vitamin.map((food) => ({ food, isStock: false })),
      ],
      ["protein"]: [
        ...foods.stockProtein.map((food) => ({ food, isStock: true })),
        ...foods.protein.map((food) => ({ food, isStock: false })),
      ],
    };
    this.newFoodsQueue = [
      ...foods.newProtein.map((p) => ({ kind: "protein" as const, food: p })),
      ...foods.newCarbo.map((c) => ({ kind: "carbon" as const, food: c })),
      ...foods.newVitamin.map((v) => ({ kind: "vitamin" as const, food: v })),
      ...foods.newOthers.map((v) => ({ kind: "other" as const, food: v })),
    ];
    this.usedQueues = { ["carbon"]: [], ["vitamin"]: [], ["protein"]: [] };
  }

  get = (kind: Kind, used: Food[]): Food => {
    for (let trial = 0; trial < 2; ++trial) {
      console.log(this.queues[kind], kind);
      for (let i = 0; i < this.queues[kind].length; ++i) {
        if (i !== 0) {
          console.debug(`trying ${i + 1} times for getting food ${kind}`);
        }
        const cand = this.queues[kind][i];
        if (used.find((f) => f.food === cand.food) == null) {
          this.queues[kind] = [
            ...this.queues[kind].slice(0, i),
            ...this.queues[kind].slice(i + 1),
          ];
          if (!cand.isStock) {
            this.usedQueues[kind].push(cand);
          }
          return cand;
        }
      }
      this.resetQueue(kind);
    }
    throw Error("No food found");
  };

  getNew = () => {
    if (this.newFoodsQueue.length === 0) {
      return undefined;
    }
    const res = this.newFoodsQueue[0];
    this.newFoodsQueue = this.newFoodsQueue.slice(1);
    if (res.kind !== "other") {
      this.usedQueues[res.kind].push({ food: res.food, isStock: false });
    }
    return { name: res.food, kind: res.kind };
  };
}

export const computeKondate = (foods: Foods, startDay: Date): Kondate => {
  const queue = new FoodsQueue(foods);

  const res: Kondate = [];

  let used1: Food[] = [];
  let used2: Food[] = [];

  for (let day = 0; day < N; ++day) {
    const date = add(startDay, { days: day });
    const weekDay = getDay(date);

    const d: (Meal | undefined)[] = [];

    for (let meal = 0; meal < PER_DAY; ++meal) {
      // 平日はお昼なし
      if (meal === 1 && ((1 <= weekDay && weekDay <= 5) || isHoliday(date))) {
        d.push(undefined);
        continue;
      }
      const c =
        meal === 0
          ? { food: "米", isStock: false }
          : queue.get("carbon", used1.concat(used2));
      if (c.isStock) {
        used1.push(c);
      }
      const p = queue.get("protein", used1.concat(used2));
      if (p.isStock) {
        used1.push(p);
      }
      const vs: Food[] = [];
      for (let i = 0; i < N_VITAMIN; ++i) {
        const v = queue.get("vitamin", used1.concat(used2));
        if (v.isStock) {
          used1.push(v);
        }
        vs.push(v);
      }
      d.push({ c, p, v: vs });
    }
    used2 = used1;
    used1 = [];
    const newFood = NEW_FOOD_DAY.includes(weekDay) ? queue.getNew() : undefined;
    res.push({ meals: d, newFood, date });
  }

  return res;
};

export type TotalResult = {
  name: string;
  total: number;
  kind: KindWithOther;
}[];

export const computeTotal = (kondate: Kondate | undefined): TotalResult => {
  const totalOfFoods: {
    [k in string]: { total: number; kind: KindWithOther };
  } = {};
  const addToTotal = (s: Food, kind: KindWithOther) => {
    if (s.food in totalOfFoods) {
      totalOfFoods[s.food].total += 1;
    } else {
      totalOfFoods[s.food] = { total: 1, kind };
    }
  };

  kondate?.forEach((day) => {
    day.meals.forEach((meal) => {
      if (meal != null) {
        addToTotal(meal.c, "carbon");
        addToTotal(meal.p, "protein");
        meal.v.forEach((v) => addToTotal(v, "vitamin"));
      }
    });
    if (day.newFood !== undefined) {
      addToTotal({ food: day.newFood.name, isStock: false }, day.newFood.kind);
    }
  });

  return Object.entries(totalOfFoods).map(([k, v]) => {
    return { name: k, ...v };
  });
};
