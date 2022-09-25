import format from "date-fns/format";
import styled from "styled-components";
import { Food, Meal, type Kondate } from "../models/Kondate";
import { colors } from "../ui";

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
        <MealBox color={colors.carbon}>{foodToString(props.meal.c)}</MealBox>
        <MealBox color={colors.protein}>{foodToString(props.meal.p)}</MealBox>
      </div>
      <div style={{ display: "flex" }}>
        <MealBox color={colors.vitamin}>
          {foodToString(props.meal.v[0])}
        </MealBox>
        <MealBox color={colors.vitamin}>
          {foodToString(props.meal.v[1])}
        </MealBox>
      </div>
    </div>
  );
};

const timeEmoji = ["🌅", "🌞", "🌇"];
const formatDate = (d: Date) => format(d, "MM/dd (eee)");

export const KondateTable = (props: { kondate: Kondate }) => {
  return (
    <div style={{ display: "flex" }}>
      {props.kondate.map((day, i) => (
        <>
          <div style={{ marginRight: "3px" }}>
            <div style={{ textAlign: "center" }}>{formatDate(day.date)}</div>
            {day.meals.map((meal, j) =>
              meal != null ? (
                i === 0 ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div> {timeEmoji[j]} </div>
                    <KondateItem meal={meal} />
                  </div>
                ) : (
                  <KondateItem meal={meal} />
                )
              ) : (
                <div />
              )
            )}
            {day.newFood &&
              (i === 0 ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>新</div>
                  <MealBox color={colors[day.newFood.kind]} flex="1">
                    {day.newFood.name}
                  </MealBox>
                </div>
              ) : (
                <MealBox color={colors[day.newFood.kind]}>
                  {day.newFood.name}
                </MealBox>
              ))}
          </div>
        </>
      ))}
    </div>
  );
};
