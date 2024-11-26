import type { AnalysisInputs, AnalysisResults } from "@/api/convert";
import Exponential from "@/components/Exponential";
import Link from "@/components/Link";
import Table from "@/components/Table";
import { RenderID } from "@/pages/analysis/InputGenes";

type Props = {
  inputs: AnalysisInputs;
  results: AnalysisResults;
};

const Similarities = ({ inputs, results }: Props) => {
  return (
    <>
      <p>
        Network-based ML models trained on sets of genes associated with{" "}
        <Link to="https://geneontology.org/">
          Gene Ontology Biological Process
        </Link>{" "}
        terms or <Link to="https://mondo.monarchinitiative.org/">Mondo</Link>{" "}
        diseases ranked by their similarity to the custom ML model trained on
        the input genes.
      </p>
      <Table
        cols={[
          {
            key: "rank",
            name: "Rank",
            filterType: "number",
          },
          {
            key: "task",
            name: "Task",
          },
          {
            key: "id",
            name: "ID",
            render: RenderID,
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
            render: (cell) =>
              cell < 0.01 ? <Exponential value={cell} /> : null,
          },
        ]}
        rows={results.similarities}
        filename={[inputs.name, "similarities"]}
      />
    </>
  );
};

export default Similarities;
