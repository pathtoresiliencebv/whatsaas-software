'use client';

import { useActionState } from 'react';
import useSWR from 'swr';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { inviteTeamMember } from '@/app/[locale]/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function InviteTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const { mutate } = useSWR('/api/invitations');

  const isOwner = teamData?.teamMembers?.some(
    (member) => member.userId === user?.id && member.role === 'owner'
  );

  const [, inviteAction, isInvitePending] = useActionState<ActionState, FormData>(
    async (prevState, formData) => {
      const result = await inviteTeamMember(prevState, formData);
      if ('success' in result && result.success) {
        toast.success('Invitation sent');
        mutate();
        onOpenChange(false);
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    {}
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[520px]">
        <div className="h-40 bg-[radial-gradient(circle_at_20%_20%,rgba(53,196,95,0.35),transparent_30%),radial-gradient(circle_at_70%_10%,rgba(20,147,58,0.24),transparent_28%),linear-gradient(135deg,#e8f9ed,#f8f8f7_45%,#dff5e7)]" />
        <div className="px-6 pb-6">
          <DialogHeader className="-mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-lg shadow-zinc-900/10 dark:border-[#303630] dark:bg-[#111412]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f9ed] text-[#14933a]">
              <Send className="h-5 w-5" />
            </div>
            <DialogTitle>Invite team members</DialogTitle>
            <DialogDescription>
              Add a colleague to this workspace so they can help manage inboxes, agents, and campaigns.
            </DialogDescription>
          </DialogHeader>

          <form action={inviteAction} className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sidebar-invite-email">Invite colleague</Label>
              <Input
                id="sidebar-invite-email"
                name="email"
                type="email"
                placeholder="Email address"
                required
                disabled={!isOwner || isInvitePending}
                className="h-11 rounded-xl"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                They will receive an invitation to join the current workspace.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Seat role</Label>
              <RadioGroup
                defaultValue="agent"
                name="role"
                className="grid grid-cols-3 gap-2"
                disabled={!isOwner || isInvitePending}
              >
                {[
                  ['agent', 'Agent'],
                  ['admin', 'Admin'],
                  ['owner', 'Owner'],
                ].map(([value, label]) => (
                  <Label
                    key={value}
                    htmlFor={`sidebar-role-${value}`}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-[#303630]"
                  >
                    <RadioGroupItem value={value} id={`sidebar-role-${value}`} />
                    {label}
                  </Label>
                ))}
              </RadioGroup>
              {!isOwner && (
                <p className="text-xs text-amber-600">Only workspace owners can invite team members.</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                disabled={!isOwner || isInvitePending}
              >
                {isInvitePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Invite
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
