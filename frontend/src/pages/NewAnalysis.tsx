import { Fragment, useEffect, useState } from "react";
import {
  FaArrowUp,
  FaBacteria,
  FaCheck,
  FaDna,
  FaEye,
  FaFish,
  FaLightbulb,
  FaPerson,
  FaPlus,
  FaTable,
  FaWorm,
  FaXmark,
} from "react-icons/fa6";
import { GiFly, GiRat } from "react-icons/gi";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { convertGeneIds } from "@/api/input";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import type { Option } from "@/components/Select";
import Select from "@/components/Select";
import Table from "@/components/Table";
import Tabs, { Tab } from "@/components/Tabs";
import TextBox from "@/components/TextBox";
import UploadButton from "@/components/UploadButton";
import { scrollTo } from "@/util/dom";
import { formatNumber } from "@/util/string";
import classes from "./NewAnalysis.module.css";

const example =
  "CASP3,CYP1A2,CYP1A1,NFE2L2,CYP2C19,CYP2D6,CYP7A1,NR1H4,TP53,CYP19A1";

const speciesOptions: Option[] = [
  { id: "Human", text: "Human", icon: <FaPerson /> },
  { id: "Mouse", text: "Mouse", icon: <GiRat /> },
  { id: "Fly", text: "Fly", icon: <GiFly /> },
  { id: "Zebrafish", text: "Zebrafish", icon: <FaFish /> },
  { id: "Worm", text: "Worm", icon: <FaWorm /> },
  { id: "Yeast", text: "Yeast", icon: <FaBacteria /> },
] as const;

const NewAnalysis = () => {
  /** raw text list of gene ids */
  const [geneIds, setGeneIds] = useState("");
  const [debouncedGeneIds] = useDebounce(geneIds, 500);

  /** array of gene ids */
  const splitGeneIds = debouncedGeneIds
    .split(/,|\t|\n/)
    .map((id) => id.trim())
    .filter(Boolean);

  /** selected species */
  const [species, setSpecies] = useState<(typeof speciesOptions)[number]>(
    speciesOptions[0]!,
  );

  /** filename when file uploaded */
  const [filename, setFilename] = useState("");

  /** gene id conversion */
  const {
    data: genes,
    isLoading: genesLoading,
    isError: genesError,
  } = useQuery({
    queryKey: ["get-gene-ids", splitGeneIds, species.id],
    queryFn: () => convertGeneIds(splitGeneIds, species.id),
    enabled: !!splitGeneIds.length,
  });

  /** scroll down to section */
  useEffect(() => {
    if (genesLoading || genesError) scrollTo("#review-genes");
  }, [genesLoading, genesError]);

  return (
    <>
      <Meta title="New Analysis" />

      <Section>
        <Heading level={1} icon={<FaPlus />}>
          New Analysis
        </Heading>
      </Section>

      <Section>
        <Heading level={2} icon="1">
          Enter Genes
        </Heading>

        <TextBox
          value={geneIds}
          onChange={(value) => {
            setGeneIds(value);
            setFilename("");
          }}
          multi={true}
          placeholder="Comma, tab, or line-separated list of entrez IDs, symbols, or ensembl gene/protein/transcript IDs"
        />

        <div className="flex-row gap-md">
          <Select
            label="Species"
            layout="horizontal"
            options={speciesOptions}
            value={species}
            onChange={setSpecies}
          />
          <Button
            text="Example"
            icon={<FaLightbulb />}
            design="accent"
            onClick={() => setGeneIds(example)}
          />
          <div className="flex-row gap-sm">
            <UploadButton
              accept="text/plain, text/csv, text/tsv, text/tab-separated-values"
              text="Upload"
              icon={<FaArrowUp />}
              onUpload={async (file, filename) => {
                const text = await file.text();
                setGeneIds(text);
                setFilename(filename);
              }}
            />
            {filename}
          </div>
        </div>
      </Section>

      <Section>
        <Heading level={2} icon="2">
          Review Genes
        </Heading>

        {genes && (
          <Tabs>
            <Tab text="Summary" icon={<FaEye />} className={classes.summary}>
              <FaCheck className={classes.success} />
              <span>
                <strong className={classes.success}>
                  {formatNumber(genes.success)} genes
                </strong>{" "}
                converted to Entrez
              </span>

              {!!genes.error && (
                <>
                  <FaXmark className={classes.error} />
                  <span>
                    <strong className={classes.error}>
                      {formatNumber(genes.error)} genes
                    </strong>{" "}
                    couldn't be converted
                  </span>
                </>
              )}

              <span className={classes.divider} />

              {genes.summary.map((row, index) => (
                <Fragment key={index}>
                  <FaDna />
                  <span>
                    <strong>{formatNumber(row.PositiveGenes)} genes</strong> in{" "}
                    {row.Network} ({formatNumber(row.NetworkGenes, true)})
                  </span>
                </Fragment>
              ))}
            </Tab>

            <Tab text="Detailed" icon={<FaTable />}>
              <Table
                cols={[
                  {
                    key: "original",
                    name: "Original ID",
                    filterable: true,
                    filterType: "string",
                  },
                  {
                    key: "entrez",
                    name: "Entrez ID",
                    filterable: true,
                    filterType: "enum",
                  },
                  {
                    key: "biogrid",
                    name: "In BioGRID",
                    render: YesNo,
                    align: "center",
                    filterable: true,
                    filterType: "boolean",
                  },
                  {
                    key: "imp",
                    name: "In IMP",
                    render: YesNo,
                    align: "center",
                    filterable: true,
                    filterType: "boolean",
                  },
                  {
                    key: "string",
                    name: "In STRING",
                    render: YesNo,
                    align: "center",
                    filterable: true,
                    filterType: "boolean",
                  },
                ]}
                rows={genes.table}
              />
            </Tab>
          </Tabs>
        )}

        {genesLoading && (
          <Alert type="loading">
            Converting {formatNumber(splitGeneIds.length)} genes to Entrez
          </Alert>
        )}
        {genesError && (
          <Alert type="error">Error converting genes to Entrez</Alert>
        )}
      </Section>

      <Section>
        <Heading level={2} icon="3">
          Analysis Questions
        </Heading>
      </Section>

      <Section>
        <Heading level={2} icon="4">
          Review Parameters
        </Heading>
      </Section>

      <Section>
        <Heading level={2} icon="5">
          Submit Analysis
        </Heading>
      </Section>
    </>
  );
};

export default NewAnalysis;

const YesNo = (yes: boolean) => {
  if (yes)
    return (
      <span className="flex-row gap-xs">
        <FaCheck className={classes.success} />
        Yes
      </span>
    );
  else
    return (
      <span className="flex-row gap-xs">
        <FaXmark className={classes.error} />
        No
      </span>
    );
};
