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
          style: { minWidth: "400px" },
        },
        {
          key: "probability",
          name: "Probability",
          filterType: "number",
          render: (cell) => formatNumber(cell * 100) + "%",
        },
        {
          key: "knownNovel",
          name: "Known/Novel",
          filterType: "enum",
        },
        {
          key: "classLabel",
          name: "Class Label",
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
