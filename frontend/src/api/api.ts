import { api, request } from "@/api";
import {
  convertAnalysisResults,
  convertConvertIds,
  revertAnalysisInputs,
  type _AnalysisResults,
  type _ConvertIds,
  type AnalysisInputs,
  type Species,
} from "@/api/types";

/** check input list of genes. convert to entrez, check if in-network, etc. */
export const checkGenes = async (
  genes: string[],
  species: Species = "Human",
) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const params = { genes, species };
  const response = await request<_ConvertIds>(
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
