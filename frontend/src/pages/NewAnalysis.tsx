import { Fragment, useEffect, useState } from "react";
import {
  FaArrowUp,
  FaBacteria,
  FaCheck,
  FaDna,
  FaEye,
  FaFish,
  FaLightbulb,
  FaPaperPlane,
  FaPerson,
  FaPlus,
  FaTable,
  FaWorm,
  FaXmark,
} from "react-icons/fa6";
import { GiFly, GiRat } from "react-icons/gi";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import { convertGeneIds } from "@/api/input";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Meta from "@/components/Meta";
import Radios, { type Option as RadioOption } from "@/components/Radios";
import Section from "@/components/Section";
import type { Option as SelectOption } from "@/components/Select";
import Select from "@/components/Select";
import Table from "@/components/Table";
import Tabs, { Tab } from "@/components/Tabs";
import TextBox from "@/components/TextBox";
import UploadButton from "@/components/UploadButton";
import { scrollTo } from "@/util/dom";
import { useQuery } from "@/util/hooks";
import { formatNumber } from "@/util/string";
import classes from "./NewAnalysis.module.css";

const example =
  "CASP3,CYP1A2,CYP1A1,NFE2L2,CYP2C19,CYP2D6,CYP7A1,NR1H4,TP53,CYP19A1";

const speciesOptions: SelectOption[] = [
  { id: "Human", text: "Human", icon: <FaPerson /> },
  { id: "Mouse", text: "Mouse", icon: <GiRat /> },
  { id: "Fly", text: "Fly", icon: <GiFly /> },
  { id: "Zebrafish", text: "Zebrafish", icon: <FaFish /> },
  { id: "Worm", text: "Worm", icon: <FaWorm /> },
  { id: "Yeast", text: "Yeast", icon: <FaBacteria /> },
] as const;

const networkOptions: RadioOption[] = [
  {
    id: "BioGRID",
    primary: "BioGRID",
    secondary: "Physical interactions",
    tertiary: `${formatNumber(19000, true)} nodes`,
  },
  {
    id: "STRING",
    primary: "STRING",
    secondary: "Derived from a variety of sources",
    tertiary: `${formatNumber(17000, true)} nodes`,
  },
  {
    id: "IMP",
    primary: "IMP",
    secondary: "Expression-derived interactions",
    tertiary: `${formatNumber(25000, true)} nodes`,
  },
] as const;

const negativesOptions: RadioOption[] = [
  {
    id: "GO",
    primary: "GO",
    secondary: "Lorem ipsum dolor sit amet",
  },
  {
    id: "Monarch",
    primary: "Monarch",
    secondary: "Lorem ipsum dolor sit amet",
  },
  {
    id: "DisGeNet",
    primary: "DisGeNet",
    secondary: "Lorem ipsum dolor sit amet",
  },
  {
    id: "Combined",
    primary: "Combined",
    secondary: "Lorem ipsum dolor sit amet",
  },
];

