import type { GetServerSideProps, NextPage } from "next";
import { z } from "zod";
import { Foods } from "../hooks/useFoods";
import { Kondatekun } from "../templates/Kondate";

const FoodsProps = Foods.omit({ startDay: true }).extend({
  startDay: z.string(),
});
type Props = { defaultFoods?: z.infer<typeof FoodsProps> };

const Home: NextPage = ({ defaultFoods }: Props) => {
  let foods: Foods | undefined;
  if (defaultFoods != null) {
    const { startDay, ...rest } = defaultFoods;
    foods = { startDay: new Date(startDay), ...rest };
  }
  return <Kondatekun defaultFoods={foods} />;
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

  const defaultFoods = FoodsProps.safeParse(JSON.parse(foods));
  if (defaultFoods.success) {
    return { props: { defaultFoods: defaultFoods.data } };
  } else {
    throw Error("Invalid URL");
  }
};

export default Home;
