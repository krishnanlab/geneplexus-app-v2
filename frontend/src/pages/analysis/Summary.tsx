import type { AnalysisResults } from "@/api/types";
import Help from "@/components/Help";
import { formatNumber } from "@/util/string";

type Props = {
  results: AnalysisResults;
};

const Summary = ({ results }: Props) => {
  return (
    <div className="mini-table">
      {results.crossValidation.some((value) => value !== -10) && (
        <>
          <span>
            <Help
              tooltip={
                <>
                  <div>
                    In terms of{" "}
                    <code>
                      log<sub>2</sub>(auPRC/prior)
                    </code>
                    .
                  </div>
                  <div>
                    If number of genes in positive class &gt; 15, reports fold
                    change of area under precision-recall curve (auPRC) over
                    prior auPRC expected by random chance. For example, value of
                    1 indicates that model performs twice as well as random
                    ranking of genes.
                  </div>
                </>
              }
            />
            3-fold cross validation
          </span>
          <span>
            {results.crossValidation
              .map((value) =>
                typeof value === "number" ? value.toFixed(2) : "?",
              )
              .join(", ")}
          </span>
        </>
      )}
      <span>
        <Help tooltip="Genes considered positive matches in the network" />
        Positive Genes
      </span>
      <span>{formatNumber(results.positiveGenes)}</span>
    </div>
  );
};

export default Summary;
