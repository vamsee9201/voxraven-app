import { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

const DragAndDropContext = createContext([null, (_: any) => {}]);

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState(null);

  return (
    <DragAndDropContext.Provider value={[type, setType]}>
      {children}
    </DragAndDropContext.Provider>
  );
};

export default DragAndDropContext;

export const useDragAndDrop = () => {
  return useContext(DragAndDropContext);
};
