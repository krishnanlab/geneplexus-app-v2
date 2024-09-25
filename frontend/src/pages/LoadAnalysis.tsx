import {
  FaClockRotateLeft,
  FaMagnifyingGlassChart,
  FaUpload,
  FaXmark,
} from "react-icons/fa6";
import { useNavigate } from "react-router";
import { getDefaultStore, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { isEqual } from "lodash";
import type { Analysis, AnalysisInputs } from "@/api/convert";
import Alert from "@/components/Alert";
import AnalysisCard from "@/components/AnalysisCard";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";
import { formatNumber } from "@/util/string";

const LoadAnalysis = () => {
  const navigate = useNavigate();

  /** analyses recently submitted on this device */
  const getRecentAnalyses = useAtomValue(recentAnalyses);

  return (
    <>
      <Meta title="Load Analysis" />

      <Section>
        <Heading level={1} icon={<FaMagnifyingGlassChart />}>
          Load Analysis
        </Heading>

        <UploadButton
          text="Upload"
          icon={<FaUpload />}
          accept={["application/json", ".json"]}
          tooltip="Upload previously saved analysis. "
          onUpload={async (file, filename) => {
            const text = await file.text();
            try {
              const json = JSON.parse(text) as Analysis;
              json.inputs.name ??= filename;
              /** send inputs and results to analysis page */
              navigate("/analysis", { state: json });
            } catch (error) {
              toast("Error parsing file", "error");
            }
          }}
        />
      </Section>

      <Section>
        <Heading level={2} icon={<FaClockRotateLeft />}>
          Recent Analyses
        </Heading>
        <p className="center">
          Most recent analyses you've submitted on this browser and device.
        </p>
        {getRecentAnalyses?.length ? (
          <div className="grid">
            {getRecentAnalyses.map((inputs, index) => (
              <AnalysisCard key={index} inputs={inputs}>
                <Button
                  tooltip="Forget"
                  icon={<FaXmark />}
                  onClick={(event) => {
                    event.preventDefault();
                    removeRecent(index);
                  }}
                />
              </AnalysisCard>
            ))}
          </div>
        ) : (
          <div className="placeholder">No analyses yet</div>
        )}
        <Alert>
          Only for quick access and convenience. Please rely on the{" "}
          <strong>download feature</strong> for permanently saving analyses.
          <br />
          Only your <strong>
            {formatNumber(recentLimit)} most recent
          </strong>{" "}
          analyses are saved here, and <strong>only their inputs</strong>{" "}
          (you'll need to wait for results to be recalculated).
        </Alert>

        {getRecentAnalyses?.length > 0 && (
          <Button
            design="critical"
            icon={<FaXmark />}
            text="Forget All"
            onClick={clearRecent}
          />
        )}
      </Section>
    </>
  );
};

export default LoadAnalysis;

/** limit to how many analyses can be stored */
const recentLimit = 10;

/** global list of recent analyses */
const recentAnalyses = atomWithStorage<AnalysisInputs[]>("recent-analyses", []);

/** save recent analysis */
export const saveRecent = (analysis: AnalysisInputs) => {
  const list = getDefaultStore().get(recentAnalyses);
  getDefaultStore().set(recentAnalyses, [
    analysis,
    ...list.filter((a) => !isEqual(analysis, a)).slice(0, recentLimit),
  ]);
};

/** remove recent analysis */
export const removeRecent = (index: number) => {
  const list = getDefaultStore().get(recentAnalyses);
  getDefaultStore().set(recentAnalyses, [
    ...list.slice(0, index),
    ...list.slice(index + 1),
  ]);
};

/** remove all recent analyses */
export const clearRecent = () => getDefaultStore().set(recentAnalyses, []);
