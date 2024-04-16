import { useState } from "react";
import { FaArrowRightToBracket } from "react-icons/fa6";
import type { AnalysisInputs } from "@/api/types";
import Heading from "@/components/Heading";
import Section from "@/components/Section";
import { formatNumber } from "@/util/string";
import classes from "./Inputs.module.css";

type Props = {
  inputs: AnalysisInputs;
};

/** max input genes to show by default */
const limit = 50;

const Inputs = ({ inputs }: Props) => {
  /** show all genes */
  const [showAllGenes, setShowAllGenes] = useState(false);

  return (
    <Section>
      <Heading level={2} icon={<FaArrowRightToBracket />}>
        Inputs
      </Heading>

      <div className={classes.summary}>
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
      </div>
    </Section>
  );
};

export default Inputs;
