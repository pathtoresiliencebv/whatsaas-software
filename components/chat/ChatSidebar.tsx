'use client';

import React from 'react';

interface ChatSidebarProps {
  chatDetails?: any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isGroup?: boolean;
  onSyncMessages?: () => void;
  isSyncingMessages?: boolean;
  [key: string]: any;
}

export function ChatSidebar(props: ChatSidebarProps) {
  return (
    <div className="w-full h-full bg-muted/30">
      <div className="p-4 text-center text-muted-foreground">
        Chat sidebar
      </div>
    </div>
  );
}
