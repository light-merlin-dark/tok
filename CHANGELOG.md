# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-08-12

### Changed
- **BREAKING**: Removed MCP (Model Context Protocol) support entirely
  - Eliminated ~20MB dependency overhead from @modelcontextprotocol/sdk
  - Removed tok-mcp binary and all MCP-related functionality
  - Decision based on careful evaluation: for a lightweight token estimation utility, the overhead wasn't justified
  - Modern AI models excel at CLI command execution, making traditional CLI approach more efficient for this use case
- Replaced heavy Tiktoken dependency with lightweight heuristic-based estimation
  - Removed @dqbd/tiktoken optional dependency (significant size reduction)
  - Implemented smart estimation algorithm using word analysis, punctuation weighting, and character counting
  - Maintains accuracy while dramatically reducing package footprint
- Reduced production dependencies from 3 to 2 (only chalk and zod remain)
- Package size reduced from ~88MB (with dev deps) to ~2.5MB (production only)

### Improved
- Enhanced TiktokenEstimator with intelligent heuristic algorithms
- Faster installation and deployment times
- Better suited for CI/CD pipelines and serverless environments
- Maintained full CLI functionality with improved performance

## [0.1.0] - 2025-06-16

### Added
- Initial release
- Fast character-based token estimation (chars/4)
- Advanced heuristic-based token estimation
- Cost calculation with per-model pricing
- CLI interface for token estimation and cost tracking
- Support for major LLM models (GPT-4, Claude, Llama, etc.)
- Real-time cost aggregation and tracking
- Comprehensive documentation