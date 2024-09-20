import { useEffect } from "react";
import { BiCopy } from "react-icons/bi";
import {
  FaChartBar,
  FaCircleMinus,
  FaDna,
  FaDownload,
  FaFeatherPointed,
  FaMagnifyingGlassChart,
} from "react-icons/fa6";
import { LuLightbulb } from "react-icons/lu";
import { PiGraphBold } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router";
import { submitAnalysis } from "@/api/api";
import type { AnalysisInputs, AnalysisResults } from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import Tabs, { Tab } from "@/components/Tabs";
import InputGenes from "@/pages/analysis/InputGenes";
import Inputs from "@/pages/analysis/Inputs";
import Network from "@/pages/analysis/Network";
import Neutrals from "@/pages/analysis/Neutrals";
import Predictions from "@/pages/analysis/Predictions";
import Similarities from "@/pages/analysis/Similarities";
import Summary from "@/pages/analysis/Summary";
import { saveRecent } from "@/pages/LoadAnalysis";
import { setInputs } from "@/pages/NewAnalysis";
import { scrollTo, waitFor } from "@/util/dom";
import { downloadJson } from "@/util/download";
import { useQuery } from "@/util/hooks";

const AnalysisPage = () => {
  const navigate = useNavigate();

  /** get info and state from route */
  const location = useLocation();
  const state = location.state ?? {};
  const stateInputs = state.inputs as AnalysisInputs | undefined;
  const stateResults = state.results as AnalysisResults | undefined;

  /** query results */
  const {
    data: queryData,
    status: queryStatus,
    query: runQuery,
  } = useQuery(async () => await submitAnalysis(stateInputs!), stateInputs);

  useEffect(() => {
    /** submit query once on mounted, if needed */
    if (stateInputs && !stateResults && queryStatus === "empty") runQuery();
  }, [stateInputs, stateResults, queryStatus, runQuery]);

  /** scroll down to check section after entering genes */
  useEffect(() => {
    if (queryStatus === "loading") scrollTo("#results");
  }, [queryStatus]);

  /** "final" input and results */
  const inputs = stateInputs;
  const results = queryData ?? stateResults;

  /** if no analysis inputs or results, redirect */
  useEffect(() => {
    if (!inputs && !results) navigate("/load-analysis", { replace: true });
  });

  /** save recent analysis inputs */
  useEffect(() => {
    if (inputs) saveRecent(inputs);
  }, [inputs]);

  return (
    <>
      <Meta title="Analysis" />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          Analysis
        </Heading>

        <Flex>
          {inputs && results && (
            <Button
              text="Download"
              icon={<FaDownload />}
              tooltip="Save analysis (inputs + results) to your device"
              onClick={() =>
                downloadJson(
                  { inputs, results },
                  inputs?.name ||
                    window.prompt("Choose a filename:") ||
                    "analysis",
                )
              }
            />
          )}
          {inputs && (
            <Button
              text="Duplicate and Edit"
              icon={<FaFeatherPointed />}
              tooltip={`Go back to "New Analysis" page, make changes to inputs, and re-submit`}
              onClick={async () => {
                await navigate("/new-analysis");
                /** wait for new analysis page component to mount */
                await waitFor("#submit-analysis");
                setInputs(inputs);
              }}
            />
          )}
        </Flex>
      </Section>

      {inputs && <Inputs inputs={inputs} />}

      {((inputs && results) || queryStatus !== "empty") && (
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

          {inputs && results && (
            <>
              <Summary results={results} />
              <Tabs defaultValue="predictions" syncWithUrl="results">
                <Tab
                  text="Input Genes"
                  icon={<FaDna />}
                  tooltip="More details about input genes"
                >
                  <InputGenes results={results} />
                </Tab>

                <Tab
                  text="Predictions"
                  icon={<LuLightbulb />}
                  tooltip="Predication probability of genes"
                >
                  <Predictions results={results} />
                </Tab>

                <Tab
                  text="Similarities"
                  icon={<BiCopy />}
                  tooltip="Similarity of input genes with biological processes and diseases"
                >
                  <Similarities results={results} />
                </Tab>

                <Tab
                  text="Network"
                  icon={<PiGraphBold />}
                  tooltip="Network visualization of top predicted genes"
                >
                  <Network inputs={inputs} results={results} />
                </Tab>

                <Tab
                  text="Neutrals"
                  icon={<FaCircleMinus />}
                  tooltip="Info on how neutral genes were selected"
                >
                  <Neutrals results={results} />
                </Tab>
              </Tabs>
            </>
          )}
        </Section>
      )}
    </>
  );
};

export default AnalysisPage;
