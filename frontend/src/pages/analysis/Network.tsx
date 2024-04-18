import { useEffect, useState } from "react";
import { useMeasure } from "react-use";
import classNames from "classnames";
import * as d3 from "d3";
import { clamp, cloneDeep } from "lodash";
import type { AnalysisResults } from "@/api/types";
import Slider from "@/components/Slider";
import classes from "./Network.module.css";

/** min zoom (scale factor) */
const minZoom = 0.2;
/** lower zoom (scale factor) */
const maxZoom = 2;
/** empty space to leave around view when fitting (in svg units) */
const fitPadding = 20;
/** node circle radius */
const nodeRadius = 10;
/** distance under which nodes will be forced apart */
const collideDistance = 30;
/** how much nodes attract each other */
const attractionStrength = 2;
/** equilibrium distance between linked nodes */
const springDistance = 40;
/** node fill colors (keep light to allow dark text) */
const nodeColors: Record<Node["classLabel"], string> = {
  P: "#86efac",
  N: "#c4b5fd",
  U: "#cbd5e1",
};

type Props = {
  results: AnalysisResults;
};

const Network = ({ results }: Props) => {
  /** min/max of probabilities */
  const probabilityExtent = d3.extent(
    results.network.nodes.map((node) => node.probability),
  );

  /** filters */
  const [maxNodes, setMaxNodes] = useState(
    Math.min(50, results.network.nodes.length),
  );
  const [minProbability, setMinProbability] = useState(probabilityExtent[0]!);

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
    if (!nodeIds.includes(node.entrez)) nodes.push(node);

  /** remove nodes from mutable list */
  nodes = nodes.filter((node) => filteredNodeIds.includes(node.entrez));

  /** reset link list */
  links = cloneDeep(filteredLinks);

  /** when data changes */
  updateSimulation();
  updateNodeCircles();
  updateLinkLines();

  /** keep zoombox in same as client dimensions to avoid unexpected scaling */
  const [ref, { width, height }] = useMeasure<SVGSVGElement>();

  return (
    <div className={classNames("expanded", classes.panels)}>
      {/* side panel */}
      <div className={classes.panel}>
        {/* filters/controls */}
        <Slider
          label="Max nodes"
          min={1}
          max={Math.min(100, results.network.nodes.length)}
          step={1}
          width="100%"
          value={maxNodes}
          onChange={setMaxNodes}
        />
        <Slider
          label="Min prob."
          min={probabilityExtent[0]!}
          max={probabilityExtent[1]!}
          step={(probabilityExtent[1]! - probabilityExtent[0]!) / 100}
          width="100%"
          value={minProbability}
          onChange={setMinProbability}
        />
      </div>
      <svg
        ref={(el) => {
          if (!el) return;
          svg = d3.select(el);
          ref(el);
          attachZoom();
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={[0, 0, width, height].join(" ")}
        className={classes.svg}
      >
        <g className={zoomClass}>
          <g className={linksClass} />
          <g className={nodesClass} />
        </g>
      </svg>
    </div>
  );
};

export default Network;

/** global/singleton svg element */
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;

/** class names for identifying svg elements */
const zoomClass = "zoom";
const nodesClass = "nodes";
const nodeClass = "node";
const linksClass = "links";
const linkClass = "link";

type Node = d3.SimulationNodeDatum &
  AnalysisResults["network"]["nodes"][number];
type Link = d3.SimulationLinkDatum<Node>;

/** mutable global node list for d3 */
let nodes: Node[] = [];
/** mutable global link list for d3 */
let links: Link[] = [];

/** forces nodes apart when overlapping */
const collide = d3.forceCollide().radius(collideDistance / 2);

/** pushes/pulls nodes together based on links */
const spring = d3
  .forceLink()
  .distance(springDistance)
  .id((d) => (d as Node).entrez);

/** pull nodes toward a center like gravity */
const attraction = d3
  .forceManyBody()
  .strength(attractionStrength)
  .distanceMin(nodeRadius);

/** when simulation ticks forward */
const onTick = () => {
  positionNodeCircles();
  positionLinkLines();
};

/** when simulation stops (reaches rest) */
const onEnd = () => {
  //
};

/** global simulation object */
const simulation = d3
  .forceSimulation()
  .force("collide", collide)
  .force("attraction", attraction)
  .force("spring", spring)
  .on("tick", onTick)
  .on("end", onEnd);

const updateSimulation = () => {
  /** update data */
  simulation.nodes(nodes);
  spring.links(links);
  simulation.alpha(1).restart();
};

/** unpin all nodes by removing their fixed positions */
const unpinAll = () => {
  simulation.nodes().forEach((node) => {
    node.fx = null;
    node.fy = null;
  });
  simulation.alpha(1).restart();
};

/** pin all nodes by fixing their positions */
const pinAll = () => {
  simulation.nodes().forEach((node) => {
    node.fx = node.x;
    node.fy = node.y;
  });
  simulation.alpha(0).stop();
};

/** create/remove node circles */
const updateNodeCircles = () =>
  svg
    ?.select("." + nodesClass)
    .selectAll<SVGCircleElement, Node>("." + nodeClass)
    .data(nodes)
    .call(dragHandler)
    .join("circle")
    .attr("class", nodeClass)
    .attr("r", nodeRadius)
    .attr("fill", (d) => nodeColors[d.classLabel]);

/** update node circle positions */
const positionNodeCircles = () =>
  svg
    ?.select<SVGGElement>("." + nodesClass)
    .selectAll<SVGCircleElement, Node>("." + nodeClass)
    .attr("cx", (d) => d.x || 0)
    .attr("cy", (d) => d.y || 0);

/** create/remove link lines */
const updateLinkLines = () =>
  svg
    ?.select("." + linksClass)
    .selectAll<SVGLineElement, Link>("." + linkClass)
    .data(links)
    .join("line")
    .attr("class", linkClass)
    .attr("stroke", "#a0a0a0");

/** update link line positions */
const positionLinkLines = () =>
  svg
    ?.select("." + linksClass)
    .selectAll<SVGLineElement, Link>("." + linkClass)
    .attr("x1", (d) => (d.source as Node).x || 0)
    .attr("y1", (d) => (d.source as Node).y || 0)
    .attr("x2", (d) => (d.target as Node).x || 0)
    .attr("y2", (d) => (d.target as Node).y || 0);

/** zoom/pan handler */
const zoom = d3
  .zoom<SVGSVGElement, unknown>()
  .scaleExtent([minZoom, maxZoom * 10])
  .on("zoom", (event) =>
    svg?.select("." + zoomClass).attr("transform", event.transform),
  );

/** attach/re-attach zoom handlers to svg when it changes */
const attachZoom = () => {
  if (!svg) return;
  zoom(svg);
  svg
    /** always prevent scroll on wheel, not just when at scale limit */
    .on("wheel", (event) => event.preventDefault())
    /** double click handler */
    .on("dblclick.zoom", fitZoom);
  fitZoom();
};

/** fit zoom camera to contents of svg */
const fitZoom = () => {
  if (!svg) return;
  const container = svg.node()?.getBoundingClientRect();
  const contents = svg
    .select<SVGGElement>("." + zoomClass)
    ?.node()
    ?.getBBox();

  if (
    !container?.width ||
    !container?.height ||
    !contents?.width ||
    !contents?.height
  )
    return;

  const midX = contents.x + contents.width / 2;
  const midY = contents.y + contents.height / 2;

  const scale = clamp(
    1 /
      Math.max(
        contents.width / (container.width - fitPadding * 2),
        contents.height / (container.height - fitPadding * 2),
      ),
    minZoom,
    maxZoom,
  );

  const translateX = container.width / 2 - scale * midX;
  const translateY = container.height / 2 - scale * midY;

  zoom.transform(
    svg,
    d3.zoomIdentity.translate(translateX, translateY).scale(scale),
  );
};

let dragging = false;

const onDragStart = () => (dragging = true);

const onDrag = (
  event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
  d: Node,
) => {
  simulation.alpha(1).restart();
  d.fx = event.x;
  d.fy = event.y;
};

const onDragEnd = (
  event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
  d: Node,
) => {
  simulation.alpha(1).restart();
  d.fx = null;
  d.fy = null;
  dragging = false;
};

const dragHandler = d3
  .drag<SVGCircleElement, Node>()
  .on("start", onDragStart)
  .on("drag", onDrag)
  .on("end", onDragEnd);
