import { useCallback } from "react";
import { shareUrl } from "../models/shareURL";
import { Foods } from "./useFoods";

export const useShareURLButton = (foods: Foods) => {
  const url = shareUrl("https://kondate.vercel.app/", foods);
  // const url = shareUrl("http://localhost:3000/", foods);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(url);
  }, [url]);

  return <button onClick={handleClick}>リンクをコピー</button>;
};
