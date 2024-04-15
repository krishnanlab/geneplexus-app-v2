import { useEffect, useState } from "react";
import {
  FaArrowDown,
  FaArrowRightToBracket,
  FaArrowUp,
  FaChartBar,
  FaMagnifyingGlassChart,
} from "react-icons/fa6";
import { useLocation } from "react-router";
import { submitAnalysis } from "@/api/api";
import {
  convertInput,
  type _AnalysisResults,
  type AnalysisInput,
} from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";
import { downloadJson } from "@/util/download";
import { useQuery } from "@/util/hooks";
import { formatNumber } from "@/util/string";
import classes from "./Analysis.module.css";

const Analysis = () => {
  /** get info and state from route */
  const location = useLocation();
  const state = location.state ?? {};
  const stateInput = state.input as AnalysisInput | undefined;

  /** query results */
  const {
    data: queryData,
    status: queryStatus,
    query: runSubmitAnalysis,
  } = useQuery(async () => await submitAnalysis(stateInput!), stateInput);

  useEffect(() => {
    /** submit query once on mounted, if appropriate */
    if (stateInput && queryStatus === "idle") runSubmitAnalysis();
  }, [stateInput, queryStatus, runSubmitAnalysis]);

  /** upload results */
  const [upload, setUpload] = useState<_AnalysisResults>();
  const uploadInput = upload ? convertInput(upload.input) : undefined;

  const input = uploadInput ?? stateInput;
  const results = upload ?? queryData;

  /** show all genes */
  const [showAllGenes, setShowAllGenes] = useState(false);

  console.log(input);

  return (
    <>
      <Meta title={input?.name || "Analysis"} />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          {input?.name || "Analysis"}
        </Heading>

        <div className="flex-row gap-sm">
          {results && (
            <Button
              text="Download"
              icon={<FaArrowDown />}
              design="accent"
              tooltip="Save analysis to your device"
              onClick={() =>
                downloadJson(
                  results,
                  input?.name ||
                    window.prompt("Choose a filename:") ||
                    "analysis",
                )
              }
            />
          )}
          <UploadButton
            accept="application/json"
            text="Upload"
            icon={<FaArrowUp />}
            design="accent"
            tooltip="Upload previously saved analysis"
            onUpload={async (file, filename) => {
              const text = await file.text();
              try {
                const json = JSON.parse(text) as _AnalysisResults;
                json.input.name ??= filename;
                setUpload(json);
              } catch (error) {
                toast("Error parsing file", "error");
              }
            }}
          />
        </div>
      </Section>

      {input && (
        <Section>
          <Heading level={2} icon={<FaArrowRightToBracket />}>
            Inputs
          </Heading>

          <div className={classes.inputs}>
            <div className="mini-table">
              <span>Species Train</span>
              <span>{input.speciesTrain}</span>
              <span>Species Test</span>
              <span>{input.speciesTest}</span>
              <span>Network</span>
              <span>{input.network}</span>
              <span>Geneset Context</span>
              <span>{input.genesetContext}</span>
            </div>

            <div className="mini-table">
              <span>Genes ({formatNumber(input.genes.length)})</span>
              <span className={classes["genes-list"]}>
                {input.genes
                  .slice(0, showAllGenes ? Infinity : 10)
                  .map((gene, index) => (
                    <span key={index}>{gene}</span>
                  ))}
                {input.genes.length > 10 && (
                  <button onClick={() => setShowAllGenes(!showAllGenes)}>
                    {showAllGenes ? "Show Less" : "Show All"}
                  </button>
                )}
              </span>
            </div>
          </div>
        </Section>
      )}

      {results && (
        <Section>
          <Heading level={2} icon={<FaChartBar />}>
            Results
          </Heading>

          {queryStatus === "loading" && (
            <Alert type="loading">
              Processing analysis. This may take a minute or so.
            </Alert>
          )}
          {queryStatus === "error" && (
            <Alert type="error">Error processing analysis.</Alert>
          )}
        </Section>
      )}
    </>
  );
};

export default Analysis;
