import React, { memo, useEffect, useState } from "react";
import {
  useNodeConnections,
  useNodes,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";

import { Node, NodeComponentProps } from "./blocks/Node";
import NodeHeader from "./blocks/NodeHeader";
import NodeBody from "./blocks/NodeBody";
import { NodeInputHandles, NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";

import { BabyAGI } from "langchain/experimental/babyagi";
import { stringify } from "querystring";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatOpenAI } from "@langchain/openai";
import { VectorStoreInterface } from "@langchain/core/vectorstores";
import { Input } from "@/components/ui/input";

const inputHandles = [
  {
    label: "LLM",
    acceptedType: NodeDataTypes.LLM,
  },
  {
    label: "Vector Store",
    acceptedType: NodeDataTypes.VectorStore,
  },
];

const outputHandles = [
  {
    label: "Content",
    outputType: NodeDataTypes.LLMOutput,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData } = useReactFlow();
  const [prompt, setPrompt] = useState("");
  const [numIters, setNumIters] = useState("1");

  const incommingVectorStoreConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.VectorStore,
  });

  const incomingLLMConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.LLM,
  });

  const vectorStoreNodesData = useNodesData(
    incommingVectorStoreConns[0]?.source
  );
  const llmNodeData = useNodesData(incomingLLMConns[0]?.source);

  const run = async () => {
    const LLM = llmNodeData?.data?.[NodeDataTypes.LLM] as ChatOpenAI;
    const vectorStore = vectorStoreNodesData?.data?.[
      NodeDataTypes.VectorStore
    ] as VectorStoreInterface;

    const babyAGI = BabyAGI.fromLLM({
      llm: LLM,
      vectorstore: vectorStore!,
      maxIterations: parseInt(numIters),
    });

    // const out = await babyAGI.invoke({
    //   objective: prompt,
    // });

    babyAGI
      .invoke({
        objective: prompt,
      })
      .then((out) => {
        console.log(out);
      });
  };

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="Baby AGI"
        imgSrc="https://sprout24.com/hub/wp-content/uploads/sites/2/2024/08/babyagi-600x600.png"
      />

      <NodeInputHandles handles={inputHandles} />

      <NodeBody>
        <div className="space-y-2">
          <div>
            {" "}
            <Label htmlFor="prompt">Objective</Label>
            <Textarea
              id="prompt"
              placeholder="Your prompt goes here"
              className="min-h-[100px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="numIters">Number of Iterations</Label>
            <Input
              id="numIters"
              placeholder="Number of iterations"
              value={numIters}
              onChange={(e) => setNumIters(e.target.value)}
            />
          </div>
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
