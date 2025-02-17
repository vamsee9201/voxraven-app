import React, { memo, useEffect, useState } from "react";
import { useNodeConnections, useReactFlow } from "@xyflow/react";

import { Node, NodeComponentProps } from "./components/Node";
import NodeHeader from "./components/NodeHeader";
import NodeBody from "./components/NodeBody";
import { NodeInputHandles, NodeOutputHandles } from "./components/NodeHandles";
import NodeDataTypes from "./components/NodeDataTypes";

import { ChatOpenAI } from "@langchain/openai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { OpenAI } from "@langchain/openai";
import type { PromptTemplate } from "@langchain/core/prompts";

export default memo(({ id, data }: NodeComponentProps) => {
  const [LLM, setLLM] = useState<ChatOpenAI>();
  const [prompt, setPrompt] = useState("");
  const [tools, setTools] = useState<[]>([]);

  const inputHandles = [
    {
      label: "LLM",
      acceptedType: NodeDataTypes.LLM,
    },
    {
      label: "Tools",
      acceptedType: NodeDataTypes.Tools,
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

    ////
    const promptTemplate = await pull<PromptTemplate>("hwchase17/react");

    const llm = new OpenAI({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0,
    });

    const agent = await createReactAgent({
      llm: LLM,
      tools: tools,
      prompt: promptTemplate,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    console.log("Executing agent");
    const out = await agentExecutor.invoke({
      input: prompt,
    });

    console.log("Output", out);
    ////

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
        title="ReAct Node"
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
