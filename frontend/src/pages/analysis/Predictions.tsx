import type { AnalysisResults } from "@/api/types";
import Exponential from "@/components/Exponential";
import Table from "@/components/Table";

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
          render: (cell) => (cell < 0.01 ? <Exponential value={cell} /> : null),
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
          style: { whiteSpace: "nowrap" },
        },
        {
          key: "zScore",
          name: "z-score",
          style: { whiteSpace: "nowrap" },
        },
        {
          key: "pAdjusted",
          name: "p-adjusted",
          style: { whiteSpace: "nowrap" },
        },
      ]}
      rows={results.predictions}
    />
  );
};

export default Predictions;
