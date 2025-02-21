"use client";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow,
  getOutgoers,
  reconnectEdge,
  ReactFlowProvider,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import "@xyflow/react/dist/style.css";
import LLMNode from "./nodes/LLMNode";
import OutputNode from "./nodes/OutputNode";
import BabyAGINode from "./nodes/BabyAGINode";
import VectorStoreNode from "./nodes/VectorStoreNode";
import PromptNode from "./nodes/PromptNode";
import { DnDProvider, useDragAndDrop } from "./DragAndDropContext";
import CanvasSideBar from "./CanvasSideBar";
import { Button } from "@/components/ui/button";
import { Bomb, Play, Save } from "lucide-react";
import uuid4 from "uuid4";
import ReActNode from "./nodes/ReActNode";
import TranscriptionNode from "./nodes/TranscriptionNode";
import EmbeddingsNode from "./nodes/EmbeddingsNode";
import WebBrowserToolNode from "./nodes/WebBrowserToolNode";
import PromptTemplateNode from "./nodes/PromptTemplateNode";
import TextInputNode from "./nodes/TextInputNode";
import DuckDuckGoSearchToolNode from "./nodes/TavilySearchToolNode";
import ReActNodeConversational from "./nodes/ReActNodeConversational";
import AutoGPTNode from "./nodes/AutoGPTNode";
import SPINAnalysisNode from "./nodes/SPINAnalysisNode";

const nodeTypes = {
  llmNode: LLMNode,
  outputNode: OutputNode,
  babyAGINode: BabyAGINode,
  vectorStoreNode: VectorStoreNode,
  promptNode: PromptNode,
  reActNode: ReActNode,
  reActConversationalNode: ReActNodeConversational,
  transcriptionNode: TranscriptionNode,
  embeddingsNode: EmbeddingsNode,
  webBrowserToolNode: WebBrowserToolNode,
  promptTemplateNode: PromptTemplateNode,
  textInputNode: TextInputNode,
  duckDuckGoSearchToolNode: DuckDuckGoSearchToolNode,
  autoGPTNode: AutoGPTNode,
  spinAnalysisNode: SPINAnalysisNode,
};

const sideBarNodeNames = {
  llmNode: "LLM",
  outputNode: "Output",
  babyAGINode: "Baby AGI",
  vectorStoreNode: "Vector Store",
  promptNode: "Prompt",
  reActNode: "ReAct",
  transcriptionNode: "Transcription",
  embeddingsNode: "Embeddings",
  webBrowserToolNode: "WebBrowser",
  promptTemplateNode: "Prompt Template",
  textInputNode: "Text Input",
  duckDuckGoSearchToolNode: "Tavily Search",
  reActConversationalNode: "ReAct Conversational",
  autoGPTNode: "AutoGPT",
  spinAnalysisNode: "SPIN Analysis",
};

const getId = () => uuid4();

function Flow() {
  const edgeReconnectSuccessful = useRef(true);
  const { updateNodeData, screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [type] = useDragAndDrop();

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge: any, newConnection: any) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  interface Edge {
    id: string;
  }

  const onReconnectEnd = useCallback((_: any, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);

  const { getNodes, getEdges } = useReactFlow();
  const [isEditedUnsaved, setIsEditedUnsaved] = useState(false);

  const reactFlow = useReactFlow();

  const deleteNodeById = (id: string) => {
    reactFlow.setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const deleteAllNodes = async () => {
    await reactFlow.setNodes([]);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: {
      preventDefault: () => void;
      returnValue: string;
    }) => {
      if (isEditedUnsaved) {
        event.preventDefault();
        event.returnValue = "Are you sure you want to leave?"; // Standard message (ignored in some browsers)
      }
    };

    if (isEditedUnsaved) {
      console.log("Added event listener");
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      console.log("Removed event listener");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    // Cleanup on component unmount or when `isEditedUnsaved` changes
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditedUnsaved]); // Only depend on `isEditedUnsaved`

  useEffect(() => {
    setIsEditedUnsaved(true);
  }, [edges, nodes]);

  const save = () => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
    localStorage.setItem("edges", JSON.stringify(edges));
    setIsEditedUnsaved(false);

    toast.success("Success", {
      description: "Your changes have been saved.",
    });
  };

  const load = () => {
    const savedNodes = localStorage.getItem("nodes");
    const savedEdges = localStorage.getItem("edges");

    if (savedNodes && savedEdges) {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
      setIsEditedUnsaved(false);
    }
  };

  const clear = async () => {
    await deleteAllNodes();
    localStorage.removeItem("nodes");
    localStorage.removeItem("edges");
    setIsEditedUnsaved(false);

    toast.info("Cleared", {
      description: "All nodes were deleted.",
    });
  };

  const preventCycles = useCallback(
    (connection: { target: any; source: any }) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const nodes = getNodes();
      const edges = getEdges();
      const target = nodes.find(
        (node: { id: any }) => node.id === connection.target
      );
      const hasCycle = (node: { id: string }, visited = new Set<string>()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (!target || target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [getNodes, getEdges]
  );

  const start = () => {
    updateNodeData("1", { start: true });
  };

  const onDragOver = useCallback(
    (event: {
      preventDefault: () => void;
      dataTransfer: { dropEffect: string };
    }) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    []
  );

  const onDrop = useCallback(
    (event: { preventDefault: () => void; clientX: any; clientY: any }) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        position: position,
        data: {},
        type: type.toString(),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type]
  );

  return (
    <div className="h-full flex flex-row">
      <CanvasSideBar sideBarNodeNames={sideBarNodeNames} />
      <div className="w-full h-full border border-slate-150 rounded-md">
        <div className="absolute z-10 flex flex-row gap-2 p-2 m-2">
          <Button
            className="rounded-full bg-green-500 hover:bg-green-300 w-20"
            size="icon"
            onClick={start}
          >
            <Play /> Run
          </Button>
          <Button
            className="rounded-full bg-yellow-500 hover:bg-yellow-300 w-20"
            size="icon"
            onClick={save}
          >
            <Save /> Save
          </Button>
          <Button
            className="rounded-full bg-red-500 hover:bg-red-300 w-20"
            size="icon"
            onClick={clear}
          >
            <Bomb /> Clear
          </Button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          isValidConnection={preventCycles}
          fitView
          minZoom={0.1}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
          defaultEdgeOptions={{
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
              color: "#000000",
            },
            animated: true,
            style: {
              strokeWidth: 1,
              stroke: "#000000",
            },
          }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <Flow />
    </DnDProvider>
  </ReactFlowProvider>
);
