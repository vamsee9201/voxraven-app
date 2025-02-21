import React, { memo, use, useEffect, useState } from "react";
import {
  getOutgoers,
  Position,
  useNodeConnections,
  useReactFlow,
} from "@xyflow/react";
import { Input } from "@/components/ui/input";

import NodeHeader from "./blocks/NodeHeader";

import { ChatOpenAI } from "@langchain/openai";

import NodeBody from "./blocks/NodeBody";
import { Node, NodeComponentProps } from "./blocks/Node";
import { NodeOutputHandles } from "./blocks/NodeHandles";
import NodeDataTypes from "./blocks/NodeDataTypes";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const outputHandles = [
  {
    label: "LLM",
    outputType: NodeDataTypes.LLM,
  },
];

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData } = useReactFlow();
  const [urlEndpoint, setUrlEndpoint] = useState("http://localhost:3000/v1");

  const outgoingLLMConns = useNodeConnections({
    id: id,
    handleType: "source",
  });

  const createLLM = () => {
    const llm = new ChatOpenAI({
      temperature: 0,
      model: "gpt-4o-mini",
      configuration: {
        baseURL: urlEndpoint,
        apiKey: process.env.OPENAI_API_KEY,
      },
      stop: ["\nFinal Answer"],
    });
    updateNodeData(id, { [NodeDataTypes.LLM]: llm });
  };

  useEffect(() => {
    createLLM();
  }, [outgoingLLMConns]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlEndpoint(event.target.value);
    createLLM();
  };

  const checkEndpoint = () => {
    fetch(urlEndpoint + "/models")
      .then(async (response) => {
        if (response.status === 200) {
          toast.success("Success", {
            description: "Endpoint is reachable",
          });
        } else {
          toast.error("Failed", {
            description: "Endpoint is not reachable",
          });
        }
        console.log(await response.json());
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
        title="LM Studio Model"
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
