"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">SGFC</span>
              <span className="hidden sm:block text-muted-foreground">|</span>
              <span className="hidden sm:block text-sm text-muted-foreground">
                Lecture automatique de factures
              </span>
            </div>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Compte Prorata
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
