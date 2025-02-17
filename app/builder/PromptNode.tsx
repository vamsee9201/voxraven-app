import React, { memo, use, useEffect, useState } from "react";
import { Position, useNodeConnections, useReactFlow } from "@xyflow/react";

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
import { OpenAIEmbeddings, OpenAI, ChatOpenAI } from "@langchain/openai";
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
  const [LLM, setLLM] = useState<ChatOpenAI>();
  const [prompt, setPrompt] = useState("");

  const inputHandles = [
    {
      label: "LLM",
      acceptedType: NodeDataTypes.LLM,
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
    setLLM(data.LLM as ChatOpenAI);
  }, [data.LLM]);

  const { updateNodeData, getNode } = useReactFlow();

  const LLMOutputConnections = useNodeConnections({
    id: id,
    handleType: "source",
    handleId: NodeDataTypes.LLMOutput,
  });

  const run = async () => {
    let payload = {
      content: "",
      thinking: true,
    };
    propagateLLMModel(LLMOutputConnections, payload);

    const out = await LLM?.invoke(prompt);

    payload = {
      content: out?.content.toString() || "",
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
        nodeId={id}
        title="Prompt Node"
        imgSrc="https://static.thenounproject.com/png/5249626-200.png"
      />

      <NodeInputHandles handles={inputHandles} />

      <NodeBody>
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Your prompt goes here"
            className="min-h-[100px] resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="w-full">
          <Button onClick={run} variant="outline" className="w-full">
            Run
          </Button>
        </div>
      </NodeBody>

      <NodeOutputHandles handles={outputHandles} />
    </Node>
  );
});
