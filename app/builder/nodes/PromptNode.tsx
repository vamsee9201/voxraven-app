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

export default memo(({ id, data }: NodeComponentProps) => {
  const [prompt, setPrompt] = useState("");
  const { updateNodeData } = useReactFlow();
  const [isThinking, setIsThinking] = useState(false);

  const incomingLLMConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.LLM,
  });

  const llmNodeData = useNodesData(incomingLLMConns[0]?.source);

  const run = async () => {
    setIsThinking(true);
    const LLM = llmNodeData?.data?.[NodeDataTypes.LLM] as ChatOpenAI;
    const out = await LLM?.invoke(prompt);
    updateNodeData(id, { [NodeDataTypes.LLMOutput]: out.content.toString() });
    setIsThinking(false);
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
