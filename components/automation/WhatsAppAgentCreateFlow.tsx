'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, CheckCircle2, Loader2, MessageSquare, Smartphone, X, Zap } from 'lucide-react';
import { createAutomation } from '@/app/[locale]/(dashboard)/automation/actions';

type InstanceOption = {
  id: number;
  instanceName?: string | null;
  name?: string | null;
};

export function WhatsAppAgentCreateFlow({ instances }: { instances: InstanceOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'form' | 'creating' | 'success'>('form');
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    triggerKeyword: '',
    instanceId: instances[0]?.id ? String(instances[0].id) : '',
    useCase: '',
    activityDescription: '',
  });

  function createAgent() {
    if (!form.name.trim()) return;

    setError('');
    setStep('creating');
    startTransition(async () => {
      try {
        const instanceId = form.instanceId ? Number(form.instanceId) : null;
        const result = await createAutomation(
          form.name.trim(),
          instanceId,
          form.triggerKeyword.trim() || null,
          {
            useCase: form.useCase.trim(),
            activityDescription: form.activityDescription.trim(),
          }
        );
        setCreatedId(result.id);
        setStep('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not create WhatsApp agent.');
        setStep('form');
      }
    });
  }

  return (
    <div className="min-h-full bg-[#060807] text-white">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[720px] items-center px-6 py-12">
        <div className="w-full">
          <button
            type="button"
            onClick={() => router.push('/automation')}
            className="mb-8 text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Back to WhatsApp Agents
          </button>

          <h1 className="text-3xl font-bold tracking-tight">Create WhatsApp Agent</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tell us what this agent should do and Kyrn creates a connected WhatsApp workflow for you.
          </p>

          <div className="mt-7 rounded-xl border border-[#262d28] bg-[#121513] p-6 shadow-2xl shadow-black/25">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#35c45f]/15 text-[#35c45f]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Agent Details</h2>
                <p className="mt-1 text-sm text-zinc-400">Configure your WhatsApp agent settings</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <Field label="Agent Name" help="Short name shown in your WhatsApp workspace and run logs.">
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Lead qualifier"
                  className={inputClass}
                />
              </Field>

              <Field label="Trigger Keyword" help="Optional. Leave empty when this agent can handle all incoming chats.">
                <input
                  value={form.triggerKeyword}
                  onChange={(event) => setForm({ ...form, triggerKeyword: event.target.value })}
                  placeholder="e.g. demo"
                  className={inputClass}
                />
              </Field>

              <Field label="WhatsApp Connection" help="You can connect or change numbers later in Settings.">
                <select
                  value={form.instanceId}
                  onChange={(event) => setForm({ ...form, instanceId: event.target.value })}
                  className={inputClass}
                >
                  <option value="">No specific connection yet</option>
                  {instances.map((instance) => (
                    <option key={instance.id} value={instance.id}>
                      {instance.instanceName || instance.name || `Connection #${instance.id}`}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Use Case" help="Describe the primary purpose of this WhatsApp agent.">
                <input
                  value={form.useCase}
                  onChange={(event) => setForm({ ...form, useCase: event.target.value })}
                  placeholder="e.g. Qualify inbound leads"
                  className={inputClass}
                />
              </Field>

              <Field label="Activity Description" help="This becomes the first workflow prompt and reply behavior.">
                <textarea
                  value={form.activityDescription}
                  onChange={(event) => setForm({ ...form, activityDescription: event.target.value })}
                  rows={5}
                  placeholder="Describe what the agent should ask, answer, collect, or hand off..."
                  className={`${inputClass} min-h-[116px] resize-none`}
                />
              </Field>

              <button
                type="button"
                onClick={createAgent}
                disabled={!form.name.trim() || isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#35c45f] px-4 py-3 text-sm font-bold text-[#041208] transition hover:bg-[#2daf53] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                <Zap className="h-4 w-4" />
                Create Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {step === 'creating' && (
        <Modal>
          <div className="w-[448px] rounded-xl border border-[#303530] bg-[#171a18] p-10 text-center shadow-2xl">
            <Loader2 className="mx-auto mb-8 h-16 w-16 animate-spin text-[#35c45f]" />
            <h2 className="text-lg font-bold">Creating Your Workflow</h2>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-zinc-400">
              We're setting up your WhatsApp agent with your specifications. This will just take a moment...
            </p>
          </div>
        </Modal>
      )}

      {step === 'success' && (
        <Modal>
          <div className="relative w-[512px] rounded-xl border border-[#303530] bg-[#101311] p-6 shadow-2xl">
            <button onClick={() => setStep('form')} className="absolute right-4 top-4 text-zinc-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <h2 className="flex items-center gap-3 text-lg font-bold">
              <CheckCircle2 className="h-5 w-5 text-[#35c45f]" /> Workflow Created Successfully!
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-6 text-zinc-400">
              <p>A WhatsApp agent workflow has been generated for your use case, with editable nodes and connected actions.</p>
              <p>The agent is ready to test in the editor and can be connected to WhatsApp conversations.</p>
            </div>
            <button
              type="button"
              onClick={() => createdId && router.push(`/automation/${createdId}`)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#35c45f] px-4 py-3 text-sm font-bold text-[#041208] transition hover:bg-[#2daf53]"
            >
              <Bot className="h-4 w-4" />
              Open and Test Agent
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white">{label}</span>
      {children}
      {help && <span className="mt-2 flex items-center gap-2 text-xs leading-5 text-zinc-400"><Smartphone className="h-3.5 w-3.5" />{help}</span>}
    </label>
  );
}

function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[#343a35] bg-[#202420] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#35c45f] focus:ring-2 focus:ring-[#35c45f]/20';
