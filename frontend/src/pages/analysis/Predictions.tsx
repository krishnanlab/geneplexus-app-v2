import type { AnalysisResults } from "@/api/types";
import Table from "@/components/Table";
import { formatNumber } from "@/util/string";

type Props = {
  results: AnalysisResults;
};

const Predictions = ({ results }: Props) => {
  return (
    <Table
      cols={[
        {
          key: "rank",
          name: "Rank",
          filterType: "number",
        },
        {
          key: "probability",
          name: "Probability",
          tooltip: "Indicates gene's network-based similarity to input genes",
          filterType: "number",
          render: (cell) =>
            cell < 0.01 ? Exponential(cell) : formatNumber(cell),
        },
        {
          key: "entrez",
          name: "Entrez",
        },
        {
          key: "symbol",
          name: "Symbol",
        },
        {
          key: "name",
          name: "Name",
          style: { minWidth: "400px", maxWidth: "400px" },
        },

        {
          key: "knownNovel",
          name: "Known/Novel",
          tooltip:
            "Indicates whether gene was part of input gene list (therefore Known) or not (therefore Novel)",
          filterType: "enum",
        },
        {
          key: "classLabel",
          name: "Class Label",
          tooltip:
            "Whether gene was considered in positive/negative class or not considered at all during training",
          filterType: "enum",
          render: (cell) =>
            ({ P: "Positive", N: "Negative", U: "Neutral" })[cell],
          style: { whiteSpace: "nowrap" },
        },
      ]}
      rows={results.predictions}
    />
  );
};

export default Predictions;

/** number as exponential */
export const Exponential = (value: number) => {
  const number = value.toExponential();
  const mantissa = Number(number.split("e")[0]);
  const exponent = Number(number.split("e")[1]);
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      {mantissa.toFixed(2)} &times; 10<sup>{exponent}</sup>
    </span>
  );
};
