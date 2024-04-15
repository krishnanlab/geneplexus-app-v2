import { Fragment, useEffect, useState } from "react";
import { FaBeer } from "react-icons/fa";
import {
  FaArrowUp,
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
import { convertGeneIds } from "@/api/api";
import type {
  AnalysisInput,
  GenesetContext,
  Network,
  Species,
} from "@/api/types";
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
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";
import { scrollTo } from "@/util/dom";
import { useQuery } from "@/util/hooks";
import { formatNumber } from "@/util/string";
import meta from "./meta.json";
import classes from "./NewAnalysis.module.css";

const example: Record<Species, string> = {
  Human: "CASP3,CYP1A2,CYP1A1,NFE2L2,CYP2C19,CYP2D6,CYP7A1,NR1H4,TP53,CYP19A1",
  Mouse: "Mpo,Inmt,Gnmt,Fos,Calr,Selenbp2,Rgn,Stat6,Etfa,Atp5f1b",
  Fly: "SC35,Rbp1-like,x16,Rsf1,B52,norpA,SF2,Srp54k,Srp54,Rbp1",
  Zebrafish: "upf1,dhx34,lsm1,xrn1,xrn2,lsm7,mrto4,pnrc2,lsm4,nbas",
  Worm: "egl-26,cas-1,exc-5,gex-3,gex-2,sax-2,cas-2,mig-6,cap-2,rhgf-2",
  Yeast: "KL1,GND1,GND2,ZWF1,TKL2,RKI1,RPE1,SOL4,TAL1,SOL3",
};

const speciesOptions: SelectOption<Species>[] = [
  { id: "Human", text: "Human", icon: <FaPerson /> },
  { id: "Mouse", text: "Mouse", icon: <GiRat /> },
  { id: "Fly", text: "Fly", icon: <GiFly /> },
  { id: "Zebrafish", text: "Zebrafish", icon: <FaFish /> },
  { id: "Worm", text: "Worm", icon: <FaWorm /> },
  { id: "Yeast", text: "Yeast", icon: <FaBeer /> },
] as const;

const networkOptions: RadioOption<Network>[] = [
  {
    id: "BioGRID",
    primary: "BioGRID",
    secondary: "Physical interactions",
  },
  {
    id: "STRING",
    primary: "STRING",
    secondary: "Derived from a variety of sources",
  },
  {
    id: "IMP",
    primary: "IMP",
    secondary: "Expression-derived interactions",
  },
] as const;

const genesetContextOptions: RadioOption<GenesetContext>[] = [
  {
    id: "GO",
    primary: "GO",
    secondary: "Biological Processes",
  },
  {
    id: "Monarch",
    primary: "Monarch",
    secondary: "Phenotypes",
  },
  {
    id: "DisGeNet",
    primary: "DisGeNet",
    secondary: "Diseases",
  },
  {
    id: "Combined",
    primary: "Combined",
    secondary: "All sets",
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
  const [speciesTrain, setSpeciesTrain] = useState<
    (typeof speciesOptions)[number]["id"]
  >(speciesOptions[0]!.id);
  const [speciesTest, setSpeciesTest] = useState<
    (typeof speciesOptions)[number]["id"]
  >(speciesOptions[0]!.id);

  /** selected network type */
  const [network, setNetwork] = useState<(typeof networkOptions)[number]["id"]>(
    networkOptions[0]!.id,
  );

  /** selected geneset context */
  const [genesetContext, setGenesetContext] = useState<
    (typeof genesetContextOptions)[number]["id"]
  >(genesetContextOptions[0]!.id);

  /** update meta counts */
  networkOptions.forEach((option) => {
    const { nodes, edges } = meta[speciesTest][option.id];
    option.tertiary = `${formatNumber(nodes, true)} nodes – ${formatNumber(edges, true)} edges`;
  });

  /** gene id conversion data */
  const {
    data: geneData,
    status: genesStatus,
    query: runConvertGeneIds,
  } = useQuery(
    async () =>
      splitGeneIds.length
        ? await convertGeneIds(splitGeneIds, speciesTrain)
        : undefined,
    [splitGeneIds, speciesTrain],
  );

  /** converted list of gene ids */
  const genes =
    geneData?.table.map((entry) => entry.entrez).filter(Boolean) || [];

  /** scroll down to review section after entering genes */
  useEffect(() => {
    if (genesStatus !== "idle") scrollTo("#review-genes");
  }, [genesStatus]);

  /** analysis name */
  const [name, setName] = useState("");

  /** submit analysis */
  const navigate = useNavigate();
  const submitAnalysis = () => {
    /** check for sufficient inputs */
    if (!genes.length) {
      window.alert("Please enter some genes first!");
      scrollTo("#enter-genes");
      return;
    }

    /** send inputs to load analysis page */
    navigate("/analysis", {
      state: {
        input: {
          name,
          genes,
          speciesTrain,
          speciesTest,
          network,
          genesetContext,
        } satisfies AnalysisInput,
      },
    });
  };

  /** restrict species options based on other params */
  const filteredSpeciesOptions = speciesOptions.filter((option) => {
    if (genesetContext === "DisGeNet" && option.id !== "Human") return false;
    if (network === "BioGRID" && option.id === "Zebrafish") return false;
    return true;
  });

  /** warn about param restrictions */
  if (
    network === "BioGRID" &&
    (speciesTrain === "Zebrafish" || speciesTest === "Zebrafish")
  )
    toast("BioGRID does not support Zebrafish.", "warning", "warn1");
  if (
    genesetContext === "DisGeNet" &&
    (speciesTrain !== "Human" || speciesTest !== "Human")
  )
    toast("DisGeNet only supports Human genes.", "warning", "warn2");

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
            tooltip="Species to lookup genes against and train model with. May be limited by parameter choices below."
            layout="horizontal"
            options={filteredSpeciesOptions}
            value={speciesTrain}
            onChange={setSpeciesTrain}
          />

          <Button
            text="Example"
            icon={<FaLightbulb />}
            onClick={() => setGeneIds(example[speciesTrain])}
            tooltip="Try some example genes for this species"
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
          tooltip="Converts and checks your genes in preparation for analysis"
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
                    <strong>{formatNumber(row.positiveGenes)} genes</strong> in{" "}
                    {row.network} ({formatNumber(row.totalGenes, true)})
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

        <Select
          label="Species"
          layout="vertical"
          options={filteredSpeciesOptions}
          value={speciesTest}
          onChange={setSpeciesTest}
          tooltip="The species for which model predictions will be made. May be limited by parameter choices below."
        />

        <div className={classes.parameters}>
          <Radios
            value={network}
            onChange={setNetwork}
            label="Network"
            options={networkOptions}
            tooltip="The network that the machine learning features are from and which edge list is used to make the final graph."
          />
          <Radios
            value={genesetContext}
            onChange={setGenesetContext}
            label="Geneset Context"
            options={genesetContextOptions}
            tooltip="Source used to select negative genes and which sets to compare the trained model to"
          />
        </div>
      </Section>

      <Section>
        <Heading level={2} icon="4">
          Submit Analysis
        </Heading>

        <TextBox
          label="Name"
          tooltip="(Optional) Give your analysis a name to remember it by"
          placeholder="analysis"
          value={name}
          onChange={(value) => setName(value.replaceAll(/[^\w\d-_ ]*/g, ""))}
          width={300}
        />

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

/** yes/no check/x */
const Mark = (yes: boolean, text?: string) => {
  const Icon = yes ? FaCheck : FaXmark;

  return (
    <span className={classes.mark}>
      <Icon className={yes ? classes.success : classes.error} />
      {text || (yes ? "Yes" : "No")}
    </span>
  );
};
