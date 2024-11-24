import type { ReactNode } from "react";
import clsx from "clsx";
import type { AnalysisInputs } from "@/api/convert";
import Link from "@/components/Link";
import { carve } from "@/util/array";
import { formatNumber } from "@/util/string";
import classes from "./AnalysisCard.module.css";

type Props = {
  inputs: AnalysisInputs;
  children: ReactNode;
};

/** summary card for analysis inputs */
const AnalysisCard = ({ inputs, children }: Props) => {
  return (
    <Link
      to="/analysis"
      state={{ inputs }}
      className={clsx(classes.card, "card")}
      showArrow={false}
    >
      <div className="mini-table">
        <span>Name</span>
        <span>{inputs.name}</span>
        <span>Genes ({formatNumber(inputs.genes.length)})</span>
        <span>{carve(inputs.genes, 6).join(" ")}</span>
        <span>Train Species</span>
        <span>{inputs.speciesTrain}</span>
        <span>Result Species</span>
        <span>{inputs.speciesResult}</span>
        <span>Network</span>
        <span>{inputs.network}</span>
        <span>Geneset Ctx.</span>
        <span>{inputs.genesetContext}</span>
      </div>
      {children}
    </Link>
  );
};

export default AnalysisCard;
