import { Fragment, useEffect, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaMagnifyingGlassChart,
} from "react-icons/fa6";
import { useLocation } from "react-router";
import { submitAnalysis } from "@/api/submit";
import type { AnalysisResults, Input } from "@/api/types";
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

const LoadAnalysis = () => {
  /** get info and state from route */
  const location = useLocation();
  const state = location.state ?? {};
  const input = state.input ? (state.input as Input) : null;

  /** upload results */
  const [upload, setUpload] = useState<AnalysisResults>();
  const [filename, setFilename] = useState("");

  /** query results */
  const {
    data: queryData,
    status: queryStatus,
    query: runSubmitAnalysis,
  } = useQuery(async () => await submitAnalysis(input!), input);

  useEffect(() => {
    /** submit query once on mounted, if appropriate */
    if (input && queryStatus === "idle") runSubmitAnalysis();
  }, [input, queryStatus, runSubmitAnalysis]);

  /** results */
  const results = upload ?? queryData;

  return (
    <>
      <Meta title="Load Analysis" />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          Load Analysis
        </Heading>

        <div className="flex-row gap-sm">
          {results && (
            <Button
              text="Download"
              icon={<FaArrowDown />}
              design="accent"
              tooltip="Save results to your device"
              onClick={() => {
                const filename = window.prompt("Choose a filename:");
                if (filename) downloadJson(results, filename);
              }}
            />
          )}
          <UploadButton
            accept="application/json"
            text="Upload"
            icon={<FaArrowUp />}
            design="accent"
            tooltip="Upload previously saved results"
            onUpload={async (file, filename) => {
              const text = await file.text();
              try {
                const json = JSON.parse(text) as AnalysisResults;
                setUpload(json);
                setFilename(filename);
              } catch (error) {
                toast("Error parsing file", "error");
              }
            }}
          />
          {filename}
        </div>

        {/* placeholder results display */}
        {results && (
          <div className="mini-table">
            {Object.entries(results).map(([key, value]) => (
              <Fragment key={key}>
                <span>{key}</span>
                <span>
                  {formatNumber(Array.isArray(value) ? value.length : value)}
                </span>
              </Fragment>
            ))}
          </div>
        )}

        {queryStatus === "loading" && (
          <Alert type="loading">
            Processing analysis. This may take a minute or so.
          </Alert>
        )}
        {queryStatus === "error" && (
          <Alert type="error">Error processing analysis.</Alert>
        )}
      </Section>
    </>
  );
};

export default LoadAnalysis;
