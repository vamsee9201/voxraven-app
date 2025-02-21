import React, { memo, use, useEffect, useState } from "react";
import { useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";

import { Node, NodeComponentProps } from "./blocks/Node";
import NodeHeader from "./blocks/NodeHeader";
import NodeBody from "./blocks/NodeBody";
import { NodeInputHandles, NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { OpenAI } from "@langchain/openai";
import type { PromptTemplate } from "@langchain/core/prompts";
import { Loader } from "lucide-react";
import { WebBrowser } from "langchain/tools/webbrowser";

const inputHandles = [
  {
    label: "LLM",
    acceptedType: NodeDataTypes.LLM,
  },
  {
    label: "Tools",
    acceptedType: NodeDataTypes.Tools,
    maxConnections: 10,
  },
];

const outputHandles = [
  {
    label: "Content",
    outputType: NodeDataTypes.LLMOutput,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const [isThinking, setIsThinking] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { updateNodeData } = useReactFlow();

  const incomingLLMConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.LLM,
  });

  const incomingToolsConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.Tools,
  });

  const llmNodeData = useNodesData(incomingLLMConns[0]?.source);
  const toolsNodesData = useNodesData(
    incomingToolsConns.map((conn) => conn.source)
  );

  const run = async () => {
    setIsThinking(true);

    const LLM = llmNodeData?.data?.[NodeDataTypes.LLM] as ChatOpenAI;
    const promptTemplate = await pull<PromptTemplate>("hwchase17/react");

    let tools: any = [];
    toolsNodesData.forEach((toolData) => {
      const currentTool = toolData.data[NodeDataTypes.Tools];
      tools.push(currentTool);
    });

    console.log("Available tools", tools);
    console.log("Creating agent");

    const agent = await createReactAgent({
      llm: LLM,
      tools: tools,
      prompt: promptTemplate,
    });

    const agentExecutor = new AgentExecutor({
      agent: agent,
      tools: tools,
      returnIntermediateSteps: true,
      verbose: true,
    });

    console.log("Executing agent");
    let out: { content?: string } = {};
    try {
      const agentOut = await agentExecutor.invoke({
        input: prompt,
        verbose: true,
      });
      console.log(agentOut);
      out["content"] = agentOut.output;
    } catch (e: any) {
      out["content"] = e.message;
    }
    console.log(out);
    updateNodeData(id, { [NodeDataTypes.LLMOutput]: out.content?.toString() });
    setIsThinking(false);
  };

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="ReAct Node"
        imgSrc="https://cdn-icons-png.flaticon.com/512/13298/13298257.png"
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
            disabled={isThinking}
          />
        </div>
        <div className="w-full">
          <Button
            onClick={run}
            variant="outline"
            className="w-full"
            disabled={isThinking}
          >
            {isThinking ? <Loader className="animate-spin" /> : "Run"}
          </Button>
        </div>
      </NodeBody>

      <NodeOutputHandles handles={outputHandles} />
    </Node>
  );
});
