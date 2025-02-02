import { useEffect, useState } from "react";
import {
  FaArrowRightLong,
  FaBeerMugEmpty,
  FaDna,
  FaEye,
  FaFish,
  FaLightbulb,
  FaListCheck,
  FaPaperPlane,
  FaPerson,
  FaPlus,
  FaTable,
  FaUpload,
  FaWorm,
} from "react-icons/fa6";
import { GiFly, GiRat } from "react-icons/gi";
import { PiDotOutline, PiLineSegmentFill } from "react-icons/pi";
import { useNavigate } from "react-router";
import { uniq } from "lodash";
import { useEventListener, useLocalStorage } from "@reactuses/core";
import { checkGenes } from "@/api/api";
import type { AnalysisInputs } from "@/api/convert";
import type { GenesetContext, Network, Species } from "@/api/types";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Collapsible from "@/components/Collapsible";
import Flex from "@/components/Flex";
import Heading from "@/components/Heading";
import Help from "@/components/Help";
import Link from "@/components/Link";
import Mark, { YesNo } from "@/components/Mark";
import Meta from "@/components/Meta";
import Section from "@/components/Section";
import SelectSingle from "@/components/SelectSingle";
import type { Option as SelectOption } from "@/components/SelectSingle";
import Table from "@/components/Table";
import Tabs, { Tab } from "@/components/Tabs";
import TextBox from "@/components/TextBox";
import { toast } from "@/components/Toasts";
import UploadButton from "@/components/UploadButton";
import { RenderID } from "@/pages/analysis/InputGenes";
import { scrollTo } from "@/util/dom";
import { useQuery } from "@/util/hooks";
import { formatNumber } from "@/util/string";
import meta from "./meta.json";
import classes from "./NewAnalysis.module.css";

const example: Record<Species, string> = {
  Human:
    "BBIP1,BBS18,BBS1,BBS2,BBS4,BBS5,BBS7,BBS9,TTC8,BBS8,ARL6,BBS3,BBS10,BBS12,MKKS,BBS6,CFAP418,BBS21,CEP164,CEP290,BBS14,IFT27,BBS19,IFT74,BBS20,IFT172,BBS20,LZTFL1,BBS17,MKS1,BBS13,SCAPER,SCLT1,SDCCAG8,BBS16,TRIM32,BBS11,WDPCP,BBS15",
  Mouse: "Mpo,Inmt,Gnmt,Fos,Calr,Selenbp2,Rgn,Stat6,Etfa,Atp5f1b",
  Fly: "SC35,Rbp1-like,x16,Rsf1,B52,norpA,SF2,Srp54k,Srp54,Rbp1",
  Zebrafish: "upf1,dhx34,lsm1,xrn1,xrn2,lsm7,mrto4,pnrc2,lsm4,nbas",
  Worm: "egl-26,cas-1,exc-5,gex-3,gex-2,sax-2,cas-2,mig-6,cap-2,rhgf-2",
  Yeast: "KL1,GND1,GND2,ZWF1,TKL2,RKI1,RPE1,SOL4,TAL1,SOL3",
};

const speciesOptions: SelectOption<Species>[] = [
  {
    id: "Human",
    primary: "Human",
    secondary: "Homo sapiens",
    icon: <FaPerson />,
  },
  {
    id: "Mouse",
    primary: "Mouse",
    secondary: "Mus musculus",
    icon: <GiRat />,
  },
  {
    id: "Fly",
    primary: "Fly",
    secondary: "Drosophila melanogaster",
    icon: <GiFly />,
  },
  {
    id: "Zebrafish",
    primary: "Zebrafish",
    secondary: "Danio rerio",
    icon: <FaFish />,
  },
  {
    id: "Worm",
    primary: "Worm",
    secondary: "Caenorhabditis elegans",
    icon: <FaWorm />,
  },
  {
    id: "Yeast",
    primary: "Yeast",
    secondary: "Saccharomyces cerevisiae",
    icon: <FaBeerMugEmpty />,
  },
] as const;

const networkOptions: SelectOption<Network>[] = [
  {
    id: "STRING",
    primary: "STRING",
    // secondary: "Derived from a variety of sources",
  },
  {
    id: "IMP",
    primary: "IMP",
    // secondary: "Expression-derived interactions",
  },
  {
    id: "BioGRID",
    primary: "BioGRID",
    // secondary: "Physical interactions",
  },
] as const;

