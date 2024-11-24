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
          render: RenderEntrez,
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

/** render entrez id with link-out */
export const RenderEntrez = (id: string) =>
  id ? (
    <Link to={`https://www.ncbi.nlm.nih.gov/gene/${id}`}>{id}</Link>
  ) : (
    <Mark type="error">Failed</Mark>
  );

/** render other id with link-out */
export const RenderID = (id: string) => {
  let link = "";
  if (id.startsWith("GO:"))
    link = `https://amigo.geneontology.org/amigo/term/${id}`;
  if (id.startsWith("DOID:")) link = `https://disease-ontology.org/?id=${id}`;
  if (["MONDO:", "HP:", "MP:"].some((prefix) => id.startsWith(prefix)))
    link = `https://monarchinitiative.org/${id}`;
  return <Link to={link}>{id}</Link>;
};
