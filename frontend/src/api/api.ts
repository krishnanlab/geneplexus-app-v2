import { api, request } from "@/api";
import {
  convertAnalysisResults,
  convertConvertIds,
  revertAnalysisInputs,
  type AnalysisInputs,
} from "@/api/convert";
import {
  type _AnalysisResults,
  type _ConvertIdsInputs,
  type _ConvertIdsResults,
} from "@/api/types";

/** check input list of genes. convert to entrez, check if in-network, etc. */
export const checkGenes = async (params: _ConvertIdsInputs) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const response = await request<_ConvertIdsResults>(
    `${api}/gpz-convert-ids`,
    undefined,
    { method: "POST", headers, body: JSON.stringify(params) },
  );
  return convertConvertIds(response);
};

/** submit full analysis */
export const submitAnalysis = async (inputs: AnalysisInputs) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const params = revertAnalysisInputs(inputs);
  const response = await request<_AnalysisResults>(`${api}/gpz-ml`, undefined, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  return convertAnalysisResults(response);
};
