import React, { memo, use, useEffect, useState } from "react";
import {
  Position,
  useNodeConnections,
  useNodes,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2Icon } from "lucide-react";
import { Node, NodeComponentProps } from "./components/Node";
import NodeHeader from "./components/NodeHeader";
import NodeBody from "./components/NodeBody";
import {
  NodeInputHandles,
  NodeOutputHandles,
  NodeOutputHandlesProps,
  NodeInputHandlesProps,
} from "./components/NodeHandles";
import NodeDataTypes from "./components/NodeDataTypes";

import { BabyAGI } from "langchain/experimental/babyagi";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { stringify } from "querystring";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MarkdownProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default memo(({ id, data }: NodeComponentProps) => {
  const [LLM, setLLM] = useState();
  const [vectorStore, setVectorStore] = useState();
  const [hasLLM, setHasLLM] = useState(false);

  const inputHandles = [
    {
      label: "LLM",
      acceptedType: NodeDataTypes.LLM,
    },
    {
      label: "Vector Store",
      acceptedType: NodeDataTypes.VectorStore,
    },
  ];

  const outputHandles = [
    {
      label: "Content",
      outputType: NodeDataTypes.LLMOutput,
    },
  ];

  useEffect(() => {
    console.log("Data", data);
  }, [data]);

  useEffect(() => {
    setLLM(data.LLM);
    if (data.LLM) {
      setHasLLM(true);
    } else {
      setHasLLM(false);
    }
  }, [data.LLM]);

  const vcConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.VectorStore,
  });

  const vcNodeData = useNodesData(vcConns?.[0]?.source);

  const nodes = useNodes();

  const reactFlow = useReactFlow();

  const deleteNodeById = (id: string) => {
    reactFlow.setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const deleteCurrentNode = () => {
    reactFlow.setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  useEffect(() => {
    console.log("bby", vcNodeData?.data?.[NodeDataTypes.VectorStore]);

    console.log("nodes", nodes);
  }, [vcNodeData]);

  useEffect(() => {
    setVectorStore(data.vectorStore);
  }, [data.vectorStore]);

  const { updateNodeData, getNode } = useReactFlow();
  const [prompt, setPrompt] = useState("");

  const LLMOutputConnections = useNodeConnections({
    id: id,
    handleType: "source",
    handleId: NodeDataTypes.LLMOutput,
  });

  const run = async () => {
    const babyAGI = BabyAGI.fromLLM({
      llm: LLM!,
      vectorstore: vectorStore!,
      maxIterations: 1,
    });

    let payload = {
      content: "",
      thinking: true,
    };
    propagateLLMModel(LLMOutputConnections, payload);

    const out = await babyAGI.invoke(
      {
        objective: prompt,
      },
      {}
    );

    console.log(out);

    payload = {
      content: stringify(out),
      thinking: false,
    };
    propagateLLMModel(LLMOutputConnections, payload);
  };

  const propagateLLMModel = (connections: any, payload: any) => {
    connections?.forEach((connection: any) => {
      updateNodeData(connection.target, payload);
    });
  };

  return (
    <Node>
      <NodeHeader
        title="Baby AGI"
        imgSrc="https://sprout24.com/hub/wp-content/uploads/sites/2/2024/08/babyagi-600x600.png"
      />

      <NodeInputHandles handles={inputHandles} />

      <NodeBody>
        <div className="space-y-2">
          <Label htmlFor="prompt">Objective</Label>
          <Textarea
            id="prompt"
            placeholder="Your prompt goes here"
            className="min-h-[100px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="w-full">
          <Button onClick={deleteCurrentNode} variant="outline" className="w-full">
            Run
          </Button>
        </div>
      </NodeBody>

      <NodeOutputHandles handles={outputHandles} />
    </Node>
  );
});
