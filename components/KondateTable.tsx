import { isHoliday } from "@holiday-jp/holiday_jp";
import { getDay } from "date-fns";
import format from "date-fns/format";
import styled from "styled-components";
import { Food, Meal, type Kondate } from "../models/Kondate";
import { colors } from "../ui";

const MealBoxWrapper = styled.div<{
  row?: string | number;
  column?: string | number;
  color: string;
  flex?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  text-align: center
  overflow: hidden;
  border: solid 1px white;
  background-color: ${(props) => props.color};
  grid-row: ${(props) => props.row};
  grid-column: ${(props) => props.column};
`;

const MealBox = (props: {
  color: string;
  children: React.ReactElement | string;
  row?: string | number;
  column?: string | number;
  flex?: string;
}) => {
  return (
    <MealBoxWrapper
      color={props.color}
      flex={props.flex}
      row={props.row}
      column={props.column}
    >
      <span>{props.children}</span>
    </MealBoxWrapper>
  );
};

const foodToString = (food: Food): string =>
  food.food + (food.isStock ? " (ス)" : "");

const KondateItem = (props: { meal: Meal }) => {
  return (
    <div style={{ display: "grid", marginBottom: "3px" }}>
      <MealBox color={colors.carbon} row={1} column={"1 / 4"}>
        {foodToString(props.meal.c)}
      </MealBox>
      <MealBox color={colors.protein} row={1} column={"4 / 7"}>
        {foodToString(props.meal.p)}
      </MealBox>
      {props.meal.v.map((v, i) => (
        <MealBox
          color={colors.vitamin}
          key={i}
          row={2}
          column={`${2 * i + 1} / ${2 * i + 3}`}
        >
          {foodToString(props.meal.v[i])}
        </MealBox>
      ))}
    </div>
  );
};

const timeEmoji = ["🌅", "🌞", "🌇"];
const formatDate = (d: Date) => format(d, "MM/dd (eee)");

const Td = styled.td`
  text-align: center;
`;

const Th = styled.td`
  text-align: center;
`;

export const KondateTable = (props: { kondate: Kondate }) => {
  return (
    <table>
      <tr>
        <Td />
        {props.kondate.map((k, i) => (
          <Th
            key={i}
            style={{
              color:
                isHoliday(k.date) ||
                getDay(k.date) === 0 ||
                getDay(k.date) === 6
                  ? "red"
                  : undefined,
            }}
          >
            {formatDate(k.date)}
          </Th>
        ))}
      </tr>
      {timeEmoji.map((te, i) => (
        <tr key={i}>
          <Th>{te}</Th>
          {props.kondate.map((k) => {
            const meal = k.meals[i];
            return meal != null ? (
              <Td>
                <KondateItem meal={meal} />{" "}
              </Td>
            ) : (
              <Td>ごはんなし</Td>
            );
          })}
        </tr>
      ))}
      <tr>
        <Th>新食材</Th>
        {props.kondate.map((k, i) => (
          <Td key={i}>
            {k.newFood != null ? (
              <MealBox color={colors[k.newFood.kind]} flex="1">
                {k.newFood.name}
              </MealBox>
            ) : (
              "なし"
            )}
          </Td>
        ))}
      </tr>
    </table>
  );
};
