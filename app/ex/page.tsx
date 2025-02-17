"use client";

import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { BellRing, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

type CardProps = React.ComponentProps<typeof Card>;

export function CardDemo({ className, ...props }: CardProps) {
  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Push Notifications
            </p>
            <p className="text-sm text-muted-foreground">
              Send notifications to device.
            </p>
          </div>
          <Switch />
        </div>
        <div>
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
            >
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Check /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Home() {
  const dragStartHandler = (ev) => {
    console.log("dragStart");
    ev.dataTransfer.setData("text/plain", ev.target.id);

    // Create a temporary div to render RedCircle
    const dragImage = document.createElement("div");
    dragImage.style.position = "absolute";
    dragImage.style.left = "-9999px"; // Hide it off-screen
    dragImage.style.top = "-9999px"; // Hide it off-screen
    document.body.appendChild(dragImage);

    // Render the <RedCircle> component inside this div using ReactDOM
    const root = createRoot(dragImage);
    root.render(<CardDemo />);

    // Use the rendered div as the drag image
    ev.dataTransfer.setDragImage(dragImage, 20, 20);

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

  const dragOverHandler = (ev) => {
    ev.preventDefault();
  };

  const dropHandler = (ev) => {
    ev.preventDefault();
    console.log("Drop");
    const data = ev.dataTransfer.getData("text/plain");
    const draggedEl = document.getElementById(data);
    if (draggedEl) {
      ev.target.appendChild(draggedEl);
    }
  };

  return (
    <div style={{ padding: "2em" }}>
      <h1>
        Example of <code>DataTransfer.setDragImage()</code> with a Red Circle
      </h1>
      <div>
        <p
          id="source"
          draggable
          onDragStart={dragStartHandler}
          style={{
            color: "blue",
            border: "1px solid black",
            padding: "1em",
            width: "300px",
          }}
        >
          Select this element, drag it to the Drop Zone and then release the
          selection to move the element.
        </p>
      </div>
      <div
        id="target"
        onDragOver={dragOverHandler}
        onDrop={dropHandler}
        style={{
          border: "1px solid black",
          marginTop: "1em",
          padding: "2em",
          minHeight: "100px",
        }}
      >
        Drop Zone
      </div>
    </div>
  );
}
