import React, { memo, use, useEffect, useState } from "react";
import {
  getOutgoers,
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import { Input } from "@/components/ui/input";

import NodeHeader from "./blocks/NodeHeader";

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import NodeBody from "./blocks/NodeBody";
import { Node, NodeComponentProps } from "./blocks/Node";
import { NodeInputHandles, NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { WebBrowser } from "langchain/tools/webbrowser";

const inputHandles = [
  {
    label: "LLM",
    acceptedType: NodeDataTypes.LLM,
  },
  {
    label: "Embeddings",
    acceptedType: NodeDataTypes.Embeddings,
  },
];

const outputHandles = [
  {
    label: "Web Browser",
    outputType: NodeDataTypes.Tools,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData } = useReactFlow();
  const [urlEndpoint, setUrlEndpoint] = useState("http://localhost:1234/v1");

  const outgoingLLMConns = useNodeConnections({
    id: id,
    handleType: "source",
  });

  const incomingLLMConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.LLM,
  });

  const incomingEmbeddingsConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.Embeddings,
  });

  const embeddingsNodeData = useNodesData(incomingEmbeddingsConns[0]?.source);
  const llmNodeData = useNodesData(incomingLLMConns[0]?.source);

  const LLM = llmNodeData?.data?.[NodeDataTypes.LLM] as ChatOpenAI;
  const embeddings = embeddingsNodeData?.data?.[
    NodeDataTypes.Embeddings
  ] as OpenAIEmbeddings;

  const createWebBrowser = () => {
    const browser = new WebBrowser({ model: LLM, embeddings: embeddings });
    updateNodeData(id, { [NodeDataTypes.Tools]: browser });
  };

  useEffect(() => {
    createWebBrowser();
  }, [outgoingLLMConns]);

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="Web Browser Tool"
        imgSrc="https://www.transparentpng.com/thumb/browsers/uEski3-browsers-transparent.png"
      />
      <NodeInputHandles handles={inputHandles} />
      <NodeBody>
        <div className="text-center font-bold">Web Browser</div>
      </NodeBody>
      <NodeOutputHandles handles={outputHandles} />
    </Node>
  );
});
