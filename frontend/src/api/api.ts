import { api, request } from "@/api";
import {
  revertInput,
  type _AnalysisResults,
  type _ConvertIds,
  type AnalysisInput,
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

  /** map "couldn't convert" status to easier-to-work-with value */
  for (const row of response.df_convert_out)
    if (row["Entrez ID"].match(/Could Not be mapped to Entrez/i))
      row["Entrez ID"] = "";

  /** transform response into format more convenient for UI */
  const transformed = {
    count: response.input_count,
    success: response.df_convert_out.filter((row) => row["Entrez ID"]).length,
    error: response.df_convert_out.filter((row) => !row["Entrez ID"]).length,
    summary: response.table_summary.map((row) => ({
      network: row.Network,
      positiveGenes: row.PositiveGenes,
      totalGenes: row.NetworkGenes,
    })),
    table: response.df_convert_out.map((row) => ({
      input: row["Original ID"],
      entrez: row["Entrez ID"],
      biogrid: row["In BioGRID?"] === "Y",
      imp: row["In IMP?"] === "Y",
      string: row["In STRING?"] === "Y",
    })),
  };

  return transformed;
};

/** submit analysis */
export const submitAnalysis = async (input: AnalysisInput) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const params = revertInput(input);
  const response = await request<_AnalysisResults>(`${api}/gpz-ml`, undefined, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  return response;
};
