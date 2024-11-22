import type { AnalysisInputs, AnalysisResults } from "@/api/convert";
import Mark, { YesNo } from "@/components/Mark";
import Table from "@/components/Table";

type Props = {
  inputs: AnalysisInputs;
  results: AnalysisResults;
};

const InputGenes = ({ inputs, results }: Props) => {
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
          key: "name",
          name: "Name",
        },
        {
          key: "inNetwork",
          name: "In Network",
          render: YesNo,
          filterType: "boolean",
        },
      ]}
      rows={results.inputGenes}
      filename={[inputs.name, "input genes"]}
    />
  );
};

export default InputGenes;
