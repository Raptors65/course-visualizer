"use client";

import {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from "react-force-graph-3d";

import coursesData from "../data/courses-data.json";
import { MutableRefObject, useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/search-bar";

const ForceGraph = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [focusedCourse, setFocusedCourse] = useState("");

  const fgRef: MutableRefObject<ForceGraphMethods<
    NodeObject<{ id: string; name: string }>,
    LinkObject<{ id: string; name: string }, { source: string; target: string }>
  > | null> = useRef(null);

  const focusNode = useCallback(
    (
      node: NodeObject<
        NodeObject<{
          id: string;
          name: string;
        }>
      >
    ) => {
      if (node.x === undefined || node.y === undefined || node.z === undefined)
        return;

      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      setFocusedCourse(node.id);

      fgRef.current!.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        { x: node.x, y: node.y, z: node.z }, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    },
    [fgRef]
  );

  const handleSelectedCourse = (course: string) => {
    const node = coursesData.nodes.find(
      (node) => node.id === course
    ) as NodeObject<
      NodeObject<{
        id: string;
        name: string;
      }>
    >;

    if (node.x === undefined || node.y === undefined || node.z === undefined)
      return;

    const distance = 80;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    setFocusedCourse(course);

    fgRef.current!.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      { x: node.x, y: node.y, z: node.z }, // lookAt ({ x, y, z })
      3000 // ms transition duration
    );
  };

  return (
    <main>
      <SearchBar
        courses={coursesData.nodes}
        onCourseSelect={handleSelectedCourse}
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
        // @ts-expect-error temp
        onNodeClick={focusNode}
        enableNodeDrag={false}
      />
    </main>
  );
}
