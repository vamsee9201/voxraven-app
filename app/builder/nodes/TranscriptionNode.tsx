import React, { memo, useEffect, useState } from "react";

import { Node, NodeComponentProps } from "./blocks/Node";
import NodeHeader from "./blocks/NodeHeader";
import NodeBody from "./blocks/NodeBody";
import {
  NodeInputHandles,
} from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";
import FileUpload from "./blocks/FileUpload";

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
        title="Transcription Node"
        imgSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4N_soUiGggkq4TxayU7O_echs7FO8ISMD5w&s"
      />

      <NodeInputHandles handles={inputHandles} />

      <NodeBody>
        <div className="max-w-64">
          <FileUpload maxFiles={1} />
        </div>
      </NodeBody>
    </Node>
  );
});
