'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FolderOpen,
  LayoutTemplate,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Share2,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { WhatsAppPreview } from '@/components/templates/WhatsAppPreview';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const inputClass =
  'h-11 rounded-xl border-zinc-200 bg-white text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus-visible:ring-[#35c45f]/25 dark:border-[#313833] dark:bg-[#151916] dark:text-white dark:placeholder:text-zinc-500';

export default function NewCampaignPage() {
  const t = useTranslations('NewCampaign');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: instances } = useSWR<any[]>('/api/instance/details', fetcher);
  const { data: templates } = useSWR<any[]>('/api/templates/list', fetcher);
  const { data: featureData, isLoading: isFeatureLoading } = useSWR('/api/features?name=isCampaignsEnabled', fetcher);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [createContacts, setCreateContacts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!isFeatureLoading && featureData && !featureData.hasAccess) {
      toast.error(t('toasts.no_access'));
      router.push('/dashboard');
    }
  }, [featureData, isFeatureLoading, router, t]);

  const wabaInstances = (Array.isArray(instances) ? instances : []).filter((i: any) => i.integration === 'WHATSAPP-BUSINESS');
  const approvedTemplates = useMemo(
    () => (Array.isArray(templates) ? templates.filter((template: any) => template.status === 'APPROVED' && template.instanceId?.toString() === instanceId) : []),
    [templates, instanceId]
  );
  const selectedTemplate = Array.isArray(templates) ? templates.find((template: any) => template.id.toString() === selectedTemplateId) : undefined;

  const handleDownloadTemplate = () => {
    const data = [
      { phone: '5511999999999', '1': 'Joao', '2': 'Empresa ABC' },
      { phone: '5511888888888', '1': 'Maria', '2': 'Empresa XYZ' },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cell = ws[XLSX.utils.encode_cell({ r: row, c: 0 })];
      if (cell) {
        cell.t = 's';
        cell.z = '@';
      }
    }
    if (!ws['!cols']) ws['!cols'] = [];
    ws['!cols'][0] = { wch: 18 };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, 'campaign_template.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

      const parsed = rows
        .map((row: any) => {
          const phone = String(row.phone || row.telephone || row.celular || row.mobile || '').replace(/\D/g, '');
          return { phone, variables: row };
        })
        .filter((row: any) => row.phone);

      if (parsed.length === 0) {
        toast.error(t('leads.error_no_phone'));
      } else {
        setLeads(parsed);
        toast.success(t('leads.success_loaded', { count: parsed.length }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateOutline = () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    if (!name) setName(cleanPrompt.slice(0, 54));
    toast.success('Campaign outline generated');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          instanceId,
          scheduledAt,
          templateId: selectedTemplateId,
          leads,
          createContacts,
        }),
      });

      if (!res.ok) throw new Error('Failed to create campaign');

      toast.success(t('toasts.created'));
      router.push('/campaigns');
    } catch {
      toast.error(t('toasts.error_create'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFeatureLoading || !featureData?.hasAccess) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8f8f7] dark:bg-[#17191b]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#f7f7f5] text-zinc-950 dark:bg-[#151719] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(20,20,20,0.13)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]" />

      <header className="relative z-10 flex h-16 items-center justify-between px-4">
        <div className="flex items-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-[#2d332f] dark:bg-[#101311]">
          <button
            onClick={() => router.back()}
            className="flex h-12 items-center gap-2 border-r border-zinc-200 px-4 text-sm font-semibold transition hover:bg-zinc-50 dark:border-[#2d332f] dark:hover:bg-[#171d18]"
          >
            <ArrowLeft className="h-4 w-4" />
            Campaigns
          </button>
          <div className="px-5 text-sm font-semibold">{name || 'Untitled Campaign'}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-12 rounded-2xl gap-2 border-zinc-200 bg-white shadow-sm dark:border-[#2d332f] dark:bg-[#101311]">
            <LayoutTemplate className="h-4 w-4" />
            Create Template
          </Button>
          <div className="flex h-12 items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold shadow-sm dark:border-[#2d332f] dark:bg-[#101311]">
            <span>100%</span>
            <FolderOpen className="h-4 w-4 text-zinc-500" />
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <Share2 className="h-4 w-4 text-zinc-500" />
            <span>Share</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col px-6 pb-24">
        <section className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
            <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-[#2d332f] dark:bg-[#101311]/90">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Campaign Flow</p>
              <StepButton step={1} active={step === 1} done={step > 1} title="Details" description="Name, sender, schedule" onClick={() => setStep(1)} />
              <StepButton step={2} active={step === 2} done={step > 2} title="Leads" description={`${leads.length || 0} contacts loaded`} onClick={() => setStep(2)} />
              <StepButton step={3} active={step === 3} done={false} title="Template" description={selectedTemplate ? selectedTemplate.name : 'Message content'} onClick={() => setStep(3)} />
              <div className="mt-5 rounded-2xl bg-[#ecf9ef] p-4 text-sm text-[#106b2d] dark:bg-[#35c45f]/10 dark:text-[#8de7a5]">
                <Sparkles className="mb-3 h-5 w-5" />
                Generate a draft, attach leads, choose an approved template, then launch from one clean flow.
              </div>
            </aside>

            <section className="rounded-[28px] border border-zinc-200 bg-white/92 p-5 shadow-xl shadow-zinc-900/5 backdrop-blur dark:border-[#2d332f] dark:bg-[#101311]/92 dark:shadow-black/30">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">New Campaign</h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Build an outbound WhatsApp campaign from one flow.</p>
                </div>
                <StatusChip>{step === 1 ? 'Setup' : step === 2 ? 'Audience' : 'Content'}</StatusChip>
              </div>

              {step === 1 && (
                <div className="space-y-5">
                  <BuilderCard icon={MessageSquare} title={t('details.title')} description="Configure the campaign basics before selecting leads.">
                    <div className="space-y-5">
                      <Field label={t('details.name_label')}>
                        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('details.name_placeholder')} className={inputClass} />
                      </Field>
                      <Field label={t('details.instance_label')}>
                        <Select value={instanceId} onValueChange={setInstanceId}>
                          <SelectTrigger className={inputClass}><SelectValue placeholder={t('details.instance_placeholder')} /></SelectTrigger>
                          <SelectContent>
                            {wabaInstances.map((instance: any) => (
                              <SelectItem key={instance.dbId} value={instance.dbId.toString()}>{instance.instanceName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label={t('details.schedule_label')}>
                        <Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className={inputClass} />
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t('details.schedule_desc')}</p>
                      </Field>
                      <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#2d332f] dark:bg-[#151916]">
                        <Checkbox id="createContacts" checked={createContacts} onCheckedChange={(value) => setCreateContacts(value === true)} />
                        <span>
                          <span className="block text-sm font-semibold">{t('details.create_contacts_label')}</span>
                          <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{t('details.create_contacts_desc')}</span>
                        </span>
                      </label>
                    </div>
                  </BuilderCard>
                  <FooterActions>
                    <Button disabled={!name || !instanceId} onClick={() => setStep(2)} className="rounded-xl bg-[#35c45f] text-white hover:bg-[#2fb454]">
                      {t('details.next_btn')} <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </FooterActions>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <BuilderCard icon={UsersIcon} title={t('leads.title')} description="Upload a spreadsheet with a phone column and optional template variables.">
                    <div className="relative rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-10 text-center transition hover:border-[#35c45f] hover:bg-[#f2fbf4] dark:border-[#39413b] dark:bg-[#151916] dark:hover:bg-[#17251b]">
                      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="absolute inset-0 cursor-pointer opacity-0" />
                      <Upload className="mx-auto mb-3 h-10 w-10 text-[#35c45f]" />
                      <p className="text-sm font-bold">{t('leads.upload_text')}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t('leads.upload_hint')}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="rounded-xl gap-2">
                        <Download className="h-4 w-4" />
                        {t('leads.download_template')}
                      </Button>
                      {leads.length > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#35c45f]/10 px-3 py-1.5 text-sm font-semibold text-[#14933a] dark:text-[#8de7a5]">
                          <FileSpreadsheet className="h-4 w-4" />
                          {t('leads.success_loaded', { count: leads.length })}
                        </div>
                      )}
                    </div>
                  </BuilderCard>
                  <FooterActions>
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">{t('leads.back_btn')}</Button>
                    <Button disabled={leads.length === 0} onClick={() => setStep(3)} className="rounded-xl bg-[#35c45f] text-white hover:bg-[#2fb454]">
                      {t('leads.next_btn')} <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </FooterActions>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <BuilderCard icon={LayoutTemplate} title={t('content.title')} description="Pick an approved WhatsApp template and review the final message.">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                      <div className="space-y-4">
                        <Field label={t('content.template_label')}>
                          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder={t('content.template_placeholder')} /></SelectTrigger>
                            <SelectContent>
                              {approvedTemplates.map((template: any) => (
                                <SelectItem key={template.id} value={template.id.toString()}>{template.name} ({template.language})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        {selectedTemplate ? (
                          <div className="rounded-2xl border border-[#35c45f]/25 bg-[#35c45f]/10 p-4 text-sm text-[#146c32] dark:text-[#8de7a5]">
                            <p className="font-bold">{t('content.mapping_title')}</p>
                            <p className="mt-1">{t('content.mapping_desc')}</p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-[#2d332f] dark:bg-[#151916] dark:text-zinc-400">
                            No approved template selected yet.
                          </div>
                        )}
                      </div>
                      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#2d332f] dark:bg-[#151916]">
                        {selectedTemplate ? (
                          <div className="origin-top scale-[0.72]">
                            <WhatsAppPreview data={selectedTemplate.components} />
                          </div>
                        ) : (
                          <div className="flex h-72 items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">
                            {t('content.preview_placeholder')}
                          </div>
                        )}
                      </div>
                    </div>
                  </BuilderCard>
                  <FooterActions>
                    <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">{t('leads.back_btn')}</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedTemplate} className="rounded-xl bg-[#35c45f] text-white hover:bg-[#2fb454]">
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {t('content.finish_btn')}
                    </Button>
                  </FooterActions>
                </div>
              )}
            </section>

            <aside className="rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-[#2d332f] dark:bg-[#101311]/90">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Live Summary</p>
              <SummaryRow icon={MessageSquare} label="Campaign" value={name || 'Untitled'} />
              <SummaryRow icon={CalendarClock} label="Schedule" value={scheduledAt || 'Send as draft'} />
              <SummaryRow icon={FileSpreadsheet} label="Leads" value={`${leads.length} loaded`} />
              <SummaryRow icon={LayoutTemplate} label="Template" value={selectedTemplate?.name || 'Not selected'} />
              <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#2d332f] dark:bg-[#151916]">
                <p className="text-sm font-bold">Generate campaign</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">Describe the offer and Kyrn prepares the campaign shell.</p>
              </div>
            </aside>
          </div>
        </section>

        <div className="pointer-events-none fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6 lg:left-[250px]">
          <div className="pointer-events-auto flex w-full max-w-[640px] items-center gap-2 rounded-3xl border border-zinc-200 bg-white p-2 shadow-2xl shadow-zinc-900/10 dark:border-[#2d332f] dark:bg-[#101311] dark:shadow-black/40">
            <Wand2 className="ml-3 h-5 w-5 text-zinc-500" />
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Create a launch campaign for warm leads..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-zinc-400 dark:text-white"
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-semibold dark:border-[#2d332f]">
              <Paperclip className="h-4 w-4" />
              Attach
            </button>
            <button type="button" onClick={generateOutline} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#35c45f] text-white">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold">{label}</Label>
      {children}
    </div>
  );
}

function BuilderCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-[#2d332f] dark:bg-[#111512]">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#35c45f]/12 text-[#14933a] dark:text-[#8de7a5]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function StepButton({ step, active, done, title, description, onClick }: { step: number; active: boolean; done: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
        active ? 'bg-[#35c45f] text-white shadow-sm shadow-green-600/20' : 'hover:bg-zinc-100 dark:hover:bg-[#171d18]'
      }`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-white/20' : done ? 'bg-[#35c45f] text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-[#202620]'}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : step}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{title}</span>
        <span className={`block truncate text-xs ${active ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'}`}>{description}</span>
      </span>
    </button>
  );
}

function StatusChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:border-[#2d332f] dark:bg-[#151916] dark:text-zinc-300">
      {children}
    </span>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-[#2d332f] dark:bg-[#151916]">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-[#35c45f]" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="max-w-[150px] truncate text-right text-xs text-zinc-500 dark:text-zinc-400">{value}</span>
    </div>
  );
}

function FooterActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-3">{children}</div>;
}

function UsersIcon({ className }: { className?: string }) {
  return <FileSpreadsheet className={className} />;
}
