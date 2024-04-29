import { useEffect, useState } from "react";
import { FaBeer } from "react-icons/fa";
import {
  FaDna,
  FaEye,
  FaFish,
  FaLightbulb,
  FaPaperPlane,
  FaPerson,
  FaPlus,
  FaTable,
  FaUpload,
  FaWorm,
} from "react-icons/fa6";
import { GiFly, GiRat } from "react-icons/gi";
import { useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import { checkGenes } from "@/api/api";
import type {
  AnalysisInputs,
  GenesetContext,
  Network,
  Species,
} from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Mark, { YesNo } from "@/components/Mark";
import Meta from "@/components/Meta";
import Radios from "@/components/Radios";
import type { Option as RadioOption } from "@/components/Radios";
import Section from "@/components/Section";
import SelectSingle from "@/components/SelectSingle";
import type { Option as SelectOption } from "@/components/SelectSingle";
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

const NewAnalysisPage = () => {
  /** raw text list of input gene ids */
  const [inputGenes, setInputGenes] = useState("");
  const [debouncedInputGenes] = useDebounce(inputGenes, 500);

  /** array of input gene ids */
  const splitInputGenes = debouncedInputGenes
    .split(/,|\t|\n/)
    .map((id) => id.trim())
    .filter(Boolean);

  /** filename when file uploaded */
  const [filename, setFilename] = useState("");

  /** selected species */
  const [speciesTrain, setSpeciesTrain] = useState(speciesOptions[0]!.id);
  const [speciesTest, setSpeciesTest] = useState(speciesOptions[0]!.id);

  /** selected network type */
  const [network, setNetwork] = useState(networkOptions[0]!.id);

  /** selected geneset context */
  const [genesetContext, setGenesetContext] = useState(
    genesetContextOptions[0]!.id,
  );

  /** update meta counts */
  networkOptions.forEach((option) => {
    const { nodes, edges } = meta[speciesTest][option.id];
    option.tertiary = `${formatNumber(nodes, true)} nodes – ${formatNumber(edges, true)} edges`;
  });

  /** gene id conversion data */
  const {
    data: checkGenesData,
    status: checkGenesStatus,
    query: runCheckGenes,
  } = useQuery(
    async () =>
      splitInputGenes.length
        ? await checkGenes(splitInputGenes, speciesTrain)
        : undefined,
    [splitInputGenes, speciesTrain],
  );

  /** scroll down to check section after entering genes */
  useEffect(() => {
    if (checkGenesStatus !== "empty") scrollTo("#check-genes");
  }, [checkGenesStatus]);

  /** analysis name */
  const [name, setName] = useState("");

  /** submit analysis */
  const navigate = useNavigate();
  const submitAnalysis = () => {
    /** check for sufficient inputs */
    if (!splitInputGenes.length) {
      window.alert("Please enter some genes first!");
      scrollTo("#enter-genes");
      return;
    }

    /** send inputs to load analysis page */
    navigate("/analysis", {
      state: {
        inputs: {
          name,
          genes: splitInputGenes,
          speciesTrain,
          speciesTest,
          network,
          genesetContext,
        } satisfies AnalysisInputs,
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

  /** auto-select species */
  useEffect(() => {
    setSpeciesTest(speciesTrain);
  }, [speciesTrain]);

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
          value={inputGenes}
          onChange={(value) => {
            setInputGenes(value);
            setFilename("");
          }}
          multi={true}
          placeholder="Comma, tab, or line-separated list of entrez IDs, symbols, or ensembl gene/protein/transcript IDs"
        />

        <div className="flex-row gap-sm">
          <SelectSingle
            label="Species"
            tooltip="Species to lookup genes against and train model with."
            layout="horizontal"
            options={filteredSpeciesOptions}
            value={speciesTrain}
            onChange={setSpeciesTrain}
          />

          <Button
            text="Example"
            icon={<FaLightbulb />}
            design="hollow"
            onClick={() => setInputGenes(example[speciesTrain])}
            tooltip="Try some example genes for this species"
          />

          <div className="flex-row gap-sm">
            <UploadButton
              accept="text/plain, text/csv, text/tsv, text/tab-separated-values"
              text="Upload"
              icon={<FaUpload />}
              design="hollow"
              onUpload={async (file, filename) => {
                const text = await file.text();
                setInputGenes(text);
                setFilename(filename);
              }}
            />
            {filename}
          </div>
        </div>
      </Section>

      <Section>
        <Heading level={2} icon="2">
          Check Genes
        </Heading>

        {checkGenesStatus === "empty" && (
          <>
            <p className="narrow">
              Check that your genes are valid and in our networks before
              submitting a full analysis. Optional but recommended, since
              analyses can take some time.
            </p>
            <Button
              text="Check Genes"
              icon={<FaPaperPlane />}
              onClick={() =>
                splitInputGenes.length
                  ? runCheckGenes()
                  : toast("Enter some genes")
              }
            />
          </>
        )}

        {checkGenesStatus === "loading" && (
          <Alert type="loading">
            Checking {formatNumber(splitInputGenes.length)} genes
          </Alert>
        )}
        {checkGenesStatus === "error" && (
          <Alert type="error">Error checking genes</Alert>
        )}

        {checkGenesData && (
          <Tabs>
            <Tab text="Summary" icon={<FaEye />}>
              <div className={classes.summary}>
                <Mark type="success">
                  <strong className={classes.success}>
                    {formatNumber(checkGenesData.success)} genes
                  </strong>{" "}
                  converted to Entrez
                </Mark>

                {!!checkGenesData.error && (
                  <Mark type="error">
                    <strong className={classes.error}>
                      {formatNumber(checkGenesData.error)} genes
                    </strong>{" "}
                    couldn't be converted
                  </Mark>
                )}

                <span className={classes.divider} />

                {checkGenesData.summary.map((row, index) => (
                  <Mark key={index} icon={<FaDna />}>
                    <strong>{formatNumber(row.positiveGenes)} genes</strong> in{" "}
                    {row.network} ({formatNumber(row.totalGenes, true)})
                  </Mark>
                ))}
              </div>
            </Tab>

            <Tab text="Detailed" icon={<FaTable />}>
              <Table
                cols={[
                  {
                    key: "input",
                    name: "Input ID",
                  },
                  {
                    key: "entrez",
                    name: "Entrez ID",
                    render: (cell) => cell || <Mark type="error">Failed</Mark>,
                  },
                  {
                    key: "biogrid",
                    name: "In BioGRID",
                    render: YesNo,
                    filterType: "boolean",
                  },
                  {
                    key: "imp",
                    name: "In IMP",
                    render: YesNo,
                    filterType: "boolean",
                  },
                  {
                    key: "string",
                    name: "In STRING",
                    render: YesNo,
                    filterType: "boolean",
                  },
                ]}
                rows={checkGenesData.table}
              />
            </Tab>
          </Tabs>
        )}
      </Section>

      <Section>
        <Heading level={2} icon="3">
          Choose Parameters
        </Heading>

        <SelectSingle
          label="Species"
          options={filteredSpeciesOptions.map((option) => ({
            ...option,
            ...(option.id === speciesTrain && {
              text: `Same as above`,
              info: option.text,
            }),
          }))}
          value={speciesTest}
          onChange={setSpeciesTest}
          tooltip="Species for which model predictions will be made. If different from species selected above, model results will be translated into this species."
        />

        <div className={classes.parameters}>
          <Radios
            value={network}
            onChange={setNetwork}
            label="Network"
            options={networkOptions}
            tooltip="Network that machine learning features are from and which edge list is used to make final graph."
          />
          <Radios
            value={genesetContext}
            onChange={setGenesetContext}
            label="Geneset Context"
            options={genesetContextOptions}
            tooltip="Source used to select negative genes and which sets to compare  trained model to"
          />
        </div>
      </Section>

      <Section>
        <Heading level={2} icon="4">
          Submit Analysis
        </Heading>

        <TextBox
          className="narrow"
          label="Name"
          tooltip="(Optional) Give your analysis a name to remember it by"
          placeholder="analysis"
          value={name}
          onChange={(value) => setName(value.replaceAll(/[^\w\d-_ ]*/g, ""))}
        />

        <Button
          text="Submit Analysis"
          icon={<FaPaperPlane />}
          onClick={submitAnalysis}
        />
      </Section>
    </>
  );
};

export default NewAnalysisPage;
