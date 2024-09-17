import type { AnalysisResults } from "@/api/types";
import Mark, { YesNo } from "@/components/Mark";
import Table from "@/components/Table";

type Props = {
  results: AnalysisResults;
};

const InputGenes = ({ results }: Props) => {
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
        {
          key: "name",
          name: "Gene",
        },
      ]}
      rows={results.inputGenes}
    />
  );
};

export default InputGenes;
