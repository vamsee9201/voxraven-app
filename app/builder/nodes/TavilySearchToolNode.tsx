import React, { memo, useEffect } from "react";
import { useNodeConnections, useReactFlow } from "@xyflow/react";

import NodeHeader from "./blocks/NodeHeader";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import NodeBody from "./blocks/NodeBody";
import { Node, NodeComponentProps } from "./blocks/Node";
import { NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";

const outputHandles = [
  {
    label: "DuckDuckGo Search",
    outputType: NodeDataTypes.Tools,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData } = useReactFlow();

  const outgoingLLMConns = useNodeConnections({
    id: id,
    handleType: "source",
  });

  const create = () => {
    const search = new TavilySearchResults({
      maxResults: 1,
      apiKey: "**your-api-key**",
    });
    updateNodeData(id, { [NodeDataTypes.Tools]: search });
  };

  useEffect(() => {
    create();
  }, [outgoingLLMConns]);

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="Tavily Search Tool"
        imgSrc="https://www.transparentpng.com/thumb/browsers/uEski3-browsers-transparent.png"
      />
      <NodeBody>
        <div className="text-center font-bold">DuckDuckGo Search</div>
      </NodeBody>
      <NodeOutputHandles handles={outputHandles} />
    </Node>
  );
});
