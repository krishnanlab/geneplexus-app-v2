import type { AnalysisInputs, AnalysisResults } from "@/api/convert";
import Exponential from "@/components/Exponential";
import Table from "@/components/Table";

type Props = {
  inputs: AnalysisInputs;
  results: AnalysisResults;
};

const Predictions = ({ inputs, results }: Props) => {
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
          key: "probability",
          name: "Probability",
          tooltip: "Indicates gene's network-based similarity to input genes",
          filterType: "number",
          render: (cell) => (cell < 0.01 ? <Exponential value={cell} /> : null),
        },
        {
          key: "zScore",
          name: "z-score",
          filterType: "number",
          style: { whiteSpace: "nowrap" },
        },
        {
          key: "pAdjusted",
          name: "p-adjusted",
          filterType: "number",
          style: { whiteSpace: "nowrap" },
        },
      ]}
      rows={results.predictions}
      filename={[inputs.name, "predictions"]}
    />
  );
};

export default Predictions;
