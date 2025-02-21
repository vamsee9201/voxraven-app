import React, { memo, useEffect, useState } from "react";
import { useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";

import { Node, NodeComponentProps } from "./blocks/Node";
import NodeHeader from "./blocks/NodeHeader";
import NodeBody from "./blocks/NodeBody";
import { NodeInputHandles, NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";

import { ChatOpenAI } from "@langchain/openai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

const startInputHandles = [
  {
    label: "LLM",
    acceptedType: NodeDataTypes.LLM,
  },
  {
    label: "Context",
    acceptedType: NodeDataTypes.LLMOutput,
  },
];

const outputHandles = [
  {
    label: "Content",
    outputType: NodeDataTypes.LLMOutput,
  },
];

function format(template: string, context: string): string {
  return template.replace("{context}", context);
}

export default memo(({ id, data }: NodeComponentProps) => {
  const [promptTemplate, setPromptTemplate] = useState("");
  const [inputHandles, setInputHandles] = useState(startInputHandles);
  const { updateNodeData } = useReactFlow();
  const [isThinking, setIsThinking] = useState(false);

  const incomingLLMConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.LLM,
  });

  const incomingContexConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.LLMOutput,
  });

  const llmNodeData = useNodesData(incomingLLMConns[0]?.source);
  const contextNodeData = useNodesData(incomingContexConns[0]?.source);

  const run = async () => {
    setIsThinking(true);
    const context = contextNodeData?.data?.[NodeDataTypes.LLMOutput] as string;
    const prompt = getSPINPrompt(context);
    const LLM = llmNodeData?.data?.[NodeDataTypes.LLM] as ChatOpenAI;
    const out = await LLM?.invoke(prompt);
    updateNodeData(id, { [NodeDataTypes.LLMOutput]: out.content.toString() });
    setIsThinking(false);
  };

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="SPIN Analysis"
        imgSrc="https://static.thenounproject.com/png/5249626-200.png"
      />

      <NodeInputHandles handles={inputHandles} />

      <NodeBody>
        <div className="space-y-2">
          {isThinking ? (
            <Loader className="animate-spin" />
          ) : (
            "Performs SPIN Analysis on the input."
          )}
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

const getSPINPrompt = (context: string) => {
  const prompt = `Prompt:
You are a seasoned sales coach with deep expertise in SPIN Selling (Situation, Problem, Implication, Need-Payoff). Below is a transcript of a sales conversation between a sales representative and a potential customer. Your task is to analyze this conversation using the SPIN Selling framework. Please follow these steps:

Generate a SPIN Scorer by adding the following sections. 

    - Situation - contains context of the prospect's current situation. Facts, circumstances, and background details about the prospect [Bullet points] 
    - Problem - contains prospect's pain points or issues [Bullet points]
    - Implication - contains prospect's pain points or issues [Bullet points]
    - Need-Payoff - contains benefits and value of solving the prospect's problems [Bullet points]

Transcript:
${context}

Your response should be structured clearly under each section (Situation, Problem, Implication, Need-Payoff, and Overall Evaluation) and provide specific examples. Use markdown to format your response and put each section name in bold.
`;

  return prompt;
};
