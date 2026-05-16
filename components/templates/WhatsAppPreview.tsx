'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Message = {
  type: 'text' | 'image' | 'video' | 'document';
  content: string;
  url?: string;
};

interface WhatsAppPreviewProps {
  message?: Message;
  data?: any;
  headerType?: string;
  headerText?: string;
  bodyText?: string;
  footerText?: string;
  buttons?: any[];
  [key: string]: any;
}

export function WhatsAppPreview({ message, data, headerText, bodyText }: WhatsAppPreviewProps) {
  const content = message?.content || data?.content || bodyText || 'Your message preview will appear here...';
  const type = message?.type || data?.type || 'text';

  return (
    <Card className="w-full max-w-[320px] bg-[#ECE5DD]">
      <CardContent className="p-3">
        {/* WhatsApp header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5DDD5]">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white text-xs font-bold">
            K
          </div>
          <div>
            <p className="text-sm font-medium text-[#111B21]">Kyrn Bot</p>
            <p className="text-[10px] text-[#667781]">online</p>
          </div>
        </div>

        {/* Message bubble */}
        <div className="bg-[#FFFFFF] rounded-lg p-2 shadow-sm max-w-[85%]">
          <p className="text-sm text-[#111B21] whitespace-pre-wrap">{content}</p>
          {type !== 'text' && (
            <div className="mt-2 text-xs text-[#667781]">
              {type === 'image' && '📷 Photo'}
              {type === 'video' && '🎥 Video'}
              {type === 'document' && '📄 Document'}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-[10px] text-[#667781] text-right mt-1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </CardContent>
    </Card>
  );
}
