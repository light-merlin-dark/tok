#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  CharDivEstimator,
  TiktokenEstimator,
  PriceTable,
  CostTracker,
  CostCalculator
} from './index';

// Initialize components
const server = new McpServer({
  name: "tok",
  version: "0.1.0",
  description: "Token estimation and cost calculation for enterprise LLMs"
});

const tracker = new CostTracker();
const prices = new PriceTable();
const charEstimator = new CharDivEstimator();

// Schema definitions for validation
const estimateTokensSchema = z.object({
  text: z.string().min(1),
  model: z.string().optional().default("gpt-4o"),
  exact: z.boolean().optional().default(false),
  track: z.boolean().optional().default(false)
});

const setModelPriceSchema = z.object({
  model: z.string().min(1),
  promptPrice: z.number().positive(),
  completionPrice: z.number().positive()
});

// Tool implementations
server.tool(
  "estimate_tokens",
  {
    text: { type: "string", description: "Text to estimate tokens for" },
    model: { type: "string", description: "Model for cost calculation", default: "gpt-4o" },
    exact: { type: "boolean", description: "Use exact token counting (requires tiktoken)", default: false },
    track: { type: "boolean", description: "Add to cost tracking session", default: false }
  },
  async (args) => {
    const { text, model = "gpt-4o", exact = false, track = false } = estimateTokensSchema.parse(args);
    try {
      let tokens: number;
      let method: string;

      if (exact) {
        const tiktokenEstimator = new TiktokenEstimator();
        try {
          await tiktokenEstimator.initialize();
          tokens = tiktokenEstimator.estimate(text);
          tiktokenEstimator.dispose();
          method = "exact";
        } catch (error) {
          // Fallback to char estimation
          tokens = charEstimator.estimate(text);
          method = "estimate (tiktoken unavailable)";
        }
      } else {
        tokens = charEstimator.estimate(text);
        method = "estimate";
      }

      // Calculate cost
      const modelPrice = prices.get(model);
      let cost = null;
      let costFormatted = "N/A";

      if (modelPrice) {
        cost = CostCalculator.cost(tokens, modelPrice.prompt);
        costFormatted = CostCalculator.formatCost(cost);

        // Track if requested
        if (track) {
          tracker.add(model, tokens, 0, modelPrice);
        }
      }

      const result = {
        text_length: text.length,
        tokens,
        model,
        cost: costFormatted,
        method,
        tracked: track
      };

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Error: ${error.message}`
        }]
      };
    }
  }
);

server.tool(
  "get_cost_summary",
  {},
  async () => {
    try {
      const summary = tracker.getSummary();

      if (summary.models.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: "No tracking data available. Use track=true with estimate_tokens to start tracking."
          }]
        };
      }

      const formattedSummary = {
        duration_seconds: summary.duration,
        total_cost: CostCalculator.formatCost(summary.totalCost),
        total_tokens: summary.totalTokens,
        models: summary.modelBreakdown.map(item => ({
          model: item.model,
          tokens: item.tokens,
          cost: {
            prompt: CostCalculator.formatCost(item.cost.prompt),
            completion: CostCalculator.formatCost(item.cost.completion),
            total: CostCalculator.formatCost(item.cost.total)
          }
        }))
      };

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(formattedSummary, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Error: ${error.message}`
        }]
      };
    }
  }
);

server.tool(
  "list_models",
  {},
  async () => {
    try {
      const allPrices = prices.list();
      const models: Record<string, any> = {};

      allPrices.forEach((price, model) => {
        models[model] = {
          prompt_price_per_million: price.prompt,
          completion_price_per_million: price.completion
        };
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(models, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Error: ${error.message}`
        }]
      };
    }
  }
);

server.tool(
  "set_model_price",
  {
    model: { type: "string", description: "Model name" },
    promptPrice: { type: "number", description: "Price per million prompt tokens" },
    completionPrice: { type: "number", description: "Price per million completion tokens" }
  },
  async (args) => {
    const { model, promptPrice, completionPrice } = setModelPriceSchema.parse(args);
    try {
      prices.set(model, {
        prompt: promptPrice,
        completion: completionPrice
      });

      return {
        content: [{
          type: "text" as const,
          text: `Price set for ${model}:\n- Prompt: $${promptPrice}/M tokens\n- Completion: $${completionPrice}/M tokens`
        }]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Error: ${error.message}`
        }]
      };
    }
  }
);

server.tool(
  "reset_tracker",
  {},
  async () => {
    try {
      tracker.reset();
      return {
        content: [{
          type: "text" as const,
          text: "Cost tracking data has been reset."
        }]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Error: ${error.message}`
        }]
      };
    }
  }
);

// Note: Dynamic tool descriptions would be set here if the SDK supports it
// For now, the description is static in the tool definition

// Start the server
async function main() {
  console.error("Tok MCP Server starting...");
  await server.connect(new StdioServerTransport());
  console.error("Server connected and ready");
}

main().catch((error) => {
  console.error("MCP Server error:", error);
  process.exit(1);
});