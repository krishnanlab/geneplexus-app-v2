import type { AnalysisResults } from "@/api/types";
import Exponential from "@/components/Exponential";
import Link from "@/components/Link";
import Table from "@/components/Table";

type Props = {
  results: AnalysisResults;
};

const Similarities = ({ results }: Props) => {
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
            key: "id",
            name: "ID",
            render: (cell) => {
              let link = "";
              if (cell.startsWith("GO:"))
                link = `https://amigo.geneontology.org/amigo/term/GO%3A${cell}`;
              if (cell.startsWith("DOID:"))
                link = `https://disease-ontology.org/?id=DOID%3A${cell}`;
              return <Link to={link}>{cell}</Link>;
            },
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
            key: "task",
            name: "Task",
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
      />{" "}
    </>
  );
};

export default Similarities;
