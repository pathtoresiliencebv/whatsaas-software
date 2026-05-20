'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function NoChatSelectedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background/50 text-muted-foreground p-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-foreground">No Conversation Selected</h2>
      <p className="text-sm text-center max-w-sm text-muted-foreground/80">
        Choose a conversation from the left sidebar or create a new one to start messaging.
      </p>
    </div>
  );
}
