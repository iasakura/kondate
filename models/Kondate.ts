export type Food = { food: string; isStock: boolean };
export type Meal = { p: Food; c: Food; v: Food[] };
export type Kondate = {
  meals: Meal[];
  newFood?: string;
}[];

export const N = 7;
export const PER_DAY = 2;
export const N_VITAMIN = 2;
const NEW_FOOD_DAY = [0, 1, 2, 4, 5];

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
    this.queues[kind] = this.usedQueues[kind];
    this.usedQueues[kind] = [];
  };

  constructor(
    carbo: string[],
    vitamin: string[],
    protein: string[],
    newCarbo: string[],
    newVitamin: string[],
    newProtein: string[],
    stockCarbo: string[],
    stockVitamin: string[],
    stockProtein: string[]
  ) {
    this.queues = {
      ["carbo"]: [
        ...stockCarbo.map((food) => ({ food, isStock: true })),
        ...carbo.map((food) => ({ food, isStock: false })),
      ],
      ["vitamin"]: [
        ...stockVitamin.map((food) => ({ food, isStock: true })),
        ...vitamin.map((food) => ({ food, isStock: false })),
      ],
      ["protein"]: [
        ...stockProtein.map((food) => ({ food, isStock: true })),
        ...protein.map((food) => ({ food, isStock: false })),
      ],
    };
    this.newFoodsQueue = [
      ...newProtein.map((p) => ({ kind: "protein" as const, food: p })),
      ...newCarbo.map((c) => ({ kind: "carbo" as const, food: c })),
      ...newVitamin.map((v) => ({ kind: "vitamin" as const, food: v })),
    ];
    this.usedQueues = { ["carbo"]: [], ["vitamin"]: [], ["protein"]: [] };
  }

  get = (kind: FoodKind): Food => {
    if (this.queues[kind].length === 0) {
      this.resetQueue(kind);
    }
    const ret = this.queues[kind][0];
    this.queues[kind] = this.queues[kind].slice(1);
    if (!ret.isStock) {
      this.usedQueues[kind].push(ret);
    }
    return ret;
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

export const computeKondate = (
  carbo: string[],
  vitamin: string[],
  protein: string[],
  newCarbo: string[],
  newVitamin: string[],
  newProtein: string[],
  stockCarbo: string[],
  stockVitamin: string[],
  stockProtein: string[]
): Kondate => {
  const queue = new FoodsQueue(
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

  const res: Kondate = [];

  for (let day = 0; day < N; ++day) {
    const d: Meal[] = [];
    for (let meal = 0; meal < PER_DAY; ++meal) {
      const c =
        meal === 0 ? { food: "米", isStock: false } : queue.get("carbo");
      const p = queue.get("protein");
      const vs = [];
      for (let i = 0; i < N_VITAMIN; ++i) {
        vs.push(queue.get("vitamin"));
      }
      d.push({ c, p, v: vs });
    }
    const newFood = NEW_FOOD_DAY.includes(day) ? queue.getNew() : undefined;
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
