import type { AnalysisInputs, AnalysisResults } from "@/api/convert";
import Link from "@/components/Link";
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
          render: (cell) =>
            cell ? (
              <Link to={`https://www.ncbi.nlm.nih.gov/gene/${cell}`}>
                {cell}
              </Link>
            ) : (
              <Mark type="error">Failed</Mark>
            ),
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
