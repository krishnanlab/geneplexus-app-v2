import type { AnalysisResults } from "@/api/types";
import Link from "@/components/Link";
import Table from "@/components/Table";
import { formatNumber } from "@/util/string";

type Props = {
  results: AnalysisResults;
};

const Similarities = ({ results }: Props) => {
  return (
    <Table
      cols={[
        {
          key: "rank",
          name: "Rank",
          filterType: "number",
        },
        {
          key: "id",
          name: "ID",
          render: (cell) => <Link to={cell}>{cell}</Link>,
        },
        {
          key: "name",
          name: "Name",
          style: { minWidth: "400px", maxWidth: "400px" },
        },
        {
          key: "similarity",
          name: "Similarity",
          filterType: "number",
          render: formatNumber,
        },
      ]}
      rows={results.similarities}
    />
  );
};

export default Similarities;
