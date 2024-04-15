import { useState } from "react";
import { FaArrowRightToBracket, FaEye, FaTable } from "react-icons/fa6";
import type { AnalysisInputs, AnalysisResults } from "@/api/types";
import Heading from "@/components/Heading";
import Mark from "@/components/Mark";
import Section from "@/components/Section";
import Table from "@/components/Table";
import Tabs, { Tab } from "@/components/Tabs";
import { YesNo } from "@/pages/NewAnalysis";
import { formatNumber } from "@/util/string";
import classes from "./Inputs.module.css";

type Props = {
  inputs?: AnalysisInputs;
  results?: AnalysisResults;
};

/** max input genes to show by default */
const limit = 50;

const Inputs = ({ inputs, results }: Props) => {
  /** show all genes */
  const [showAllGenes, setShowAllGenes] = useState(false);

  return (
    <Section>
      <Heading level={2} icon={<FaArrowRightToBracket />}>
        Inputs
      </Heading>

      <Tabs>
        {inputs && (
          <Tab text="Summary" icon={<FaEye />} className={classes.summary}>
            <div className="mini-table">
              <span>Name</span>
              <span>{inputs.name}</span>
              <span>Species Train</span>
              <span>{inputs.speciesTrain}</span>
              <span>Species Test</span>
              <span>{inputs.speciesTest}</span>
              <span>Network</span>
              <span>{inputs.network}</span>
              <span>Geneset Context</span>
              <span>{inputs.genesetContext}</span>
            </div>

            <div className="mini-table">
              <span>Genes ({formatNumber(inputs.genes.length)})</span>
              <span className={classes["genes-list"]}>
                {inputs.genes
                  .slice(0, showAllGenes ? Infinity : limit)
                  .map((gene, index) => (
                    <span key={index}>{gene}</span>
                  ))}
                {inputs.genes.length > limit && (
                  <button onClick={() => setShowAllGenes(!showAllGenes)}>
                    {showAllGenes ? "< show less" : "... show all"}
                  </button>
                )}
              </span>
            </div>
          </Tab>
        )}

        {results && (
          <Tab text="Detailed" icon={<FaTable />}>
            <Table
              cols={[
                {
                  key: "input",
                  name: "Input ID",
                  filterable: true,
                  filterType: "string",
                },
                {
                  key: "entrez",
                  name: "Entrez ID",
                  filterable: true,
                  filterType: "string",
                  render: (cell) => cell || <Mark type="error">Failed</Mark>,
                },
                {
                  key: "inNetwork",
                  name: "In Network",
                  render: YesNo,
                  filterable: true,
                  filterType: "boolean",
                },
              ]}
              rows={results.inputGenes}
            />
          </Tab>
        )}
      </Tabs>
    </Section>
  );
};

export default Inputs;
