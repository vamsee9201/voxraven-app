import React, { memo, useEffect, useState } from "react";
import { useNodeConnections, useReactFlow } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import NodeHeader from "./blocks/NodeHeader";

import { OpenAIEmbeddings } from "@langchain/openai";

import NodeBody from "./blocks/NodeBody";
import { Node, NodeComponentProps } from "./blocks/Node";
import { NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";

const outputHandles = [
  {
    label: "Embeddings",
    outputType: NodeDataTypes.Embeddings,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData } = useReactFlow();
  const [urlEndpoint, setUrlEndpoint] = useState("http://localhost:1234/v1");

  const outgoingEmbsConns = useNodeConnections({
    id: id,
    handleType: "source",
  });

  useEffect(() => {
    const embs = new OpenAIEmbeddings({
      configuration: {
        baseURL: urlEndpoint,
        apiKey: "sk_test_123",
      },
    });

    updateNodeData(id, { [NodeDataTypes.Embeddings]: embs });
  }, [outgoingEmbsConns]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlEndpoint(event.target.value);
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
        title="Embeddings"
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
