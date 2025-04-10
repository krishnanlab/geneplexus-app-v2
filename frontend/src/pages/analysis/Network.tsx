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
import clsx from "clsx";
import * as d3 from "d3";
import domtoimage from "dom-to-image-more";
import { clamp, cloneDeep, truncate } from "lodash";
import { useElementSize, useMeasure } from "@reactuses/core";
import type { AnalysisInputs, AnalysisResults } from "@/api/convert";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Flex from "@/components/Flex";
import type { Option } from "@/components/SelectSingle";
import SelectSingle from "@/components/SelectSingle";
import Slider from "@/components/Slider";
import { theme } from "@/global/theme";
import { downloadPng, downloadSvg } from "@/util/download";
import { lerp } from "@/util/math";
import { formatNumber } from "@/util/string";
import classes from "./Network.module.css";

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
const nodeColors: Record<Node["classLabel"] | "Node", string> = {
  Positive: theme["deep-light"],
  Negative: theme["accent-light"],
  Neutral: theme["light-gray"],
  /** fallback */
  Node: theme["light-gray"],
};
/** edge line stroke color */
const edgeColor = theme["light-gray"];
/** selected edge line stroke color */
const selectedEdgeColor = theme["accent"];
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
  { id: "symbol", primary: "Symbol", icon: <FaAt /> },
  { id: "entrez", primary: "Entrez", icon: <FaBarcode /> },
  { id: "rank", primary: "Rank", icon: <FaRankingStar /> },
  { id: "probability", primary: "Probability", icon: <FaPercent /> },
] as const;

