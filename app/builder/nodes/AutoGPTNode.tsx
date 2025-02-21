import React, { memo, useState } from "react";
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

import { pull } from "langchain/hub";
import type { PromptTemplate } from "@langchain/core/prompts";
import { Loader } from "lucide-react";
import { AutoGPT } from "langchain/experimental/autogpt";
import { ReadFileTool, WriteFileTool } from "langchain/tools";
import { InMemoryFileStore } from "langchain/stores/file/in_memory";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

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
  {
    label: "Embeddings",
    acceptedType: NodeDataTypes.Embeddings,
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

  const incomingMEmbeddingsConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.Embeddings,
  });

  const llmNodeData = useNodesData(incomingLLMConns[0]?.source);
  const embeddingsNodeData = useNodesData(incomingMEmbeddingsConns[0]?.source);
  const toolsNodesData = useNodesData(
    incomingToolsConns.map((conn) => conn.source)
  );

  const run = async () => {
    setIsThinking(true);

    const LLM = llmNodeData?.data?.[NodeDataTypes.LLM] as ChatOpenAI;

    const embeddings = embeddingsNodeData?.data?.[
      NodeDataTypes.Embeddings
    ] as OpenAIEmbeddings;

    const vectorStore = new MemoryVectorStore(embeddings);

    let tools: any = [];
    toolsNodesData.forEach((toolData) => {
      const currentTool = toolData.data[NodeDataTypes.Tools];
      tools.push(currentTool);
    });

    const store = new InMemoryFileStore();
    tools.push(new ReadFileTool({ store }));
    tools.push(new WriteFileTool({ store }));

    console.log("Available tools", tools);
    console.log("Creating agent");

    const autogpt = AutoGPT.fromLLMAndTools(LLM, tools, {
      memory: vectorStore.asRetriever(),
      aiName: "Tom",
      aiRole: "Cloud Bussimes Consultant",
    },);

    const out = await autogpt.run([prompt]);

    console.log("FINISHED", out);

    updateNodeData(id, { [NodeDataTypes.LLMOutput]: out?.toString() });

    // updateNodeData(id, { [NodeDataTypes.LLMOutput]: out?.content?.toString() });
    setIsThinking(false);
  };

  return (
    <Node>
      <NodeHeader
        nodeId={id}
        title="AutoGPT Node"
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
