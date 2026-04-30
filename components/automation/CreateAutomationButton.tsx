'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function CreateAutomationButton() {
  return (
    <Button asChild>
      <Link href="/automation/new">
        <Plus className="h-4 w-4 mr-2" />
        Create Automation
      </Link>
    </Button>
  );
}
