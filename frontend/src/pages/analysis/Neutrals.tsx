import type { AnalysisResults } from "@/api/convert";
import Table from "@/components/Table";
import { formatNumber } from "@/util/string";

type Props = {
  results: AnalysisResults;
};

const Neutrals = ({ results }: Props) => {
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
      />
    </>
  );
};

export default Neutrals;
