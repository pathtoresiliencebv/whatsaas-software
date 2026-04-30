import { getBranding } from '@/lib/db/queries/branding';
import Link from 'next/link';
import { ArrowLeft, Book, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'API Documentation',
  description: 'WhatSaaS REST API documentation',
};

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  return (
    <div className="relative group rounded-lg bg-zinc-950 border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-zinc-900">
        <span className="text-xs text-zinc-400 font-mono">{language}</span>
        <button
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
          }}
        >
          <Copy className="h-3 w-3" /> Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-zinc-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  body,
  response,
}: {
  method: string;
  path: string;
  description: string;
  body?: string;
  response?: string;
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/10 text-green-500 border-green-500/20',
    POST: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    PUT: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-card">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${methodColors[method] || ''}`}>
            {method}
          </span>
          <code className="text-sm font-mono text-foreground">{path}</code>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {body && (
        <div className="border-t border-border">
          <div className="px-5 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground">Request Body</div>
          <div className="p-4 pt-2">
            <CodeBlock code={body} language="json" />
          </div>
        </div>
      )}
      {response && (
        <div className="border-t border-border">
          <div className="px-5 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground">Response</div>
          <div className="p-4 pt-2">
            <CodeBlock code={response} language="json" />
          </div>
        </div>
      )}
    </div>
  );
}

export default async function ApiDocsPage() {
  const branding = await getBranding();
  const siteName = branding?.name || 'WhatSaaS';

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/docs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Docs
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Book className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">API Reference</h1>
          </div>
          <p className="text-muted-foreground">
            Integrate {siteName} with your own applications using our REST API.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Authentication */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <p className="text-muted-foreground mb-4">
            All API requests require an API key passed via the <code className="text-sm bg-muted px-1.5 py-0.5 rounded">Authorization</code> header.
            Generate API keys in <Link href="/settings/developers" className="text-primary hover:underline">Settings → Developers</Link>.
          </p>
          <CodeBlock
            language="bash"
            code={`curl -X POST https://yourdomain.com/api/v1/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"instanceName":"my-instance","number":"31612345678","type":"text","message":"Hello!"}'`}
          />
        </section>

        {/* Base URL */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Base URL</h2>
          <CodeBlock code="https://yourdomain.com/api/v1" language="bash" />
        </section>

        {/* Send Message */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Send Message</h2>
          <Endpoint
            method="POST"
            path="/api/v1/send"
            description="Send a WhatsApp message via your connected instance."
            body={`{
  "instanceName": "my-instance",       // string — your instance name
  "number": "31612345678",            // string — recipient phone number (E.164 format)
  "type": "text",                     // "text" | "image" | "video" | "document" | "audio"
  "message": "Hello, world!",          // string — message content (required for type="text")
  "mediaUrl": "https://...",          // string — URL for media (required for image/video/document/audio)
  "fileName": "document.pdf",          // string — file name for documents
  "mimetype": "application/pdf"       // string — MIME type for media
}`}
            response={`{
  "success": true,
  "data": {
    "key": { "id": "false_123456789@c.us_9C6D0..." },
    "message": "success"
  }
}`}
          />
        </section>

        {/* Rate Limits */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Rate Limits</h2>
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              Rate limits are applied per team based on your subscription plan:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Free:</strong> 5 messages/min</li>
              <li>• <strong>Starter:</strong> 10 messages/min</li>
              <li>• <strong>Pro:</strong> 40 messages/min</li>
              <li>• <strong>Enterprise:</strong> 200 messages/min</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              When rate limited, the API returns <code className="bg-muted px-1 py-0.5 rounded text-xs">429 Too Many Requests</code> with a <code className="bg-muted px-1 py-0.5 rounded text-xs">Retry-After</code> header.
            </p>
          </div>
        </section>

        {/* Webhook */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Webhooks</h2>
          <p className="text-muted-foreground mb-4">
            Receive real-time message events by configuring a webhook URL in Settings. Your webhook endpoint must:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-4">
            <li>1. Accept <code className="bg-muted px-1 py-0.5 rounded">POST</code> requests</li>
            <li>2. Return <code className="bg-muted px-1 py-0.5 rounded">200 OK</code> within 5 seconds</li>
            <li>3. Verify the webhook signature (if configured)</li>
          </ul>
          <CodeBlock
            language="json"
            code={`// Incoming webhook payload (messages.upsert event)
{
  "event": "messages.upsert",
  "instance": "my-instance",
  "data": {
    "key": {
      "id": "false_31612345678@c.us_ABC123",
      "remote": "31612345678@c.us",
      "fromMe": false
    },
    "message": {
      "conversation": "Hi there!"
    },
    "messageType": "conversation",
    "pushName": "John"
  }
}`}
          />
        </section>

        {/* Error Codes */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Error Codes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold">Code</th>
                  <th className="text-left py-2 px-3 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border"><td className="py-2 px-3 font-mono">400</td><td>Bad request — invalid payload</td></tr>
                <tr className="border-b border-border"><td className="py-2 px-3 font-mono">401</td><td>Unauthorized — invalid or missing API key</td></tr>
                <tr className="border-b border-border"><td className="py-2 px-3 font-mono">403</td><td>Forbidden — webhook token mismatch</td></tr>
                <tr className="border-b border-border"><td className="py-2 px-3 font-mono">404</td><td>Instance not found or not connected</td></tr>
                <tr className="border-b border-border"><td className="py-2 px-3 font-mono">429</td><td>Rate limit exceeded</td></tr>
                <tr className="border-b border-border"><td className="py-2 px-3 font-mono">500</td><td>Internal server error</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
