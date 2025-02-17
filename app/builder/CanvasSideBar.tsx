import React from "react";
import { useDragAndDrop } from "./DragAndDropContext";
import { GripHorizontal } from "lucide-react";

import { createRoot } from "react-dom/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DragStartEvent extends React.DragEvent {
  target: HTMLElement;
}

const DummyCard = ({ title }: { title: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[50px] w-[100px]" />
      </CardContent>
    </Card>
  );
};

const dragStartHandler = (ev: any) => {
  console.log("dragStart", ev);
  console.log(ev);
  ev.dataTransfer.setData("text/plain", (ev.target as HTMLElement).id);

  // Create a temporary div to render RedCircle
  const dragImage = document.createElement("div");
  dragImage.style.position = "absolute";
  dragImage.style.left = "-9999px"; // Hide it off-screen
  dragImage.style.top = "-9999px"; // Hide it off-screen
  document.body.appendChild(dragImage);

  const root = createRoot(dragImage);
  root.render(
    <DummyCard title={(ev.target as HTMLElement)?.textContent?.trim() || ""} />
  );

  // Use the rendered div as the drag image
  ev.dataTransfer.setDragImage(dragImage, 0, 0);

  // Cleanup when drag ends
  ev.target.addEventListener(
    "dragend",
    () => {
      root.unmount(); // Unmount the React component
      document.body.removeChild(dragImage);
    },
    { once: true }
  );
};

const CanvasSideBar = ({
  sideBarNodeNames,
}: {
  sideBarNodeNames: Record<string, string>;
}) => {
  const [_, setType] = useDragAndDrop();

  interface DragEvent {
    dataTransfer: {
      effectAllowed: string;
    };
  }

  const onDragStart = (event: DragEvent, nodeType: string): void => {
    if (setType) {
      setType(nodeType);
    }
    dragStartHandler(event);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-48 mx-2 flex flex-col gap-y-1">
      {Object.entries(sideBarNodeNames).map(([key, value]) => (
        <div
          key={key}
          className="border border-slate-300 rounded-sm input flex items-center gap-2 px-1"
          onDragStart={(event) => onDragStart(event, key)}
          draggable
        >
          <GripHorizontal size={14} />
          {value}
        </div>
      ))}
    </aside>
  );
};

export default CanvasSideBar;
