import React, { memo, useEffect, useState } from "react";
import {
  Position,
  useNodeConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2Icon } from "lucide-react";
import { Node, NodeComponentProps } from "./blocks/Node";
import NodeHeader from "./blocks/NodeHeader";
import NodeBody from "./blocks/NodeBody";
import {
  NodeInputHandles,
  NodeOutputHandles,
  NodeOutputHandlesProps,
  NodeInputHandlesProps,
} from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";

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

const inputHandles = [
  {
    label: "LLM Output",
    acceptedType: NodeDataTypes.LLMOutput,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const [modelOutput, setModelOutput] = useState("");

  const incomingLLMOutputConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.LLMOutput,
  });

  const llmOutputNodeData = useNodesData(incomingLLMOutputConns[0]?.source);

  useEffect(() => {
    const llmOutput = llmOutputNodeData?.data?.[NodeDataTypes.LLMOutput] as string;
    if (llmOutput) {
      setModelOutput(llmOutput);
    }
  }, [llmOutputNodeData]);

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="Prompt output"
        imgSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4N_soUiGggkq4TxayU7O_echs7FO8ISMD5w&s"
      />

      <NodeInputHandles handles={inputHandles} />

      <NodeBody>
        <div className="mt-2">
          <div className="text-sm max-w-64">
            <MarkdownRenderer content={modelOutput} />
          </div>
        </div>
      </NodeBody>
    </Node>
  );
});