const Network = ({ inputs, results }: Props) => {
  /** element refs */
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<SVGGElement | null>(null);
  const legendRef = useRef<SVGGElement | null>(null);
  const edgeRefs = useRef<Map<number, SVGLineElement>>(new Map());
  const circleRefs = useRef<Map<number, SVGCircleElement>>(new Map());
  const labelRefs = useRef<Map<number, SVGTextElement>>(new Map());

  /** max # of nodes to display, in order of rank */
  const [maxNodes, setMaxNodes] = useState(
    Math.min(Math.floor(hardMaxNodes / 10), results.network.nodes.length),
  );

  /** min/max of node probabilities */
  const [minNodeProb = 0, maxNodeProb = 1] = d3.extent(
    results.network.nodes.map((node) => node.probability),
  );

  /** don't display nodes below this probability */
  const [nodeProbThresh, setNodeProbThresh] = useState(0.0002);

  /** don't display edges below this weight */
  const [edgeWeightThresh, setEdgeWeightThresh] = useState(0);

  /** min/max of edge weights */
  const [minEdgeWeight = 0, maxEdgeWeight = 1] = d3.extent(
    results.network.edges.map((edge) => edge.weight),
  );

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
        .filter((node) => node.probability >= nodeProbThresh)
        .slice(0, maxNodes),
    [results.network.nodes, nodeProbThresh, maxNodes],
  );

  /** quick node lookup */
  const nodeLookup = useMemo(
    () => Object.fromEntries(nodes.map((node, index) => [node.entrez, index])),
    [nodes],
  );

  /** edges to display */
  const edges = useMemo(
    () =>
      results.network.edges
        .filter(
          (edge) =>
            edge.source in nodeLookup &&
            edge.target in nodeLookup &&
            edge.weight > edgeWeightThresh,
        )
        .map((edge) => ({
          ...edge,
          sourceIndex: nodeLookup[edge.source]!,
          targetIndex: nodeLookup[edge.target]!,
        })),
    [nodeLookup, results.network.edges, edgeWeightThresh],
  );

  /** legend info */
  const legend: (readonly [string, string])[][] = [];

  /** colors */
  legend.push(
    Object.entries(nodeColors)
      /** don't show color if no nodes of that color */
      .filter(
        ([label]) => nodes.filter((node) => node.classLabel === label).length,
      )
      .map(([label, color]) => [color, label] as const),
  );

  /** counts */
  legend.push([
    ["Nodes", formatNumber(nodes.length)],
    ["Edges", formatNumber(edges.length)],
  ]);

  /** selected node info */
  if (selectedNode)
    legend.push([
      ["Selected Node", ""],
      ["Rank", formatNumber(selectedNode.rank)],
      ["Prob.", formatNumber(selectedNode.probability)],
      ["Entrz.", selectedNode.entrez],
      ["Sym.", selectedNode.symbol],
      ["Name", selectedNode.name],
      ["K/N", selectedNode.knownNovel],
      ["Class", selectedNode.classLabel],
    ]);

  /** incrementing legend line (y) number */
  let legendLine = -0.5;

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

          /** position edges */
          (simulation.force("spring") as typeof spring)
            .links()
            .forEach((edge, index) => {
              const line = edgeRefs.current.get(index);
              const source = simulation.nodes().at(edge.sourceIndex);
              const target = simulation.nodes().at(edge.targetIndex);
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
          simulation.alpha(0.1).restart();
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

  /** update simulation to be in-sync with declarative nodes/edges */
  useEffect(() => {
    /** update nodes */
    const d3nodeLookup = Object.fromEntries(
      simulation.nodes().map((node) => [node.id, node]),
    );
    simulation.nodes(
      nodes.map((node) => d3nodeLookup[node.entrez] ?? { id: node.entrez }),
    );

    /** update edges */
    (simulation.force("spring") as typeof spring).links(cloneDeep(edges));

    /** reheat */
    simulation.alpha(0.1).restart();
  }, [nodes, edges, simulation]);

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
  const svgSize = useElementSize(svgRef);
  const svgSizeDeep = JSON.stringify(svgSize);
  useEffect(() => {
    fitZoom();
    setAutoFit(true);
  }, [svgSizeDeep, fitZoom]);

  /** client dimensions of svg */
  const [{ width, height }] = useMeasure(svgRef);

  return (
    <>
      {/* filters */}
      <Flex>
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
          label="Min node probability"
          layout="horizontal"
          min={minNodeProb}
          max={maxNodeProb}
          step={(maxNodeProb - minNodeProb) / 100}
          value={nodeProbThresh}
          onChange={setNodeProbThresh}
        />
        <Slider
          label="Min edge weight"
          layout="horizontal"
          min={minEdgeWeight}
          max={maxEdgeWeight}
          step={(maxEdgeWeight - minEdgeWeight) / 100}
          value={edgeWeightThresh}
          onChange={setEdgeWeightThresh}
        />
      </Flex>

      {/* https://github.com/1904labs/dom-to-image-more/issues/201 */}
      <div>
        {/* svg viz */}
        <svg
          ref={(el) => {
            svgRef.current = el;
            if (el) {
              const svg = d3.select(el);
              /** attach zoom behavior */
              zoom(d3.select(el));
              svg
                /** auto-fit on dbl click */
                .on("dblclick.zoom", () => {
                  fitZoom();
                  setAutoFit(true);
                });
            }
          }}
          viewBox={[0, 0, width, height].join(" ")}
          className={clsx("expanded", classes.svg)}
          onClick={(event) => {
            /** clear selected if svg was direct click target */
            if ((event.target as Element).matches("svg"))
              setSelectedNode(undefined);
          }}
        >
          {/* zoom camera */}
          <g ref={zoomRef}>
            {/* edges */}
            <g
              stroke={edgeColor}
              strokeWidth={lerp(
                edges.length,
                500,
                0,
                nodeRadius / 50,
                nodeRadius / 10,
              )}
              pointerEvents="none"
            >
              {edges.map((edge, index) => {
                /** is edge connected to selected node */
                const selected = selectedNode
                  ? edge.source === selectedNode.entrez ||
                    edge.target === selectedNode.entrez
                  : undefined;
                return (
                  <line
                    ref={(el) => {
                      if (el) edgeRefs.current.set(index, el);
                      else edgeRefs.current.delete(index);
                    }}
                    key={index}
                    stroke={
                      selected === true
                        ? selectedEdgeColor
                        : selected === false
                          ? "transparent"
                          : ""
                    }
                    strokeWidth={edge.weight / 2}
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
                  className={classes.node}
                  r={lerp(
                    node.rank,
                    1,
                    nodes.length + 1,
                    nodeRadius,
                    nodeRadius / 2,
                  )}
                  fill={nodeColors[node.classLabel || "Node"]}
                  stroke={
                    node.entrez === selectedNode?.entrez ? theme["black"] : ""
                  }
                  tabIndex={0}
                  onClick={() => setSelectedNode(node)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelectedNode(node);
                  }}
                  aria-label={`Node rank ${node.rank}, ${node.symbol} ${node.name}, probability ${formatNumber(node.probability)}`}
                />
              ))}
            </g>

            {/* node labels */}
            <g
              strokeWidth={nodeRadius / 20}
              strokeLinejoin="round"
              strokeLinecap="round"
              paintOrder="stroke"
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
                  stroke={nodeColors[node.classLabel]}
                  dominantBaseline="central"
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
            <rect fill={theme["white"]} stroke={theme["light-gray"]} />

            {/* info */}
            {legend?.map((group) => {
              /** small gap between groups */
              legendLine += 0.5;

              return group.map(([key, value]) => {
                /** new line */
                legendLine++;

                /** is colored icon to show */
                const icon = key.startsWith("#") || key.startsWith("hsl");
                /** line y */
                const y = legendLine * legendCell * legendSpacing;

                return (
                  <Fragment key={y}>
                    {icon ? (
                      <circle
                        cx={legendCell * legendSpacing}
                        cy={y}
                        r={legendCell / 1.2}
                        fill={key}
                      />
                    ) : (
                      <text
                        x={legendCell}
                        y={y}
                        fontSize={legendCell}
                        dominantBaseline="central"
                        fill={theme["dark-gray"]}
                      >
                        {key}
                      </text>
                    )}
                    <text
                      x={
                        icon
                          ? legendCell * legendSpacing * 1.75
                          : legendCell * 5
                      }
                      y={y}
                      fontSize={legendCell}
                      dominantBaseline="central"
                    >
                      {truncate(value, { length: 20 })}
                    </text>
                  </Fragment>
                );
              });
            })}
          </g>
        </svg>
      </div>

      {/* controls */}
      <Flex>
        <SelectSingle
          label="Node labels"
          layout="horizontal"
          options={labelKeyOptions}
          value={labelKey}
          onChange={setLabelKey}
        />
        <CheckBox
          label="Auto-fit"
          value={autoFit}
          onChange={(value) => {
            if (value) fitZoom();
            setAutoFit(value);
          }}
          tooltip="Or double-click network background"
        />
        <Button
          icon={<FaDownload />}
          text="SVG"
          tooltip="Download visualization as SVG"
          onClick={() => {
            const element = svgRef.current;
            if (!element) return;
            downloadSvg(element, [inputs.name, "network"], {
              style: "font-family: sans-serif;",
            });
          }}
        />

        <Button
          icon={<FaDownload />}
          text="PNG"
          tooltip="Download visualization as PNG"
          onClick={async () => {
            const element = svgRef.current;
            if (!element) return;
            await downloadPng(
              await domtoimage.toPng(element.closest("div")!, {
                // @ts-expect-error "more" type defs missing
                scale: 2,
                width,
                height,
              }),
              "network",
            );
          }}
        />
      </Flex>
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

/** push/pull nodes together based on edges */
const spring = d3
  .forceLink<NodeDatum, LinkDatum>()
  .distance(springDistance)
  .id((d) => d.id);
