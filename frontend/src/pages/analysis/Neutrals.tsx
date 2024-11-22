import type { AnalysisInputs, AnalysisResults } from "@/api/convert";
import Table from "@/components/Table";
import { formatNumber } from "@/util/string";

type Props = {
  inputs: AnalysisInputs;
  results: AnalysisResults;
};

const Neutrals = ({ inputs, results }: Props) => {
  return (
    <>
      <div>Total: {formatNumber(results.neutralInfo.all.length)}</div>
      <Table
        cols={[
          {
            key: "Id",
            name: "ID",
          },
          {
            key: "Name",
            name: "Name",
          },
          {
            key: "Task",
            name: "Task",
          },
          {
            key: "Genes",
            name: "Genes",
          },
        ]}
        rows={results.neutralInfo.sets}
        filename={[inputs.name, "neutrals"]}
      />
    </>
  );
};

export default Neutrals;
