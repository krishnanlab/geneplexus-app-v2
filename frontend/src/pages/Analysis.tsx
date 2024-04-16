import { useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaChartBar,
  FaDna,
  FaMagnifyingGlassChart,
} from "react-icons/fa6";
import { LuLightbulb } from "react-icons/lu";
import { useLocation } from "react-router";
import { submitAnalysis } from "@/api/api";
import {
  convertAnalysisInputs,
  convertAnalysisResults,
  type _AnalysisResults,
  type AnalysisInputs,
} from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import Tabs, { Tab } from "@/components/Tabs";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";
import ConvertedIds from "@/pages/analysis/ConvertedIds";
import Inputs from "@/pages/analysis/Inputs";
import Predictions from "@/pages/analysis/Predictions";
import { downloadJson } from "@/util/download";
import { useQuery } from "@/util/hooks";

const Analysis = () => {
  /** get info and state from route */
  const location = useLocation();
  const state = location.state ?? {};
  const stateInput = state.inputs as AnalysisInputs | undefined;

  /** query results */
  const {
    data: queryData,
    status: queryStatus,
    query: runQuery,
    reset: resetQuery,
  } = useQuery(async () => await submitAnalysis(stateInput!), stateInput);

  /** upload results */
  const [upload, setUpload] = useState<_AnalysisResults>();
  const uploadInput = upload ? convertAnalysisInputs(upload.inputs) : undefined;
  const uploadResults = upload ? convertAnalysisResults(upload) : undefined;

  /** submit query once on mounted, if appropriate */
  if (!uploadInput && stateInput && queryStatus === "idle") runQuery();

  /** "final" input and results */
  const inputs = uploadInput ?? stateInput;
  const results = uploadResults ?? queryData;

  return (
    <>
      <Meta title="Analysis" />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          Analysis
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
                  inputs?.name ||
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
                json.inputs.name ??= filename;
                setUpload(json);
                resetQuery();
              } catch (error) {
                toast("Error parsing file", "error");
              }
            }}
          />
        </div>
      </Section>

      {inputs && <Inputs inputs={inputs} />}

      {(!!results || queryStatus !== "idle") && (
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

          {results && (
            <Tabs>
              <Tab text="Converted IDs" icon={<FaDna />}>
                <ConvertedIds results={results} />
              </Tab>

              <Tab text="Predictions" icon={<LuLightbulb />}>
                <Predictions results={results} />
              </Tab>
            </Tabs>
          )}
        </Section>
      )}
    </>
  );
};

export default Analysis;
