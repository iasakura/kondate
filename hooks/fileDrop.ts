import React from "react";

export const useDrop = (props: { handleFileDrop: (file: File) => void }) => {
  const [isDraggedOver, setIsDraggedOVer] = React.useState(false);

  const handleDragOver = React.useCallback(
    (ev: React.DragEvent<HTMLDivElement>) => {
      ev.stopPropagation();
      ev.preventDefault();
      setIsDraggedOVer(true);
    },
    []
  );

  const handleDragLeave = React.useCallback(
    (ev: React.DragEvent<HTMLDivElement>) => {
      ev.stopPropagation();
      ev.preventDefault();
      setIsDraggedOVer(false);
    },
    []
  );

  const handleDrop = React.useCallback(
    async (ev: React.DragEvent<HTMLDivElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      setIsDraggedOVer(false);
      const items = [...ev.dataTransfer.items];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            await props.handleFileDrop(file);
          }
        }
      }
    },
    []
  );

  return { handleDragOver, handleDragLeave, handleDrop, isDraggedOver };
};
