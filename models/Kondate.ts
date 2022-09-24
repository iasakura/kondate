import add from "date-fns/add";
import getDay from "date-fns/getDay";
import { Foods } from "../hooks/useFoods";

export type Food = { food: string; isStock: boolean };
export type Meal = { p: Food; c: Food; v: Food[] };
export type Kondate = {
  meals: Meal[];
  newFood?: string;
}[];

export const N = 7;
export const PER_DAY = 2;
export const N_VITAMIN = 2;
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

type FoodKind = "carbo" | "vitamin" | "protein";

class FoodsQueue {
  private queues: { [k in FoodKind]: Food[] };
  private usedQueues: { [k in FoodKind]: Food[] };
  private newFoodsQueue: {
    kind: FoodKind;
    food: string;
  }[];

  resetQueue = (kind: FoodKind) => {
    this.queues[kind].push(...this.usedQueues[kind]);
    this.usedQueues[kind] = [];
  };

  constructor(foods: Foods) {
    this.queues = {
      ["carbo"]: [
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
      ...foods.newCarbo.map((c) => ({ kind: "carbo" as const, food: c })),
      ...foods.newVitamin.map((v) => ({ kind: "vitamin" as const, food: v })),
    ];
    this.usedQueues = { ["carbo"]: [], ["vitamin"]: [], ["protein"]: [] };
  }

  get = (kind: FoodKind, used: Food[]): Food => {
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
    this.usedQueues[res.kind].push({ food: res.food, isStock: false });
    return res.food;
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

    const d: Meal[] = [];

    for (let meal = 0; meal < PER_DAY; ++meal) {
      const c =
        meal === 0
          ? { food: "米", isStock: false }
          : queue.get("carbo", used1.concat(used2));
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
    res.push({ meals: d, newFood });
  }

  return res;
};

export const computeTotal = (kondate: Kondate | undefined) => {
  const totalOfFoods: { [k in string]: number } = {};
  const addToTotal = (s: Food) => {
    if (s.food in totalOfFoods) {
      totalOfFoods[s.food] += 1;
    } else {
      totalOfFoods[s.food] = 1;
    }
  };

  kondate?.forEach((day) => {
    day.meals.forEach((meal) => {
      addToTotal(meal.c);
      addToTotal(meal.p);
      meal.v.forEach((v) => addToTotal(v));
    });
    if (day.newFood !== undefined) {
      addToTotal({ food: day.newFood, isStock: false });
    }
  });

  return totalOfFoods;
};
