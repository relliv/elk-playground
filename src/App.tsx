import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";

import {
  ReactFlow,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";

import "./App.css";

const elk = new ELK();

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

const initialNodes = Array.from({ length: 25 }, (_, i) => ({
  id: `${i + 1}`,
  position: { x: i * 150, y: i * 150 },
  data: {
    label: `Node ${i + 1}`,
  },
}));
const initialEdges = Array.from({ length: 24 }, (_, i) => ({
  id: `e${i + 1}`,
  source: `${i + 1}`,
  target: `${i + 2}`,
}));

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: any = {}
) => {
  const isHorizontal = options?.["elk.direction"] === "RIGHT";

  const graph: ElkNode = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node: any) => {
      return {
        ...node,
        targetPosition: isHorizontal ? "left" : "top",
        sourcePosition: isHorizontal ? "right" : "bottom",
        width: 200,
        height: 100,
      };
    }),
    edges: edges as any,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph: any) => {
      return {
        nodes: layoutedGraph.children.map((node: any) => ({
          ...node,
          position: { x: node.x, y: node.y },
        })),
        edges: layoutedGraph.edges,
      };
    })
    .catch(console.error);
};

function App() {
  const editorRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const [elkOptions, setElkOptions] = useState<string>(
    [
      "{",
      '\t"elk.algorithm": "random",',
      '\t"elk.direction": "DOWN",',
      '\t"elk.layered.spacing.nodeNodeBetweenLayers": 80,',
      '\t"elk.spacing.nodeNode": 50,',
      '\t"elk.padding": 50,',
      '\t"elk.spacing.edgeEdge": 20',
      "}",
    ].join("\n")
  );

  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!editorInstance) {
      const editor = monaco.editor.create(editorRef.current!, {
        value: "",
        language: "json",
        theme: "vs-dark",
        minimap: {
          enabled: false,
        },
      });

      editorInstance = editor;

      editorInstance?.getModel()?.onDidChangeContent(() => {
        const value = editorInstance!.getValue();

        setElkOptions(value);
      });

      editorInstance?.getModel()?.setValue(elkOptions);
    }
  }, [editorRef]);

  useEffect(() => {
    const _nodes = nodes,
      _edges = edges;

    getLayoutedElements(_nodes, _edges, JSON.parse(elkOptions)).then(
      ({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        setTimeout(
          () => window.requestAnimationFrame(() => fitView({ padding: 0.01 })),
          250
        );
      }
    );
  }, [elkOptions]);

  return (
    <div className="playground">
      {/* Config Editor */}
      <div className="monaco-editor-wrapper">
        <div id="editor" className="editor" ref={editorRef}></div>
      </div>

      {/* React Flow */}
      <div className="reactflow-wrapper">
        <ReactFlow nodes={nodes} edges={edges} zooml />
      </div>
    </div>
  );
}

const AppWithProvider = (props: any): JSX.Element => {
  return (
    <ReactFlowProvider>
      <App {...props} />
    </ReactFlowProvider>
  );
};

export default AppWithProvider;
