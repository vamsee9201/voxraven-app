import { Badge } from "@/components/ui/badge";
import React from "react";
import { CircleIcon, ServerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NodeBodyProps {
  children: React.ReactNode;
}

// Parent component that accepts children
const NodeBody: React.FC<NodeBodyProps> = ({ children }) => {
  return <CardContent className="space-y-4 min-w-72">{children}</CardContent>;
};

export default NodeBody;
