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
    const prompt = format(promptTemplate, context);
    const LLM = llmNodeData?.data?.[NodeDataTypes.LLM] as ChatOpenAI;
    const out = await LLM?.invoke(prompt);
    updateNodeData(id, { [NodeDataTypes.LLMOutput]: out.content.toString() });
    setIsThinking(false);
  };

  const addInputHandle = () => {
    setInputHandles([
      ...inputHandles,
      {
        label: "Context",
        acceptedType: NodeDataTypes.LLMOutput,
      },
    ]);
  };

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="Prompt Template Node"
        imgSrc="https://static.thenounproject.com/png/5249626-200.png"
      />

      <NodeInputHandles handles={inputHandles} />
      <div className="mx-2 ">
        <Button className="text-xs w-20 h-6" onClick={addInputHandle}>
          Add context
        </Button>
      </div>

      <NodeBody>
        <div className="space-y-2">
          <div>
            Use <span className="italic">{"{context}"}</span> in your prompt
            template to position your input context.
          </div>
          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Your prompt goes here"
              className="min-h-[100px] resize-none"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              disabled={isThinking}
            />
          </div>
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
