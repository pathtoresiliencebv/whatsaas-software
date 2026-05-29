'use client';

import { Columns3 } from 'lucide-react';
import KanbanBoard from '../KanbanBoard';

export default function ChatKanbanPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/40">
      <header className="shrink-0 border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Columns3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Chat Kanban</h1>
            <p className="text-sm text-muted-foreground">
              Move conversations through your funnel stages without leaving Chats.
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden p-4">
        <KanbanBoard />
      </div>
    </div>
  );
}
