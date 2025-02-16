import React, { memo, useEffect, useState } from "react";
import {
  getOutgoers,
  Position,
  useNodeConnections,
  useReactFlow,
} from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import NodeHeader from "./components/NodeHeader";

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import NodeBody from "./components/NodeBody";
import { Node, NodeComponentProps } from "./components/Node";
import { NodeOutputHandles } from "./components/NodeHandles";
import NodeDataTypes from "./components/NodeDataTypes";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData, getNode } = useReactFlow();
  const [urlEndpoint, setUrlEndpoint] = useState("http://localhost:1234/v1");
  const [vectorStore, setVectorStore] = useState();

  const outputHandles = [
    {
      label: "Vector Store",
      outputType: NodeDataTypes.VectorStore,
    },
  ];

  const LLMOutputConnections = useNodeConnections({
    id: id,
    handleType: "source",
    handleId: NodeDataTypes.VectorStore,
  });

  const createVectorStore = (): MemoryVectorStore => {
    const vectorStore = new MemoryVectorStore(
      new OpenAIEmbeddings({
        configuration: {
          baseURL: "http://localhost:1234/v1",
          apiKey: "sk_test_123",
        },
      })
    );

    return vectorStore;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlEndpoint(event.target.value);
    const vectorStore = createVectorStore();
    updateNodeData(id, { ...data, [NodeDataTypes.VectorStore]: vectorStore });
  };

  const checkEndpoint = () => {
    fetch(urlEndpoint + "/models")
      .then((response) => {
        if (response.status === 200) {
          toast.success("Success", {
            description: "Endpoint is reachable",
          });
        } else {
          toast.error("Failed", {
            description: "Endpoint is not reachable",
          });
        }
      })
      .catch((error) => {
        toast.error("Failed", {
          description: error,
        });
      });
  };

  return (
    <Node>
      <NodeHeader
        title="Vetor Store"
        imgSrc="https://ignos.blog/wp-content/uploads/2024/01/lm-studio-logo.png"
      />

      <NodeBody>
        <div className="space-y-2">
          <Label htmlFor="endpoint">Endpoint</Label>
          <div className="flex gap-2">
            <Input
              id="endpoint"
              value={urlEndpoint}
              onChange={handleInputChange}
              placeholder="Endpoint /v1/models"
            />
            <Button variant="outline" size="icon" onClick={checkEndpoint}>
              <ServerIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </NodeBody>

      <NodeOutputHandles handles={outputHandles} />
    </Node>
  );
});
