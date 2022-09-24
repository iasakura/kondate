import type { GetServerSideProps, NextPage } from "next";
import { DefaultFoods } from "../hooks/useFoods";
import { Kondatekun } from "../templates/Kondate";

type Props = { defaultFoods?: DefaultFoods };

const Home: NextPage = (props: Props) => {
  return <Kondatekun defaultFoods={props.defaultFoods} />;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  let foods = context.query.foods;
  if (foods == null) {
    return { props: {} };
  }
  if (typeof foods !== "string") {
    // Only use last element
    foods = foods[foods.length - 1];
  }
  const defaultFoods = DefaultFoods.safeParse(JSON.parse(foods));
  console.log(foods);
  if (defaultFoods.success) {
    return { props: { defaultFoods: defaultFoods.data } };
  } else {
    throw Error("Invalid URL");
  }
};

export default Home;