const NewAnalysis = () => {
  /** raw text list of gene ids */
  const [geneIds, setGeneIds] = useState("");
  const [debouncedGeneIds] = useDebounce(geneIds, 500);

  /** array of gene ids */
  const splitGeneIds = debouncedGeneIds
    .split(/,|\t|\n/)
    .map((id) => id.trim())
    .filter(Boolean);

  /** filename when file uploaded */
  const [filename, setFilename] = useState("");

  /** selected species */
  const [species, setSpecies] = useState<(typeof speciesOptions)[number]["id"]>(
    speciesOptions[0]!.id,
  );

  /** selected network type */
  const [network, setNetwork] = useState<(typeof networkOptions)[number]["id"]>(
    networkOptions[0]!.id,
  );

  /** selected negative source */
  const [negatives, setNegatives] = useState<
    (typeof negativesOptions)[number]["id"]
  >(negativesOptions[0]!.id);

  /** gene id conversion data */
  const {
    data: geneData,
    status: genesStatus,
    query: runConvertGeneIds,
  } = useQuery(
    async () =>
      splitGeneIds.length
        ? await convertGeneIds(splitGeneIds, species)
        : undefined,
    [splitGeneIds, species],
    false,
  );

  /** converted list of gene ids */
  const genes =
    geneData?.table.map((entry) => entry.entrez).filter(Boolean) || [];

  /** scroll down to section */
  useEffect(() => {
    if (genesStatus !== "idle") scrollTo("#review-genes");
  }, [genesStatus]);

  /** submit analysis */
  const navigate = useNavigate();
  const submitAnalysis = () => {
    if (!genes.length) {
      window.alert("Please enter some genes first!");
      scrollTo("#enter-genes");
      return;
    }
    if (!window.confirm("Submit analysis?")) return;

    navigate("/analysis", {
      state: { genes, species, network, negatives },
    });
  };

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

        <div className="flex-row gap-sm">
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

        <Button
          text="Enter Genes"
          icon={<FaPaperPlane />}
          design="accent"
          tooltip="Converts your genes to Entrez IDs in preparation for analysis."
          onClick={() => splitGeneIds.length && runConvertGeneIds()}
        />
      </Section>

      <Section>
        <Heading level={2} icon="2">
          Review Genes
        </Heading>

        {geneData && (
          <Tabs>
            <Tab text="Summary" icon={<FaEye />} className={classes.summary}>
              <FaCheck className={classes.success} />
              <span>
                <strong className={classes.success}>
                  {formatNumber(geneData.success)} genes
                </strong>{" "}
                converted to Entrez
              </span>

              {!!geneData.error && (
                <>
                  <FaXmark className={classes.error} />
                  <span>
                    <strong className={classes.error}>
                      {formatNumber(geneData.error)} genes
                    </strong>{" "}
                    couldn't be converted
                  </span>
                </>
              )}

              <span className={classes.divider} />

              {geneData.summary.map((row, index) => (
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
                    key: "input",
                    name: "Input ID",
                    filterable: true,
                    filterType: "string",
                  },
                  {
                    key: "entrez",
                    name: "Entrez ID",
                    filterable: true,
                    filterType: "enum",
                    render: (cell) => cell || Mark(false, "Fail"),
                  },
                  {
                    key: "biogrid",
                    name: "In BioGRID",
                    render: Mark,
                    filterable: true,
                    filterType: "boolean",
                  },
                  {
                    key: "imp",
                    name: "In IMP",
                    render: Mark,
                    filterable: true,
                    filterType: "boolean",
                  },
                  {
                    key: "string",
                    name: "In STRING",
                    render: Mark,
                    filterable: true,
                    filterType: "boolean",
                  },
                ]}
                rows={geneData.table}
              />
            </Tab>
          </Tabs>
        )}

        {genesStatus === "loading" && (
          <Alert type="loading">
            Converting {formatNumber(splitGeneIds.length)} genes to Entrez
          </Alert>
        )}
        {genesStatus === "error" && (
          <Alert type="error">Error converting genes to Entrez</Alert>
        )}
        {genesStatus === "idle" && "No genes entered"}
      </Section>

      <Section>
        <Heading level={2} icon="3">
          Choose Parameters
        </Heading>

        <div className={classes.parameters}>
          <Radios
            value={network}
            onChange={setNetwork}
            label="Network"
            options={networkOptions}
            tooltip="The network the machine learning features are from and which edge list is used to make the final graph."
          />
          <Radios
            value={negatives}
            onChange={setNegatives}
            label="Negatives source"
            options={negativesOptions}
            tooltip="Source used to select negative genes and which sets to compare the trained model to."
          />
        </div>

        <Select
          label="Species"
          layout="vertical"
          options={speciesOptions}
          value={species}
          onChange={setSpecies}
          tooltip="The species for which model predictions will be made."
        />
      </Section>

      <Section>
        <Heading level={2} icon="4">
          Submit Analysis
        </Heading>

        <Button
          text="Submit Analysis"
          icon={<FaPaperPlane />}
          design="accent"
          onClick={submitAnalysis}
        />
      </Section>
    </>
  );
};

export default NewAnalysis;

const Mark = (yes: boolean, text?: string) => {
  const Icon = yes ? FaCheck : FaXmark;

  return (
    <span className={classes.mark}>
      <Icon className={yes ? classes.success : classes.error} />
      {text || (yes ? "Yes" : "No")}
    </span>
  );
};
