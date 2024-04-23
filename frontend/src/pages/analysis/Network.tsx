import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaAt,
  FaBarcode,
  FaDownload,
  FaPercent,
  FaRankingStar,
} from "react-icons/fa6";
import { useMeasure } from "react-use";
import classNames from "classnames";
import * as d3 from "d3";
import { clamp, cloneDeep, truncate } from "lodash";
import type { AnalysisInputs, AnalysisResults } from "@/api/types";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Select, { type Option } from "@/components/Select";
import Slider from "@/components/Slider";
import { downloadSvg } from "@/util/download";
import { lerp } from "@/util/math";
import { formatNumber } from "@/util/string";
import classes from "./Network.module.css";

/** only one of these components can be rendered at a time (singleton) */

/** PARAMS */

/** hard limit on number of nodes */
const hardMaxNodes = 500;
/** min zoom (scale factor) */
const minZoom = 0.2;
/** lower zoom (scale factor) */
const maxZoom = 10;
/** empty space to leave around view when fitting (in svg units) */
const fitPadding = 20;
/** node circle radius */
const nodeRadius = 10;
/** distance under which nodes will be forced apart */
const collideDistance = 30;
/** how quickly simulation comes to rest */
const simulationDecay = 0.2;
/** how much nodes attract each other */
const attractionStrength = 1;
/** equilibrium distance between linked nodes */
const springDistance = 40;
/** node circle fill colors (keep light to allow dark text) */
const nodeColors: Record<Node["classLabel"], string> = {
  Positive: "#b3e2ff",
  Negative: "#ffcada",
  Neutral: "#e8e8e8",
};
/** link line stroke color */
const linkColor = "#a0a0a0";
/** selected link line stroke color */
const selectedLinkColor = "#ba3960";
/** legend square/text/other size */
const legendCell = 15;
/** legend line spacing factor */
const legendSpacing = 2;

type Props = {
  inputs: AnalysisInputs;
  results: AnalysisResults;
};

type Node = AnalysisResults["network"]["nodes"][number];
type NodeDatum = d3.SimulationNodeDatum & { id: string };
type LinkDatum = d3.SimulationLinkDatum<NodeDatum> & {
  sourceIndex: number;
  targetIndex: number;
};

const labelKeyOptions: Option<keyof Node>[] = [
  { id: "entrez", text: "Entrez", icon: <FaBarcode /> },
  { id: "symbol", text: "Symbol", icon: <FaAt /> },
  { id: "rank", text: "Rank", icon: <FaRankingStar /> },
  { id: "probability", text: "Probability", icon: <FaPercent /> },
] as const;

