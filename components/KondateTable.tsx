import styled from "styled-components";
import { Food, Meal, type Kondate } from "../models/Kondate";

const MealBoxWrapper = styled.div<{ color: string; flex?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 7rem;
  text-align: center
  overflow: hidden;
  border: solid 1px white;
  background-color: ${(props) => props.color};
  flex: ${(props) => (props.flex !== undefined ? props.flex : "1")}
`;

const MealBox = (props: {
  color: string;
  children: React.ReactElement | string;
  flex?: string;
}) => {
  return (
    <MealBoxWrapper color={props.color} flex={props.flex}>
      <span>{props.children}</span>
    </MealBoxWrapper>
  );
};

const foodToString = (food: Food): string =>
  food.food + (food.isStock ? " (ス)" : "");

const KondateItem = (props: { meal: Meal }) => {
  return (
    <div style={{ display: "block", marginBottom: "3px" }}>
      <div style={{ display: "flex" }}>
        <MealBox color={"#FFFFCC"}>{foodToString(props.meal.c)}</MealBox>
        <MealBox color={"#FFEEFF"}>{foodToString(props.meal.p)}</MealBox>
      </div>
      <div style={{ display: "flex" }}>
        <MealBox color={"#99FF99"}>{foodToString(props.meal.v[0])}</MealBox>
        <MealBox color={"#99FF99"}>{foodToString(props.meal.v[1])}</MealBox>
      </div>
    </div>
  );
};

export const KondateTable = (props: {
  kondate: Kondate;
  weekdays: string[];
}) => {
  return (
    <div style={{ display: "flex" }}>
      {props.kondate.map((day, i) => (
        <>
          <div style={{ marginRight: "3px" }}>
            <div style={{ textAlign: "center" }}>{props.weekdays[i]}</div>
            {day.meals.map((meal, j) =>
              i === 0 ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div> {j === 0 ? "🌅" : "🌞"} </div>
                  <KondateItem meal={meal} />
                </div>
              ) : (
                <KondateItem meal={meal} />
              )
            )}
            {day.newFood &&
              (i === 0 ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>新</div>
                  <MealBox color={"#e0ffff"} flex="1">
                    {day.newFood}
                  </MealBox>
                </div>
              ) : (
                <MealBox color={"#e0ffff"}>{day.newFood}</MealBox>
              ))}
          </div>
        </>
      ))}
    </div>
  );
};
