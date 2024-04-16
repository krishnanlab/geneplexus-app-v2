import type { AnalysisResults } from "@/api/types";
import Mark from "@/components/Mark";
import Table from "@/components/Table";
import { YesNo } from "@/pages/NewAnalysis";

type Props = {
  results: AnalysisResults;
};

const ConvertedIds = ({ results }: Props) => {
  return (
    <Table
      cols={[
        {
          key: "input",
          name: "Input ID",
        },
        {
          key: "entrez",
          name: "Entrez ID",
          render: (cell) => cell || <Mark type="error">Failed</Mark>,
        },
        {
          key: "inNetwork",
          name: "In Network",
          render: YesNo,
          filterType: "boolean",
        },
      ]}
      rows={results.inputGenes}
    />
  );
};

export default ConvertedIds;
