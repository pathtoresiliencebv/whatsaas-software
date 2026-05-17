import { Composio } from '@composio/core';
import type { ToolDefinition } from '../types';

export class ComposioProvider {
  private client: Composio;
  private userId: string;

  constructor(apiKey: string, userId: string) {
    this.client = new Composio({ apiKey });
    this.userId = userId;
  }

  async getTools(toolkitNames: string[]): Promise<ToolDefinition[]> {
    try {
      const tools = await this.client.tools.get(this.userId, {
        toolkits: toolkitNames,
      });

      return tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || `Execute ${tool.name} via Composio`,
        parameters: tool.parameters || { type: 'object', properties: {} },
        execute: async (args: Record<string, any>) => {
          try {
            const result = await this.client.tools.execute(tool.name, {
              userId: this.userId,
              arguments: args,
            });
            return result.data || result;
          } catch (error: any) {
            console.error(`Composio tool ${tool.name} execution error:`, error);
            throw new Error(`Tool execution failed: ${error.message}`);
          }
        },
      }));
    } catch (error: any) {
      console.error('Failed to fetch Composio tools:', error);
      return [];
    }
  }
}

export async function getComposioTools(
  apiKey: string,
  teamId: number,
  userId: string,
  enabledToolkits: string[] = ['gmail', 'googlecalendar', 'github', 'notion', 'hubspot', 'salesforce', 'slack', 'discord', 'jira']
): Promise<ToolDefinition[]> {
  if (!apiKey) return [];

  try {
    const provider = new ComposioProvider(apiKey, userId || `team-${teamId}`);
    return await provider.getTools(enabledToolkits);
  } catch (error) {
    console.error('Composio initialization failed:', error);
    return [];
  }
}
