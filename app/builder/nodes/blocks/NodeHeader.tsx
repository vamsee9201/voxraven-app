import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader } from "@/components/ui/card";
import { CircleIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";

interface NodeHeaderProps {
  nodeId: string;
  title: string;
  imgSrc?: string;
}

const NodeHeader = ({ nodeId, title, imgSrc }: NodeHeaderProps) => {
  const reactFlow = useReactFlow();

  const deleteCurrentNode = () => {
    console.log("Deleting node", nodeId);
    reactFlow.setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  };

  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center gap-2 justify-between">
        <div className="rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={imgSrc} />
          </Avatar>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <Button className="w-2" variant="destructive" onClick={deleteCurrentNode}>
          <Trash2 />
        </Button>
      </div>
    </CardHeader>
  );
};

export default NodeHeader;
