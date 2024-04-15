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

/** convert input list of genes into entrez */
export const convertGeneIds = async (
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

/** submit analysis */
export const submitAnalysis = async (input: AnalysisInputs) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const params = revertAnalysisInputs(input);
  const response = await request<_AnalysisResults>(`${api}/gpz-ml`, undefined, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  return convertAnalysisResults(response);
};
