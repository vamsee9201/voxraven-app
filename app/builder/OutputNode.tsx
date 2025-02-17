import React, { memo, useEffect, useState } from "react";
import { Position } from "@xyflow/react";

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
  const [modelOutput, setModelOutput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const inputHandles = [
    {
      label: "LLM Output",
      acceptedType: NodeDataTypes.LLMOutput,
    },
  ];

  useEffect(() => {
    setModelOutput(data.content);
  }, [data?.content]);

  useEffect(() => {
    setIsThinking(data.thinking);
  }, [data?.thinking]);

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
          {!isThinking ? (
            <div className="text-sm max-w-64">
              <MarkdownRenderer content={modelOutput} />
            </div>
          ) : (
            <div className="flex justify-center">
              <Loader2Icon className="animate-spin h-8 w-8" />
            </div>
          )}
        </div>
      </NodeBody>
    </Node>
  );
});
