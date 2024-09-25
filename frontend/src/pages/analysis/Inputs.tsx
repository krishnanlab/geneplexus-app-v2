import { FaArrowRightToBracket } from "react-icons/fa6";
import type { AnalysisInputs } from "@/api/types";
import Heading from "@/components/Heading";
import Section from "@/components/Section";
import { formatNumber } from "@/util/string";
import classes from "./Inputs.module.css";

type Props = {
  inputs: AnalysisInputs;
};

const Inputs = ({ inputs }: Props) => {
  return (
    <Section>
      <Heading level={2} icon={<FaArrowRightToBracket />}>
        Inputs
      </Heading>

      <div className={classes.summary}>
        <div className="mini-table">
          <span>Name</span>
          <span>{inputs.name}</span>
          <span>Train Species</span>
          <span>{inputs.speciesTrain}</span>
          <span>Test Species</span>
          <span>{inputs.speciesTest}</span>
          <span>Network</span>
          <span>{inputs.network}</span>
          <span>Geneset Ctx.</span>
          <span>{inputs.genesetContext}</span>
        </div>

        <div className="mini-table cols-1">
          <span>Genes ({formatNumber(inputs.genes.length)})</span>
          <span className={classes["genes-list"]}>
            {inputs.genes.map((gene, index) => (
              <span key={index}>{gene}</span>
            ))}
          </span>
        </div>

        <div className="mini-table cols-1">
          <span>Negatives ({formatNumber(inputs.negatives.length)})</span>
          <span className={classes["genes-list"]}>
            {inputs.negatives.map((gene, index) => (
              <span key={index}>{gene}</span>
            ))}
          </span>
        </div>
      </div>
    </Section>
  );
};

export default Inputs;
