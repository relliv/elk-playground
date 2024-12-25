import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";

import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import "./App.css";

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

function App() {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorInstance) {
      const editor = monaco.editor.create(editorRef.current!, {
        value: "",
        language: "dbml",
        theme: "vs-dark",
        minimap: {
          enabled: false,
        },
      });

      editorInstance = editor;
    }
  }, [editorRef]);

  return (
    <div className="playground">
      {/* Config Editor */}
      <div className="monaco-editor-wrapper">
        <div id="editor" className="editor" ref={editorRef}></div>
      </div>

      {/* React Flow */}
      <div className="reactflow-wrapper">
        <ReactFlow nodes={initialNodes} edges={initialEdges} />
      </div>
    </div>
  );
}

export default App;
