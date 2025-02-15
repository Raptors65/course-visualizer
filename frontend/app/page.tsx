"use client";

import {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from "react-force-graph-3d";

import coursesData from "../data/courses-data.json";
import { RefObject, useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import tinyColor, { type ColorInput } from "tinycolor2";
import SearchBar from "@/components/search-bar";
import { Node } from "@/lib/types";

const ForceGraph = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

const val = 1;
const nodeRelSize = 4;
const nodeResolution = 8;

const CAMERA_DISTANCE2NODES_FACTOR = 170;

const colorStr2Hex = (str: ColorInput | number) =>
  typeof str !== "number" ? parseInt(tinyColor(str).toHex(), 16) : str;

export default function Home() {
  const [focusedCourse, setFocusedCourse] = useState<Node | null>(null);
  const [search, setSearch] = useState("");
  const [isEngineRunning, setIsEngineRunning] = useState(true);

  const fgRef: RefObject<ForceGraphMethods<
    NodeObject<{ id: string; name: string }>,
    LinkObject<{ id: string; name: string }, { source: string; target: string }>
  > | null> = useRef(null);

  const focusNode = useCallback(
    (node: {
      [others: string]: unknown;
      id?: string | number | undefined;
      x?: number | undefined;
      y?: number | undefined;
      z?: number | undefined;
      vx?: number | undefined;
      vy?: number | undefined;
      vz?: number | undefined;
      fx?: number | undefined;
      fy?: number | undefined;
      fz?: number | undefined;
    }) => {
      if (node.x === undefined || node.y === undefined || node.z === undefined)
        return;

      setSearch(`${node.id} - ${node.name}`);
      setFocusedCourse({ id: node.id as string, name: node.name as string });

      // Aim at node from outside it
      const distance = 100;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      fgRef.current!.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        { x: node.x, y: node.y, z: node.z }, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    },
    [fgRef]
  );

  const handleSelectedCourse = (course: Node | null) => {
    if (course === null) {
      if (focusedCourse !== null) {
        setFocusedCourse(null);
        fgRef.current!.cameraPosition(
          {
            x: 0,
            y: 0,
            z:
              Math.cbrt(coursesData.nodes.length) *
              CAMERA_DISTANCE2NODES_FACTOR,
          },
          { x: 0, y: 0, z: 0 },
          3000
        );
      }
      return;
    }

    const node = coursesData.nodes.find(
      (node) => node.id === course.id
    ) as NodeObject<
      NodeObject<{
        id: string;
        name: string;
      }>
    >;

    focusNode(node);
  };

  const getThreeObject = useCallback(
    (node: {
      [others: string]: unknown;
      id?: string | number | undefined;
      x?: number | undefined;
      y?: number | undefined;
      z?: number | undefined;
      vx?: number | undefined;
      vy?: number | undefined;
      vz?: number | undefined;
      fx?: number | undefined;
      fy?: number | undefined;
      fz?: number | undefined;
    }) => {
      const radius = Math.cbrt(val) * nodeRelSize;
      const numSegments = nodeResolution;

      const geometry = new THREE.SphereGeometry(
        radius,
        numSegments,
        numSegments
      );
      const material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(
          colorStr2Hex((node.color as number | string) || "#ffffaa")
        ),
        transparent: true,
        opacity:
          focusedCourse === null || node.id === focusedCourse.id ? 0.75 : 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      return mesh;
    },
    [focusedCourse]
  );

  return (
    <main>
      <SearchBar
        courses={coursesData.nodes}
        links={coursesData.links}
        onCourseSelect={handleSelectedCourse}
        selectedCourse={focusedCourse}
        search={search}
        onSearchChange={setSearch}
        isLoading={isEngineRunning}
      />
      <ForceGraph
        graphData={coursesData}
        // @ts-expect-error temp
        nodeAutoColorBy={(node) => node.id.match(/[a-zA-Z]+/)![0]}
        nodeLabel={(node) => `${node.id} - ${node.name}`}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        // @ts-expect-error won't be null
        ref={fgRef}
        onNodeClick={focusNode}
        enableNodeDrag={false}
        nodeThreeObject={getThreeObject}
        onEngineStop={() => setIsEngineRunning(false)}
      />
    </main>
  );
}
