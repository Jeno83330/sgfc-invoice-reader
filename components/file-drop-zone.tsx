"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  loadedFile?: string | null;
  className?: string;
}

export function FileDropZone({
  accept,
  multiple = false,
  onFilesSelected,
  title,
  description,
  icon,
  loadedFile,
  className,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300",
        isDragging && "border-primary bg-primary/5 scale-[1.01]",
        loadedFile && "border-success bg-success/5",
        !isDragging && !loadedFile && "border-border hover:border-muted-foreground hover:bg-muted/30",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center py-12 px-6">
        {loadedFile ? (
          <>
            <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <Check className="h-7 w-7 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Fichier charge
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px] truncate">
              {loadedFile}
            </p>
          </>
        ) : (
          <>
            <div
              className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                isDragging ? "bg-primary/20" : "bg-muted"
              )}
            >
              {icon || <Upload className={cn("h-7 w-7", isDragging ? "text-primary" : "text-muted-foreground")} />}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{title}</p>
            <p className="text-xs text-muted-foreground text-center">
              {description}
            </p>
          </>
        )}
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
