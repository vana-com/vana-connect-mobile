"use client";

import { Pencil, FolderInput, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { ClusterItem } from "@/lib/data/clusters";

interface ItemActionSheetProps {
  item: ClusterItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function ActionRow({
  icon: Icon,
  label,
  destructive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5",
        "text-button border-b border-border last:border-0",
        "transition-colors hover:bg-muted active:bg-muted",
        destructive ? "text-destructive" : "text-foreground"
      )}
    >
      <Icon size={18} className="shrink-0" />
      {label}
    </button>
  );
}

export function ItemActionSheet({ item, isOpen, onClose }: ItemActionSheetProps) {
  if (!item) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-small font-normal text-muted-foreground truncate">
            {item.title}
          </DrawerTitle>
        </DrawerHeader>
        <div className="border-t border-border">
          <ActionRow icon={Pencil} label="Edit" onClick={onClose} />
          <ActionRow icon={FolderInput} label="Move to cluster" onClick={onClose} />
          <ActionRow
            icon={Trash2}
            label="Delete"
            destructive
            onClick={onClose}
          />
        </div>
        <div className="p-4">
          <button
            onClick={onClose}
            className="w-full py-3.5 text-button font-semibold text-center text-muted-foreground rounded-squish border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