const genesetContextOptions: SelectOption<GenesetContext>[] = [
  {
    id: "Combined",
    primary: "Combined",
    secondary: "Combo. of below",
  },
  {
    id: "GO",
    primary: "GO",
    secondary: "Bio. Proc.",
  },
  {
    id: "Monarch",
    primary: "Monarch",
    secondary: "Phenotypes",
  },
  {
    id: "Mondo",
    primary: "Mondo",
    secondary: "Diseases",
  },
];

const geneMin = 5;
const geneMinMessage = `GenePlexus needs at least ${geneMin} valid genes to work properly`;

const NewAnalysisPage = () => {
  /** raw text list of input gene ids */
  const [genes, setGenes] = useLocalStorage("input-genes", "");
  const [negatives, setNegatives] = useLocalStorage("negative-genes", "");

  /** array of input gene ids */
  const splitGenes =
    genes
      ?.split(/,|\t|\n/)
      .map((id) => id.trim())
      .filter(Boolean) ?? [];
  const splitNegatives =
    negatives
      ?.split(/,|\t|\n/)
      .map((id) => id.trim())
      .filter(Boolean) ?? [];

  /** filename when file uploaded */
  const [filename, setFilename] = useState("");

  /** selected species */
  const [speciesTrain, setSpeciesTrain] = useState(speciesOptions[0]!.id);
  const [speciesResult, setSpeciesResult] = useState(speciesOptions[0]!.id);

  /** selected network type */
  const [network, setNetwork] = useState(networkOptions[0]!.id);

  /** selected geneset context */
  const [genesetContext, setGenesetContext] = useState(
    genesetContextOptions[0]!.id,
  );

  /** update meta counts */
  networkOptions.forEach((option) => {
    const { nodes, edges } = meta[speciesResult][option.id];
    option.secondary = (
      <>
        {formatNumber(nodes, true)}
        <PiDotOutline /> {formatNumber(edges, true)}
        <PiLineSegmentFill />
      </>
    );
  });

  /** gene id conversion data */
  const {
    data: checkGenesData,
    status: checkGenesStatus,
    query: runCheckGenes,
  } = useQuery(async () => {
    /** combine and de-dupe regular input genes and negative input genes */
    const allGenes = uniq(splitGenes.concat(splitNegatives));
    if (!allGenes.length) return undefined;
    /** check all */
    const results = await checkGenes({
      genes: allGenes,
      sp_trn: speciesTrain,
    });
    return {
      ...results,
      table: results.table.map((result) => {
        /** remember whether gene was in regular and/or negatives inputs */
        const inGenes = splitGenes.some(
          (gene) => gene.toUpperCase() === result.input.toUpperCase(),
        );
        const inNegatives = splitNegatives.some(
          (gene) => gene.toUpperCase() === result.input.toUpperCase(),
        );
        let inputType = "";
        if (inGenes && inNegatives) inputType = "+ & -";
        else if (inGenes) inputType = "+";
        else if (inNegatives) inputType = "-";
        return { ...result, inputType };
      }),
    };
  }, [splitGenes, splitNegatives, speciesTrain]);

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
    if (!splitGenes.length) {
      window.alert("Please enter some genes");
      scrollTo("#enter-genes");
      return;
    }

    if (splitGenes.length < geneMin) {
      window.alert(geneMinMessage);
      scrollTo("#enter-genes");
      return;
    }

    if ((checkGenesData?.success || Infinity) < geneMin) {
      window.alert(geneMinMessage);
      scrollTo("#pre-check-genes");
      return;
    }

    /** send inputs to load analysis page */
    navigate("/analysis", {
      state: {
        inputs: {
          name,
          genes: splitGenes,
          negatives: splitNegatives,
          speciesTrain,
          speciesResult,
          network,
          genesetContext,
        } satisfies AnalysisInputs,
      },
    });
  };

  /** limit options based on species */
  /** https://pygeneplexus.readthedocs.io/en/v2.0.4/notes/data.html#preprocessed-data */
  const filteredNetworkOptions = networkOptions.filter((option) => {
    if (
      option.id === "BioGRID" &&
      (speciesTrain === "Zebrafish" || speciesResult === "Zebrafish")
    )
      return false;
    return true;
  });
  const filteredGenesetContextOptions = genesetContextOptions.filter(
    (option) => {
      if (
        (speciesTrain === "Fly" || speciesResult === "Fly") &&
        (option.id === "Monarch" || option.id === "Mondo")
      )
        return false;
      if (
        option.id === "Mondo" &&
        (speciesTrain !== "Human" || speciesResult !== "Human")
      )
        return false;
      return true;
    },
  );

  /**
   * when selected option is removed, select component will auto-select first
   * available option
   */
  if (
    !filteredNetworkOptions.find((option) => option.id === network) ||
    !filteredGenesetContextOptions.find(
      (option) => option.id === genesetContext,
    )
  )
    /** warn about incompatible option */
    toast(
      <>
        Selected options changed to be compatible with selected species.{" "}
        <Link to="https://pygeneplexus.readthedocs.io/en/v2.0.4/notes/data.html">
          Learn more
        </Link>
        .
      </>,
      "warning",
      "warn",
    );

  /**
   * allow setting inputs from outside component. history.state is persisted on
   * refresh/back/forward, which interferes with localStorage-synced state, so
   * use one-time event instead.
   */
  useEventListener("set-inputs", (event: CustomEvent<AnalysisInputs>) => {
    /** get input values from event */
    const {
      name,
      genes,
      negatives,
      speciesTrain,
      speciesResult,
      network,
      genesetContext,
      ...rest
    } = event.detail;

    /** make sure all inputs consumed (statically and at run-time) */
    const allInputsUsed = <T extends Record<PropertyKey, never>>(rest: T) => {
      if (Object.keys(rest).length) throw Error("Not all inputs used");
    };
    allInputsUsed(rest);

    /** set inputs */
    setGenes(genes.join(", "));
    setNegatives(negatives.join(", "));
    setName(name);
    setSpeciesTrain(speciesTrain);
    setSpeciesResult(speciesResult);
    setNetwork(network);
    setGenesetContext(genesetContext);
  });

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
          Choose Species
        </Heading>
        <Flex gap="lg">
          <SelectSingle
            label="Input Species"
            tooltip="Species to lookup genes against and train model with."
            layout="horizontal"
            options={speciesOptions}
            value={speciesTrain}
            onChange={(value) => {
              /** clear genes if they exactly match an example set */
              if (Object.values(example).includes(genes ?? "")) setGenes("");

              setSpeciesTrain(value);
              setSpeciesResult(value);
            }}
          />

          <FaArrowRightLong opacity="0.25" />

          <SelectSingle
            label="Results Species"
            tooltip="Species for which model predictions will be made. If different from input species, model results will be translated into this species."
            layout="horizontal"
            options={speciesOptions}
            value={speciesResult}
            onChange={setSpeciesResult}
          />
        </Flex>
      </Section>

      <Section>
        <Heading level={2} icon="2">
          Enter Genes
        </Heading>

        <div className={classes["gene-boxes"]}>
          <TextBox
            className="full"
            label={`${speciesTrain} Genes`}
            value={genes ?? ""}
            onChange={(value) => {
              setGenes(value);
              setFilename("");
            }}
            multi
            placeholder="Comma, tab, or line-separated list of entrez IDs, symbols, or ensembl gene/protein/transcript IDs"
            tooltip="Genes to be used as positive training examples"
          />
        </div>

        <Flex>
          <span>{formatNumber(splitGenes.length)} genes</span>

          <Button
            text="Example"
            icon={<FaLightbulb />}
            design="hollow"
            onClick={() => setGenes(example[speciesTrain])}
            tooltip="Try some example genes for this species"
          />
          <Flex>
            <UploadButton
              text="Upload"
              icon={<FaUpload />}
              accept={[
                "text/plain",
                "text/csv",
                "text/tab-separated-values",
                ".txt",
                ".csv",
                ".tsv",
              ]}
              design="hollow"
              onUpload={async (file, filename) => {
                const text = await file.text();
                setGenes(text);
                setFilename(filename);
              }}
            />
            {filename}
          </Flex>
        </Flex>

        {splitGenes.length > 0 && splitGenes.length < geneMin && (
          <Alert type="error">{geneMinMessage}</Alert>
        )}
      </Section>

      <Section>
        <Heading level={2} icon="3">
          Options
        </Heading>

        <Collapsible text="Customize">
          <Flex>
            <SelectSingle
              value={network}
              onChange={setNetwork}
              label="Network"
              options={filteredNetworkOptions}
              tooltip="Network that machine learning features are from and which edge list is used to make final graph."
            />
            <SelectSingle
              value={genesetContext}
              onChange={setGenesetContext}
              label="Geneset Context"
              options={filteredGenesetContextOptions}
              tooltip={
                <>
                  <div>
                    Source used to select negative genes and which sets to
                    compare trained model to.
                  </div>
                  <div>
                    <i>Combined</i> = union of all{" "}
                    {filteredGenesetContextOptions.length - 1} geneset(s)
                    available for selected species:{" "}
                    {filteredGenesetContextOptions
                      .slice(1)
                      .map((option) => option.primary)
                      .join(", ")}
                  </div>
                </>
              }
            />
            <Link to="https://pygeneplexus.readthedocs.io/en/v2.0.4/notes/data.html">
              Learn more
            </Link>
          </Flex>

          <TextBox
            className="full"
            label="Negative Genes"
            value={negatives ?? ""}
            onChange={setNegatives}
            multi
            placeholder="Comma, tab, or line-separated list of entrez IDs, symbols, or ensembl gene/protein/transcript IDs"
            tooltip="Genes to be used as negative training examples, in addition to those automatically selected by our algorithm."
          />

          <span>{formatNumber(splitNegatives.length)} negative genes</span>
        </Collapsible>
      </Section>

      <Section>
        <Heading level={2} icon="4">
          Pre-check Genes
        </Heading>

        {checkGenesStatus === "empty" && (
          <Flex>
            <Button
              text="Check"
              icon={<FaListCheck />}
              onClick={() =>
                splitGenes.length ? runCheckGenes() : toast("Enter some genes")
              }
            />
            (Optional)
            <Help
              tooltip="Check that your genes are valid and in our networks before
              submitting a full analysis. Optional but recommended, since
              analyses can take some time."
            />
          </Flex>
        )}

        {checkGenesStatus === "loading" && (
          <Alert type="loading">
            Checking {formatNumber(splitGenes.length + splitNegatives.length)}{" "}
            genes
          </Alert>
        )}
        {checkGenesStatus === "error" && (
          <Alert type="error">Error checking genes</Alert>
        )}

        {checkGenesData && (
          <>
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
                      <strong>{formatNumber(row.positiveGenes)} genes</strong>{" "}
                      in {row.network} ({formatNumber(row.totalGenes, true)})
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
                    ...(splitNegatives.length
                      ? ([
                          {
                            key: "inputType",
                            name: "Type",
                            filterType: "enum",
                          },
                        ] as const)
                      : []),
                    {
                      key: "entrez",
                      name: "Entrez ID",
                      render: RenderID,
                    },
                    {
                      key: "inNetwork",
                      name: "In Network",
                      render: YesNo,
                      filterType: "boolean",
                    },
                  ]}
                  rows={checkGenesData.table}
                />
              </Tab>
            </Tabs>

            {checkGenesData.success < geneMin && (
              <Alert type="error">{geneMinMessage}</Alert>
            )}
          </>
        )}
      </Section>

      <Section>
        <Heading level={2} icon="5">
          Submit Analysis
        </Heading>

        {!checkGenesData &&
          splitGenes.length >= geneMin &&
          splitGenes.length < geneMin * 2 && (
            <Alert type="warning" className="narrow">
              You haven't entered many genes and haven't pre-checked them. If
              less than {geneMin} end up being valid, the analysis will fail.
            </Alert>
          )}

        <TextBox
          className="narrow"
          label="Name"
          tooltip="(Optional) A name to help you distinguish this analysis from others. Shown anywhere an analysis summary or details is shown, and used in downloaded file names."
          placeholder="analysis"
          value={name}
          onChange={(value) => setName(value.replaceAll(/[^\w\d-_ ]*/g, ""))}
        />

        <Button
          text="Submit"
          icon={<FaPaperPlane />}
          style={{
            opacity:
              splitGenes.length < geneMin ||
              (checkGenesData?.success || Infinity) < geneMin
                ? 0.5
                : 1,
          }}
          onClick={submitAnalysis}
        />
      </Section>
    </>
  );
};

export default NewAnalysisPage;

/** set analysis inputs */
export const setInputs = (inputs: AnalysisInputs) =>
  window.dispatchEvent(new CustomEvent("set-inputs", { detail: inputs }));
