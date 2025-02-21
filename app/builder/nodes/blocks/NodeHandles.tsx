import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Handle,
  HandleType,
  Position,
  useNodeConnections,
} from "@xyflow/react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChevronsRight, CircleChevronRight } from "lucide-react";

export interface NodeHandlesProps {
  handles: Array<CustomHandleProps>;
}

export interface NodeInputHandlesProps {
  handles: Array<InputHandleProps>;
}

export interface NodeOutputHandlesProps {
  handles: Array<OutputHandleProps>;
}

interface CustomHandleProps {
  label: string;
  id: string;
  position: Position;
  type: string;
  maxConnections: number;
  onConnect?: any;
}

interface InputHandleProps {
  label: string;
  acceptedType: any;
  maxConnections?: number;
}

interface OutputHandleProps {
  label: string;
  outputType: any;
  onConnect?: any;
}

const CustomHandle = ({
  label,
  type,
  id,
  position,
  maxConnections,
  onConnect = () => {},
}: CustomHandleProps) => {
  const connections = useNodeConnections({
    handleType: type as HandleType,
    handleId: id,
  });

  const checkConnectionValidity = (connection: any) => {
    return connection.sourceHandle === connection.targetHandle;
  };

  return (
    <div
      className={`relative my-1 ${
        position === Position.Right ? "text-end" : ""
      }`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="outline"
              className="mx-2 font-light flex flex-row gap-1 px-1"
            >
              {position === Position.Left && <ChevronsRight size={12} />}
              <span>{label}</span>
              {position === Position.Right && <ChevronsRight size={12} />}
            </Badge>

            <Handle
              type={type as HandleType}
              position={position}
              style={{
                borderWidth: "1px",
                borderColor: "#888888",
                padding: "3px",
                background: "#FFF",
                top: 13,
              }}
              id={id}
              isConnectable={connections.length < maxConnections}
              isValidConnection={checkConnectionValidity}
              onConnect={onConnect}
            />
          </TooltipTrigger>
          <TooltipContent>Here goes handle data type</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const InputHandle = ({
  label,
  acceptedType,
  maxConnections = 1,
}: InputHandleProps) => {
  return (
    <CustomHandle
      label={label}
      type="target"
      position={Position.Left}
      id={acceptedType}
      maxConnections={maxConnections}
    />
  );
};

const OutputHandle = ({ label, outputType, onConnect }: OutputHandleProps) => {
  return (
    <CustomHandle
      label={label}
      type="source"
      position={Position.Right}
      id={outputType}
      maxConnections={Infinity}
      onConnect={onConnect}
    />
  );
};

export const NodeHandles = ({ handles }: NodeHandlesProps) => {
  return (
    <div className="flex flex-col">
      {handles.map((item, index) => (
        <CustomHandle
          type={item.type}
          position={item.position}
          id={item.id}
          label={item.label}
          key={index}
          maxConnections={item.maxConnections}
        />
      ))}
    </div>
  );
};

export const NodeInputHandles = ({ handles }: NodeInputHandlesProps) => {
  return (
    <div className="flex flex-col mb-2">
      {handles.map((item, index) => (
        <InputHandle
          label={item.label}
          acceptedType={item.acceptedType}
          maxConnections={item?.maxConnections}
          key={index}
        />
      ))}
    </div>
  );
};

export const NodeOutputHandles = ({ handles }: NodeOutputHandlesProps) => {
  return (
    <div className="flex flex-col mb-2">
      {handles.map((item, index) => (
        <OutputHandle
          label={item.label}
          outputType={item.outputType}
          key={index}
          onConnect={item.onConnect}
        />
      ))}
    </div>
  );
};
