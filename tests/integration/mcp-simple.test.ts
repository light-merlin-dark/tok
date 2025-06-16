import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';

describe('MCP Server Simple Test', () => {
  const mcpPath = path.join(process.cwd(), 'dist', 'mcp-server.js');
  
  beforeAll(async () => {
    execSync('npm run build', { stdio: 'inherit' });
  }, 30000);

  it('should respond to tools/list request', () => {
    const input = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });

    const output = execSync(`echo '${input}' | node ${mcpPath} 2>/dev/null`, {
      encoding: 'utf-8'
    });

    const response = JSON.parse(output);
    
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
    expect(response.result.tools).toBeInstanceOf(Array);
    
    const toolNames = response.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain('estimate_tokens');
    expect(toolNames).toContain('get_cost_summary');
    expect(toolNames).toContain('list_models');
    expect(toolNames).toContain('set_model_price');
    expect(toolNames).toContain('reset_tracker');
  });

  it('should have proper tool schemas', () => {
    const input = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });

    const output = execSync(`echo '${input}' | node ${mcpPath} 2>/dev/null`, {
      encoding: 'utf-8'
    });

    const response = JSON.parse(output);
    const estimateTool = response.result.tools.find((t: any) => t.name === 'estimate_tokens');
    
    expect(estimateTool).toBeDefined();
    expect(estimateTool.inputSchema).toBeDefined();
    expect(estimateTool.annotations).toBeDefined();
    expect(estimateTool.annotations.text).toBeDefined();
    expect(estimateTool.annotations.model).toBeDefined();
  });
});