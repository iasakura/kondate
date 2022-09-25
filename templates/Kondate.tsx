import Head from "next/head";
import { KondateSolver } from "../components/KondateSolver";
import { Foods } from "../hooks/useFoods";

export const Kondatekun = (props: { defaultFoods?: Foods }) => {
  return (
    <div>
      <Head>
        <title>離乳食こんだて考える君</title>
      </Head>
      <h1>離乳食こんだて考える君</h1>
      <KondateSolver defaultFoods={props.defaultFoods} />
    </div>
  );
};
