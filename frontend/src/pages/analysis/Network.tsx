import { Fragment, useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { useMeasure } from "react-use";
import classNames from "classnames";
import * as d3 from "d3";
import { atom, getDefaultStore, useAtom } from "jotai";
import { clamp, cloneDeep } from "lodash";
import type { AnalysisInputs, AnalysisResults } from "@/api/types";
import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import Exponential from "@/components/Exponential";
import Slider from "@/components/Slider";
import { downloadSvg } from "@/util/download";
import { cos, lerp, sin } from "@/util/math";
import { formatNumber } from "@/util/string";
import classes from "./Network.module.css";

/** only one of these components can be rendered at a time (singleton) */

/** PARAMS */

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
const springStrength = 1;
/** equilibrium distance between linked nodes */
const springDistance = 40;
/** node circle fill colors (keep light to allow dark text) */
const nodeColors: Record<Node["classLabel"], string> = {
  Positive: "#bbf7d0",
  Negative: "#ffedd5",
  Neutral: "#e2e8f0",
};
/** link line stroke color */
const linkColor = "#808080";
/** legend square/text/other size */
const legendCell = 20;
/** legend line spacing factor */
const legendSpacing = 1.5;

type Props = {
  inputs: AnalysisInputs;
  results: AnalysisResults;
};

const Network = ({ inputs, results }: Props) => {
  /** min/max of probabilities */
  const probabilityExtent = d3.extent(
    results.network.nodes.map((node) => node.probability),
  );

  /** filters */
  const [maxNodes, setMaxNodes] = useState(
    Math.min(100, results.network.nodes.length),
  );
  const [minProbability, setMinProbability] = useState(probabilityExtent[0]!);

  /** options */
  const [getAutoFit, setAutoFit] = useAtom(autoFit);

  /** selected node */
  const [getSelectedNode] = useAtom(selectedNode);

  /** node list with filters applied */
  const filteredNodes = results.network.nodes
    .slice(0, maxNodes)
    .filter((node) => node.probability >= minProbability);

  /** mutable node list ids */
  const nodeIds = nodes.map((node) => node.entrez);
  /** filtered node list ids */
  const filteredNodeIds = filteredNodes.map((node) => node.entrez);

  /** link list with filters applied */
  const filteredLinks = results.network.links.filter(
    (link) =>
      filteredNodeIds.includes(link.source) &&
      filteredNodeIds.includes(link.target),
  );

  /** add new nodes to mutable list */
  for (const node of filteredNodes)
    if (!nodeIds.includes(node.entrez)) {
      /** init new node position in spiral based on rank */
      const angle = (360 / 20) * node.rank;
      const dist = (nodeRadius / 4) * node.rank ** 0.75;
      nodes.push({ ...node, x: sin(angle) * dist, y: cos(angle) * dist });
    }

  /** remove nodes from mutable list */
  nodes = nodes.filter((node) => filteredNodeIds.includes(node.entrez));

  /** reset link list */
  links = cloneDeep(filteredLinks);

  /** when filtered data (props, filters, etc) changes */
  const dataChanged = filteredNodeIds.join(",");
  useEffect(() => {
    updateSimulation();
    updateLinkLines();
    updateNodeCircles();
    updateNodeLabels();
    setAutoFit(true);
  }, [dataChanged, setAutoFit]);

  /**
   * fit zoom any time svg resizes (on window resize, but also when hidden ->
   * visible)
   */
  const [svgRef, svgSize] = useMeasure();
  const svgSizeDeep = JSON.stringify(svgSize);
  useEffect(() => {
    fitZoom();
  }, [svgSizeDeep]);

  return (
    <>
      {/* filters/controls */}
      <div className="flex-row gap-md">
        <Slider
          label="Max nodes"
          layout="horizontal"
          min={1}
          max={Math.min(500, results.network.nodes.length)}
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
        <CheckBox
          label="Auto-fit"
          value={getAutoFit}
          onChange={setAutoFit}
          tooltip="Or double-click network"
        />
      </div>

      <div className={classNames("expanded", classes.panels)}>
        {/* selected node info panel */}
        {getSelectedNode ? (
          <div className={classes.panel}>
            <div className="primary">Selected Node</div>
            <div className="mini-table">
              <span>Rank</span>
              <span>{formatNumber(getSelectedNode.rank)}</span>
              <span>Prob.</span>
              <span>
                <Exponential value={getSelectedNode.probability} />
              </span>
              <span>Entrz.</span>
              <span>{getSelectedNode.entrez}</span>
              <span>Sym.</span>
              <span>{getSelectedNode.symbol}</span>
              <span>Name</span>
              <span>{getSelectedNode.name}</span>
              <span>K/N</span>
              <span>{getSelectedNode.knownNovel}</span>
              <span>Class</span>
              <span>{getSelectedNode.classLabel}</span>
            </div>
          </div>
        ) : (
          <span className="secondary">Select a node</span>
        )}

        {/* svg viz */}
        <svg
          ref={(el) => {
            if (!el) return;
            /** when svg element changes */
            svg = d3.select(el);
            /** update svg measure */
            svgRef(el);
            /** attach/re-attach handlers to svg */
            attachZoom();
          }}
          className={classNames("expanded", classes.svg)}
          onClick={(event) => {
            /** clear selected if svg was direct click target */
            if ((event.target as Element).matches("svg")) clearSelected();
          }}
        >
          {/* camera */}
          <g className={zoomLayer}>
            <g
              className={linkLineLayer}
              stroke={linkColor}
              strokeWidth={nodeRadius / 15}
              pointerEvents="none"
            />
            <g className={nodeCircleLayer} cursor="pointer" />
            <g
              className={nodeLabelLayer}
              fontSize={nodeRadius / 1.5}
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
            />
          </g>

          {/* legend */}
          <g>
            {/* background */}
            <rect
              ref={(el) => {
                if (!el) return;

                /** don't consider bg in contents */
                el.removeAttribute("x");
                el.removeAttribute("y");
                el.removeAttribute("width");
                el.removeAttribute("height");

                /** get size of contents */
                const { x, y, width, height } = (
                  el.parentElement as unknown as SVGGElement
                ).getBBox();

                /** auto-fit bg to content */
                el.setAttribute("x", String(x - legendCell));
                el.setAttribute("y", String(y - legendCell));
                el.setAttribute("width", String(width + legendCell * 2));
                el.setAttribute("height", String(height + legendCell * 2));
              }}
              fill="white"
              opacity={0.9}
            />

            {/* colors */}
            {Object.entries(nodeColors).map(([label, color], index) => (
              <Fragment key={index}>
                <rect
                  x={legendCell}
                  y={(index + 1) * legendCell * legendSpacing - legendCell / 2}
                  width={legendCell}
                  height={legendCell}
                  fill={color}
                />
                <text
                  x={legendCell * 2.5}
                  y={(index + 1) * legendCell * legendSpacing}
                  fontSize={legendCell}
                  dominantBaseline="central"
                >
                  {label}
                </text>
              </Fragment>
            ))}

            {/* info */}
            <text
              x={legendCell}
              y={4.5 * legendCell * legendSpacing}
              fontSize={legendCell}
              dominantBaseline="central"
            >
              {formatNumber(filteredNodes.length)} Nodes
            </text>
            <text
              x={legendCell}
              y={5.5 * legendCell * legendSpacing}
              fontSize={legendCell}
              dominantBaseline="central"
            >
              {formatNumber(filteredLinks.length)} Links
            </text>
          </g>
        </svg>
      </div>

      {/* actions */}
      <Button
        icon={<FaDownload />}
        text="SVG"
        tooltip="Download visualization as SVG"
        onClick={() => {
          const element = svg?.node();
          if (!element) return;
          const { width, height } = element.getBoundingClientRect();
          downloadSvg(element, inputs.name, {
            /** fit viewbox to client-dimensions */
            viewBox: [0, 0, width, height].join(" "),
            style: "font-family: sans-serif;",
          });
        }}
      />
    </>
  );
};

export default Network;

/** CLASS NAMES FOR IDENTIFYING SVG ELEMENTS */

const zoomLayer = "zoom";
const linkLineLayer = "links";
const linkLine = "link";
const nodeCircleLayer = "nodes";
const nodeCircle = "node";
const nodeLabelLayer = "labels";
const nodeLabel = "label";

/** TYPES */

type Node = d3.SimulationNodeDatum &
  AnalysisResults["network"]["nodes"][number];
type Link = d3.SimulationLinkDatum<Node>;

/** MUTABLE GLOBAL LISTS/OBJECTS FOR D3 */

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
let nodes: Node[] = [];
let links: Link[] = [];

/** GLOBAL STATE SETTABLE FROM REACT OR D3 */

/** whether to auto-fit zoom on every simulation tick */
const autoFit = atom(true);
/** currently selected node */
const selectedNode = atom<Node | null>(null);

/** PHYSICS SIMULATION */

/** forces nodes apart when overlapping */
const collide = d3.forceCollide().radius(collideDistance / 2);

/** pushes/pulls nodes together based on links */
const spring = d3
  .forceLink()
  .strength(springStrength)
  .distance(springDistance)
  .id((d) => (d as Node).entrez);

/** pull nodes toward a center like gravity */
const attraction = d3
  .forceManyBody()
  .strength(attractionStrength)
  .distanceMin(nodeRadius);

/** when simulation ticks forward */
const onTick = () => {
  positionLinkLines();
  positionNodeCircles();
  positionNodeLabels();
  if (getDefaultStore().get(autoFit)) fitZoom();
};

/** simulation object */
const simulation = d3
  .forceSimulation()
  .alphaDecay(simulationDecay)
  .force("collide", collide)
  .force("attraction", attraction)
  .force("spring", spring)
  .on("tick", onTick);

/** ON DATA CHANGE */

/** update simulation data */
const updateSimulation = () => {
  /** update data */
  simulation.nodes(nodes);
  spring.links(links);
  /** reheat simulation */
  simulation.alpha(2).restart();
};

/** create/remove link lines */
const updateLinkLines = () =>
  svg
    ?.select("." + linkLineLayer)
    .selectAll<SVGLineElement, Link>("." + linkLine)
    .data(links)
    .join("line")
    .attr("class", linkLine);

/** create/remove node circles */
const updateNodeCircles = () =>
  svg
    ?.select("." + nodeCircleLayer)
    .selectAll<SVGCircleElement, Node>("." + nodeCircle)
    .data(nodes)
    .call(dragHandler)
    .join("circle")
    .attr("class", classNames(nodeCircle, classes.node))
    .attr("r", (d) =>
      lerp(d.rank, 1, nodes.length + 1, nodeRadius, nodeRadius / 2),
    )
    .attr("fill", (d) => nodeColors[d.classLabel])
    .on("click", function (event, d) {
      /** select node */
      clearSelected();
      this.setAttribute("data-selected", "");
      getDefaultStore().set(selectedNode, d);
    });

/** create/remove node labels */
const updateNodeLabels = () =>
  svg
    ?.select("." + nodeLabelLayer)
    .selectAll<SVGTextElement, Node>("." + nodeLabel)
    .data(nodes)
    .join("text")
    .attr("class", nodeLabel)
    .text((d) => d.entrez);

/** unset selected node */
const clearSelected = () => {
  getDefaultStore().set(selectedNode, null);
  document
    .querySelectorAll("." + nodeCircle + "[data-selected]")
    .forEach((el) => el.removeAttribute("data-selected"));
};

/** ON SIMULATION TICK */

/** update link line positions */
const positionLinkLines = () =>
  svg
    ?.select("." + linkLineLayer)
    .selectAll<SVGLineElement, Link>("." + linkLine)
    .attr("x1", (d) => (d.source as Node).x || 0)
    .attr("y1", (d) => (d.source as Node).y || 0)
    .attr("x2", (d) => (d.target as Node).x || 0)
    .attr("y2", (d) => (d.target as Node).y || 0);

/** update node circle positions */
const positionNodeCircles = () =>
  svg
    ?.select<SVGGElement>("." + nodeCircleLayer)
    .selectAll<SVGCircleElement, Node>("." + nodeCircle)
    .attr("cx", (d) => d.x || 0)
    .attr("cy", (d) => d.y || 0);

/** update node label positions */
const positionNodeLabels = () =>
  svg
    ?.select("." + nodeLabelLayer)
    .selectAll<SVGTextElement, Node>("." + nodeLabel)
    .attr("x", (d) => d.x || 0)
    .attr("y", (d) => d.y || 0);

/** CAMERA ZOOM/PAN */

/** zoom/pan handler */
const zoom = d3
  .zoom<SVGSVGElement, unknown>()
  .scaleExtent([minZoom, maxZoom])
  /** on zoom/pan */
  .on("zoom", (event) => {
    /** if zoom was due to direct user interaction (wheel, drag, pinch, etc) */
    if (event.sourceEvent) getDefaultStore().set(autoFit, false);
    /** update zoom camera transform */
    svg?.select("." + zoomLayer).attr("transform", event.transform.toString());
  });

/** attach zoom handlers to svg */
const attachZoom = () => {
  if (!svg) return;
  zoom(svg);
  svg
    /** always prevent scroll on wheel, not just when at scale limit */
    .on("wheel", (event) => event.preventDefault())
    /** on double click */
    .on("dblclick.zoom", () => {
      getDefaultStore().set(autoFit, true);
      fitZoom();
    });
};

/** fit zoom camera to contents of svg */
const fitZoom = () => {
  if (!svg) return;

  /** get svg size */
  const container = svg.node()?.getBoundingClientRect();
  /** get size of svg contents */
  const contents = svg
    .select<SVGGElement>("." + zoomLayer)
    ?.node()
    ?.getBBox();

  if (
    !container?.width ||
    !container?.height ||
    !contents?.width ||
    !contents?.height
  )
    return;

  /** get center point of contents */
  const midX = contents.x + contents.width / 2;
  const midY = contents.y + contents.height / 2;

  /** determine scale up/down to contain */
  let scale =
    1 /
    Math.max(
      contents.width / (container.width - fitPadding * 2),
      contents.height / (container.height - fitPadding * 2),
    );

  /** limit scale */
  scale = clamp(scale, minZoom, maxZoom);

  /** determine center position */
  const translateX = container.width / 2 - scale * midX;
  const translateY = container.height / 2 - scale * midY;

  /** set new camera */
  zoom.transform(
    svg,
    d3.zoomIdentity.translate(translateX, translateY).scale(scale),
  );
};

/** NODE DRAG */

const dragHandler = d3
  .drag<SVGCircleElement, Node>()
  .on("drag", (event, d) => {
    simulation.alpha(1).restart();
    d.fx = event.x;
    d.fy = event.y;
  })
  .on("end", (event, d) => {
    d.fx = null;
    d.fy = null;
  });
