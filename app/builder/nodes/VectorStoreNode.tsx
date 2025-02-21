import React, { memo, useEffect, useState } from "react";
import { useNodeConnections, useNodesData, useReactFlow } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import NodeHeader from "./blocks/NodeHeader";

import { OpenAIEmbeddings } from "@langchain/openai";

import NodeBody from "./blocks/NodeBody";
import { Node, NodeComponentProps } from "./blocks/Node";
import { NodeInputHandles, NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";

const inputHandles = [
  {
    label: "Embeddings",
    acceptedType: NodeDataTypes.Embeddings,
  },
];

const outputHandles = [
  {
    label: "Vector Store",
    outputType: NodeDataTypes.VectorStore,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData, getNode } = useReactFlow();
  const [urlEndpoint, setUrlEndpoint] = useState("http://localhost:1234/v1");

  const incomingEmbeddingsConns = useNodeConnections({
    id: id,
    handleType: "target",
    handleId: NodeDataTypes.Embeddings,
  });

  const embeddingsNodeData = useNodesData(incomingEmbeddingsConns[0]?.source);

  const outgoingVectorStoreConns = useNodeConnections({
    id: id,
    handleType: "source",
  });

  useEffect(() => {
    createVectorStore();
  }, [outgoingVectorStoreConns]);

  const createVectorStore = () => {
    const embeddings = embeddingsNodeData?.data?.[
      NodeDataTypes.Embeddings
    ] as OpenAIEmbeddings;

    const vectorStore = new MemoryVectorStore(embeddings);
    updateNodeData(id, { [NodeDataTypes.VectorStore]: vectorStore });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlEndpoint(event.target.value);
    createVectorStore();
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
        nodeId={id}
        title="Vetor Store"
        imgSrc="https://ignos.blog/wp-content/uploads/2024/01/lm-studio-logo.png"
      />

      <NodeInputHandles handles={inputHandles} />

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
