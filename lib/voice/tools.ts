export type VoiceToolLike = {
  name: string;
  category: string;
  definition: Record<string, any>;
};

export type VoiceToolExecutionResult = {
  ok: boolean;
  action?: 'http_request' | 'end_call' | 'transfer_call' | 'calculator' | 'webhook';
  output?: any;
  error?: string;
};

export async function executeVoiceTool(params: {
  tool: VoiceToolLike;
  input?: Record<string, any>;
  variables?: Record<string, any>;
  fetchImpl?: typeof fetch;
}): Promise<VoiceToolExecutionResult> {
  const category = params.tool.category || 'http_api';
  const input = params.input || {};
  const variables = { ...(params.variables || {}), ...input };

  if (category === 'calculator') {
    return executeCalculator(input.expression);
  }

  if (category === 'end_call') {
    return {
      ok: true,
      action: 'end_call',
      output: {
        reason: input.reason || params.tool.definition.reason || 'completed',
        disposition: params.tool.definition.disposition || input.disposition || 'completed',
      },
    };
  }

  if (category === 'transfer_call') {
    return {
      ok: true,
      action: 'transfer_call',
      output: {
        to: renderTemplate(params.tool.definition.to || input.to || '', variables),
        reason: input.reason || params.tool.definition.reason || 'requested_transfer',
      },
    };
  }

  if (category === 'http_api' || category === 'webhook') {
    return executeHttpTool(params.tool, variables, params.fetchImpl || fetch);
  }

  return { ok: false, error: `Unsupported voice tool category: ${category}` };
}

async function executeHttpTool(
  tool: VoiceToolLike,
  variables: Record<string, any>,
  fetchImpl: typeof fetch,
): Promise<VoiceToolExecutionResult> {
  const url = renderTemplate(tool.definition.url || tool.definition.endpoint || '', variables);
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, action: 'http_request', error: 'HTTP tool needs a valid http(s) URL.' };
  }

  const method = String(tool.definition.method || 'GET').toUpperCase();
  const body = method === 'GET' ? undefined : JSON.stringify(renderTemplateDeep(tool.definition.body || variables, variables));
  const headers = renderTemplateDeep(tool.definition.headers || {}, variables);
  const response = await fetchImpl(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });

  const text = await response.text();
  let output: any = text;
  try {
    output = text ? JSON.parse(text) : null;
  } catch {
    output = text;
  }

  return {
    ok: response.ok,
    action: tool.category === 'webhook' ? 'webhook' : 'http_request',
    output,
    error: response.ok ? undefined : `HTTP ${response.status}`,
  };
}

function executeCalculator(expression: unknown): VoiceToolExecutionResult {
  const raw = String(expression || '');
  if (!/^[\d\s+\-*/().,%]+$/.test(raw)) {
    return { ok: false, action: 'calculator', error: 'Calculator expression contains unsupported characters.' };
  }

  const normalized = raw.replace(/%/g, '/100');
  const output = Function(`"use strict"; return (${normalized});`)();
  if (typeof output !== 'number' || !Number.isFinite(output)) {
    return { ok: false, action: 'calculator', error: 'Calculator expression did not produce a finite number.' };
  }
  return { ok: true, action: 'calculator', output };
}

function renderTemplateDeep(value: any, variables: Record<string, any>): any {
  if (typeof value === 'string') return renderTemplate(value, variables);
  if (Array.isArray(value)) return value.map((item) => renderTemplateDeep(item, variables));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, renderTemplateDeep(child, variables)]));
  }
  return value;
}

function renderTemplate(template: string, variables: Record<string, any>) {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key) => {
    const value = variables[key];
    return value === undefined || value === null ? '' : String(value);
  });
}
