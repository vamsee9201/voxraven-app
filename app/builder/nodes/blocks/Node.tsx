import { Card } from "@/components/ui/card";
import React from "react";

interface NodeProps {
  children: React.ReactNode;
}

// Parent component that accepts children
export const Node: React.FC<NodeProps> = ({ children }) => {
  return (
    <Card className="w-full max-w-md">
      {children}
    </Card>
  );
};

export interface NodeComponentProps {
  id: string;
  data: any;
}
