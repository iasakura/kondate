import { Foods } from "../hooks/useFoods";

export const shareUrl = (base: string, foods: Foods) => {
  const url = new URL(base);
  url.searchParams.append("foods", JSON.stringify(foods));
  return url.href;
};
