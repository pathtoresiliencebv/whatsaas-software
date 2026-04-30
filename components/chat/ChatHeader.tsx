'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Phone, Video, Search } from 'lucide-react';

interface ChatHeaderProps {
  name?: string;
  status?: string;
  instanceName?: string;
  chatDetails?: any;
  showSearch?: boolean;
  setShowSearch?: any;
  searchQuery?: string;
  setSearchQuery?: any;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isGroup?: boolean;
  [key: string]: any;
}

export function ChatHeader({ name, status, instanceName }: ChatHeaderProps) {
  const initials = (name || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{name || 'Unknown'}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{status || 'offline'}</span>
            {instanceName && (
              <Badge variant="secondary" className="text-xs">
                {instanceName}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
