import React, { memo, useEffect, useState } from "react";
import {
  getOutgoers,
  Position,
  useNodeConnections,
  useReactFlow,
} from "@xyflow/react";
import { Input } from "@/components/ui/input";

import NodeHeader from "./components/NodeHeader";

import { ChatOpenAI } from "@langchain/openai";

import NodeBody from "./components/NodeBody";
import { Node, NodeComponentProps } from "./components/Node";
import { NodeOutputHandles } from "./components/NodeHandles";
import NodeDataTypes from "./components/NodeDataTypes";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type LLMOutput = {
  content?: string;
  thinking: boolean;
};

export default memo(({ id, data }: NodeComponentProps) => {
  const { updateNodeData, getNode } = useReactFlow();
  const [urlEndpoint, setUrlEndpoint] = useState("http://localhost:1234/v1");
  const [model, setModel] = useState<any>();
  const [prompt, setPrompt] = useState("");

  const outputHandles = [
    {
      label: "LLM",
      outputType: NodeDataTypes.LLM,
    },
  ];

  const LLMOutputConnections = useNodeConnections({
    id: id,
    handleType: "source",
    handleId: NodeDataTypes.LLM,
  });

  useEffect(() => {
    propagateLLMModel(LLMOutputConnections);
  }, [LLMOutputConnections]);

  useEffect(() => {
    console.log("Model Created");
  }, [urlEndpoint]);

  const propagateLLMModel = (connections: any) => {
    const model = new ChatOpenAI({
      temperature: 0,
      configuration: {
        baseURL: urlEndpoint,
        apiKey: "sk_test_123",
      },
    });

    const payload = {
      LLM: model,
    };

    connections?.forEach((connection: any) => {
      updateNodeData(connection.target, payload);
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlEndpoint(event.target.value);
    propagateLLMModel(LLMOutputConnections);
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