const Network = ({ inputs, results }: Props) => {
  /** element refs */
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<SVGGElement | null>(null);
  const legendRef = useRef<SVGGElement | null>(null);
  const linkRefs = useRef<Map<number, SVGLineElement>>(new Map());
  const circleRefs = useRef<Map<number, SVGCircleElement>>(new Map());
  const labelRefs = useRef<Map<number, SVGTextElement>>(new Map());

  /** max # of nodes to display, in order of rank */
  const [maxNodes, setMaxNodes] = useState(
    Math.min(hardMaxNodes, results.network.nodes.length),
  );

  /** min/max of probabilities */
  const probabilityExtent = d3.extent(
    results.network.nodes.map((node) => node.probability),
  );

  /** don't display nodes below this probability */
  const [minProbability, setMinProbability] = useState(probabilityExtent[0]!);

  /** whether to auto-fit camera to contents every frame */
  const [autoFit, setAutoFit] = useState(false);

  /** selected node */
  const [selectedNode, setSelectedNode] = useState<Node>();

  /** node label key to display */
  const [labelKey, setLabelKey] = useState(labelKeyOptions[0]!.id);

  /** nodes to display */
  const nodes = useMemo(
    () =>
      results.network.nodes
        .filter((node) => node.probability >= minProbability)
        .slice(0, maxNodes),
    [results.network.nodes, minProbability, maxNodes],
  );

  /** quick node lookup */
  const nodeLookup = useMemo(
    () => Object.fromEntries(nodes.map((node, index) => [node.entrez, index])),
    [nodes],
  );

  /** links to display */
  const links = useMemo(
    () =>
      results.network.links
        .filter(
          (link) => link.source in nodeLookup && link.target in nodeLookup,
        )
        .map((link) => ({
          ...link,
          sourceIndex: nodeLookup[link.source]!,
          targetIndex: nodeLookup[link.target]!,
        })),
    [nodeLookup, results.network.links],
  );

  /** legend info */
  const legendInfo: [number, string, string][] = [
    [4.5, "Nodes", formatNumber(nodes.length)],
    [5.5, "Links", formatNumber(links.length)],
  ];
  if (selectedNode)
    legendInfo.push(
      [7, "Selected Node", ""],
      [8, "Rank", formatNumber(selectedNode.rank)],
      [9, "Prob.", formatNumber(selectedNode.probability)],
      [10, "Entrz.", selectedNode.entrez],
      [11, "Sym.", selectedNode.symbol],
      [12, "Name", selectedNode.name],
      [13, "K/N", selectedNode.knownNovel],
      [14, "Class", selectedNode.classLabel],
    );

  /** camera zoom handler */
  const zoom = useMemo(
    () =>
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([minZoom, maxZoom])
        /** on zoom/pan */
        .on("zoom", (event) => {
          /** if due to direct user interaction (wheel, drag, pinch, etc) */
          if (event.sourceEvent) setAutoFit(false);
          /** update zoom camera transform */
          zoomRef.current?.setAttribute(
            "transform",
            event.transform.toString(),
          );
        })
        /** prevent zoom over legend */
        .filter((event) => !legendRef.current?.contains(event.target)),
    [],
  );

  /** fit zoom camera to contents of svg */
  const fitZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;

    /** turn auto-fit on */
    setAutoFit(true);

    /** get svg size */
    const container = svgRef.current.getBoundingClientRect();
    /** get size of svg contents */
    const contents = zoomRef.current.getBBox();

    /** get center point of contents */
    const midX = contents.x + contents.width / 2;
    const midY = contents.y + contents.height / 2;

    /** determine scale up/down to contain */
    const fromWidth = contents.width / (container.width - fitPadding * 2);
    const fromHeight = contents.height / (container.height - fitPadding * 2);
    let scale = 1 / Math.max(fromWidth, fromHeight);

    /** limit scale */
    scale = clamp(scale, minZoom, maxZoom);

    /** determine center position */
    const translateX = container.width / 2 - scale * midX;
    const translateY = container.height / 2 - scale * midY;

    /** set new camera */
    zoom.transform(
      d3.select(svgRef.current),
      d3.zoomIdentity.translate(translateX, translateY).scale(scale),
    );
  }, [zoom]);

  /** physics simulation */
  const latestAutoFit = useRef(true);
  latestAutoFit.current = autoFit;
  const simulation = useMemo(
    () =>
      d3
        .forceSimulation<NodeDatum>()
        .alphaDecay(simulationDecay)
        .force("collide", collide)
        .force("attraction", attraction)
        .force("spring", spring)
        .on("tick", () => {
          /** position nodes */
          simulation.nodes().forEach((node, index) => {
            const circle = circleRefs.current.get(index);
            circle?.setAttribute("cx", String(node.x));
            circle?.setAttribute("cy", String(node.y));
            const label = labelRefs.current.get(index);
            label?.setAttribute("x", String(node.x));
            label?.setAttribute("y", String(node.y));
          });

          /** position links */
          (simulation.force("spring") as typeof spring)
            .links()
            .forEach((link, index) => {
              const line = linkRefs.current.get(index);
              const source = simulation.nodes().at(link.sourceIndex);
              const target = simulation.nodes().at(link.targetIndex);
              if (source) {
                line?.setAttribute("x1", String(source.x));
                line?.setAttribute("y1", String(source.y));
              }
              if (target) {
                line?.setAttribute("x2", String(target.x));
                line?.setAttribute("y2", String(target.y));
              }
            });

          /** fit every tick */
          if (latestAutoFit.current) fitZoom();
        }),
    [fitZoom],
  );

  /** node drag handler */
  const drag = useMemo(
    () =>
      d3
        .drag<SVGCircleElement, number>()
        .on("drag", (event, d) => {
          /** get node being dragged from datum index */
          const node = simulation.nodes().at(d);
          if (!node) return;
          /** pin position while dragging */
          node.fx = event.x;
          node.fy = event.y;
          /** reheat */
          simulation.alpha(1).restart();
        })
        .on("end", (event, d) => {
          /** get node being dragged from datum index */
          const node = simulation.nodes().at(d);
          if (!node) return;
          /** unpin position */
          node.fx = null;
          node.fy = null;
        }),
    [simulation],
  );

  /** update simulation to be in-sync with declarative nodes/links */
  useEffect(() => {
    /** update nodes */
    const d3nodeLookup = Object.fromEntries(
      simulation.nodes().map((node) => [node.id, node]),
    );
    simulation.nodes(
      nodes.map((node) => d3nodeLookup[node.entrez] ?? { id: node.entrez }),
    );

    /** update links */
    (simulation.force("spring") as typeof spring).links(cloneDeep(links));

    /** reheat */
    simulation.alpha(1).restart();
  }, [nodes, links, simulation]);

  /** fit background rectangle to fit contents of legend */
  const fitLegend = useCallback(() => {
    if (!legendRef.current) return;

    /** bg fill */
    const bg = legendRef.current.querySelector("rect");
    if (!bg) return;

    /** don't consider bg in contents */
    bg.removeAttribute("x");
    bg.removeAttribute("y");
    bg.removeAttribute("width");
    bg.removeAttribute("height");

    /** get size of contents */
    const { x, y, width, height } = legendRef.current.getBBox();

    /** auto-fit bg to content */
    bg.setAttribute("x", String(x - legendCell * 1.2));
    bg.setAttribute("y", String(y - legendCell * 1.2));
    bg.setAttribute("width", String(width + legendCell * 2));
    bg.setAttribute("height", String(height + legendCell * 2));
  }, []);

  /** turn on auto-fit any-time # of nodes grows or shrinks */
  useEffect(() => {
    setAutoFit(true);
  }, [nodes.length, setAutoFit]);

  /** fit-legend after any render */
  useEffect(() => {
    fitLegend();
  });

  /**
   * fit zoom any time svg resizes (on window resize, but also when hidden ->
   * visible)
   */
  const [svgSizeRef, svgSize] = useMeasure();
  const svgSizeDeep = JSON.stringify(svgSize);
  useEffect(() => {
    fitZoom();
  }, [svgSizeDeep, fitZoom]);

  return (
    <>
      {/* filters */}
      <div className="flex-row gap-md">
        <Slider
          label="Max nodes"
          layout="horizontal"
          min={1}
          max={Math.min(hardMaxNodes, results.network.nodes.length)}
          step={1}
          value={maxNodes}
          onChange={setMaxNodes}
        />
        <Slider
          label="Min prob."
          layout="horizontal"
          min={probabilityExtent[0]!}
          max={probabilityExtent[1]!}
          step={(probabilityExtent[1]! - probabilityExtent[0]!) / 100}
          value={minProbability}
          onChange={setMinProbability}
        />
      </div>

      {/* svg viz */}
      <svg
        ref={(el) => {
          svgRef.current = el;
          if (el) {
            svgSizeRef(el);
            const svg = d3.select(el);
            /** attach zoom behavior */
            zoom(d3.select(el));
            svg
              /** always prevent scroll on wheel, not just when at scale limit */
              .on("wheel", (event) => event.preventDefault())
              /** auto-fit on dbl click */
              .on("dblclick.zoom", fitZoom);
          }
        }}
        className={classNames("expanded", classes.svg)}
        onClick={(event) => {
          /** clear selected if svg was direct click target */
          if ((event.target as Element).matches("svg"))
            setSelectedNode(undefined);
        }}
      >
        {/* zoom camera */}
        <g ref={zoomRef}>
          {/* links */}
          <g
            stroke={linkColor}
            strokeWidth={lerp(links.length, 500, 1, 0.2, 1)}
            pointerEvents="none"
          >
            {links.map((link, index) => {
              /** is link connected to selected node */
              const selected = selectedNode
                ? link.source === selectedNode.entrez ||
                  link.target === selectedNode.entrez
                : undefined;
              return (
                <line
                  ref={(el) => {
                    if (el) linkRefs.current.set(index, el);
                    else linkRefs.current.delete(index);
                  }}
                  key={index}
                  stroke={
                    selected === true
                      ? selectedLinkColor
                      : selected === false
                        ? "transparent"
                        : ""
                  }
                  strokeWidth={selected === true ? 1 : ""}
                />
              );
            })}
          </g>

          {/* node circles */}
          <g cursor="pointer">
            {nodes.map((node, index) => (
              <circle
                key={index}
                ref={(el) => {
                  if (el) {
                    circleRefs.current.set(index, el);
                    /** attach drag behavior */
                    drag(d3.select(el).data([index]));
                  } else circleRefs.current.delete(index);
                }}
                r={lerp(
                  node.rank,
                  1,
                  nodes.length + 1,
                  nodeRadius,
                  nodeRadius / 2,
                )}
                fill={nodeColors[node.classLabel]}
                stroke={node.entrez === selectedNode?.entrez ? "#000000" : ""}
                onClick={() => setSelectedNode(node)}
              />
            ))}
          </g>

          {/* node labels */}
          <g
            fontSize={nodeRadius / 1.5}
            textAnchor="middle"
            dominantBaseline="central"
            pointerEvents="none"
          >
            {nodes.map((node, index) => (
              <text
                key={index}
                ref={(el) => {
                  if (el) labelRefs.current.set(index, el);
                  else labelRefs.current.delete(index);
                }}
              >
                {(() => {
                  const label = node[labelKey];
                  return typeof label === "number"
                    ? formatNumber(label)
                    : label;
                })()}
              </text>
            ))}
          </g>
        </g>

        {/* legend */}
        <g ref={legendRef}>
          {/* background */}
          <rect fill="#ffffff" stroke="#e0e0e0" />

          {/* colors */}
          {Object.entries(nodeColors).map(([label, color], index) => (
            <Fragment key={index}>
              <circle
                cx={legendCell * legendSpacing}
                cy={(index + 1) * legendCell * legendSpacing}
                r={legendCell / 1.2}
                fill={color}
              />
              <text
                x={legendCell * legendSpacing * 1.75}
                y={(index + 1) * legendCell * legendSpacing}
                fontSize={legendCell}
                dominantBaseline="central"
              >
                {label}
              </text>
            </Fragment>
          ))}

          {/* info */}
          {legendInfo?.map(([line, key, value], index) => (
            <Fragment key={index}>
              <text
                x={legendCell}
                y={line * legendCell * legendSpacing}
                fontSize={legendCell}
                dominantBaseline="central"
                fill="#808080"
              >
                {key}
              </text>
              <text
                x={legendCell * 5}
                y={line * legendCell * legendSpacing}
                fontSize={legendCell}
                dominantBaseline="central"
              >
                {truncate(value, { length: 20 })}
              </text>
            </Fragment>
          ))}
        </g>
      </svg>

      {/* controls */}
      <div className="flex-row gap-md">
        <Select
          label="Node label"
          layout="horizontal"
          options={labelKeyOptions}
          value={labelKey}
          onChange={setLabelKey}
        />
        <CheckBox
          label="Auto-fit"
          value={autoFit}
          onChange={setAutoFit}
          tooltip="Or double-click network background"
        />
        <Button
          icon={<FaDownload />}
          text="SVG"
          tooltip="Download visualization as SVG"
          onClick={() => {
            const element = svgRef.current;
            if (!element) return;
            const { width, height } = element.getBoundingClientRect();
            downloadSvg(element, inputs.name, {
              /** fit viewbox to client-dimensions */
              viewBox: [0, 0, width, height].join(" "),
              style: "font-family: sans-serif;",
            });
          }}
        />
      </div>
    </>
  );
};

export default Network;

/** force nodes apart when overlapping */
const collide = d3.forceCollide().radius(collideDistance / 2);

/** pull nodes toward a center like gravity */
const attraction = d3
  .forceManyBody()
  .strength(attractionStrength)
  .distanceMin(nodeRadius);

/** push/pull nodes together based on links */
const spring = d3
  .forceLink<NodeDatum, LinkDatum>()
  .distance(springDistance)
  .id((d) => d.id);
