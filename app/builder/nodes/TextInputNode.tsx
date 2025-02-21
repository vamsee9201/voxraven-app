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

const outputHandles = [
  {
    label: "Content",
    outputType: NodeDataTypes.LLMOutput,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData } = useReactFlow();
  const [text, setText] = useState("");

  useEffect(() => {
    updateNodeData(id, { [NodeDataTypes.LLMOutput]: text });
  }, [text]);

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="Text Input"
        imgSrc="https://static.thenounproject.com/png/5249626-200.png"
      />

      <NodeBody>
        <div className="space-y-2">
          <Label htmlFor="prompt">Text Input</Label>
          <Textarea
            id="prompt"
            placeholder="Your prompt goes here"
            className="min-h-[100px] resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </NodeBody>

      <NodeOutputHandles handles={outputHandles} />
    </Node>
  );
});
