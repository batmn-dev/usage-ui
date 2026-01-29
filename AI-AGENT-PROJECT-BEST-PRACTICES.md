# AI Agent Project Setup: Best Practices Guide (2026)

> A comprehensive guide to designing, building, and deploying AI agents based on the latest documentation, frameworks, and industry best practices.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Design Principles](#core-design-principles)
3. [Architecture Patterns](#architecture-patterns)
4. [Framework Selection](#framework-selection)
5. [Project Structure](#project-structure)
6. [Tool & Function Calling](#tool--function-calling)
7. [Memory & State Management](#memory--state-management)
8. [Human-in-the-Loop Patterns](#human-in-the-loop-patterns)
9. [Guardrails & Safety](#guardrails--safety)
10. [Security & Compliance](#security--compliance)
11. [Prompt Engineering for Agents](#prompt-engineering-for-agents)
12. [RAG Integration](#rag-integration)
13. [Multi-Agent Orchestration](#multi-agent-orchestration)
14. [Error Handling & Recovery](#error-handling--recovery)
15. [Cost Optimization](#cost-optimization)
16. [Observability & Monitoring](#observability--monitoring)
17. [Testing & Evaluation](#testing--evaluation)
18. [Deployment Patterns](#deployment-patterns)
19. [Reference Implementations](#reference-implementations)

---

## Introduction

AI agents represent a paradigm shift from traditional deterministic automation to autonomous systems capable of reasoning, planning, and executing multi-step tasks. Unlike simple chatbots or single-turn LLM applications, agents leverage language models to manage workflow execution, make decisions, and interact with external tools on behalf of users.

### When to Build an Agent

Build agents for workflows where **traditional deterministic approaches fall short**:

- Complex decision-making with ambiguous situations
- Multi-step tasks requiring reasoning and tool use
- Heavy reliance on unstructured data
- Scenarios requiring nuanced judgment
- Tasks with non-fixed execution paths

### Agent Core Loop

All agentic workflows follow this fundamental pattern:

```
Understand Goal → Decide Next Step → Use Tools → Check Results → Repeat or Escalate
```

---

## Core Design Principles

### 1. Fail-Safe Design Over Speed

Design agents with safety and reliability as primary concerns. Narrow scopes ensure consistent performance.

### 2. Single-Responsibility Goals

Create agents with focused, well-defined purposes rather than broad "do-everything" agents. This ensures:
- Predictable behavior
- Easier debugging
- Better observability
- Simpler testing

### 3. Modular Architecture

Combine multiple specialized agents instead of building monolithic systems:

```
┌─────────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                        │
│              (coordination & decision routing)               │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Research     │ │   Analysis    │ │   Action      │
│  Agent        │ │   Agent       │ │   Agent       │
└───────────────┘ └───────────────┘ └───────────────┘
```

### 4. Strategic Error Recovery (Not Blind Retries)

Distinguish between **semantic failures** and **transient failures**:

| Failure Type | Examples | Strategy |
|--------------|----------|----------|
| **Semantic** | Hallucination, wrong tool selection, reasoning errors | Don't retry—validate, refine prompt, or escalate |
| **Transient** | Rate limits, timeouts, network errors | Retry with exponential backoff |

For semantic failures, retrying the same prompt rarely helps. Instead:
- Capture and handle errors within the agent or tool itself
- Implement validation before and after tool calls
- Use fallback mechanisms or model switching
- Add reflection steps to self-correct

For transient failures, use exponential backoff with jitter (see [Error Handling](#error-handling--recovery)).

### 5. Minimal Freedom Principle

> "Give the system the smallest amount of freedom that still delivers the outcome."

Focus effort on tool design, safety, and observability rather than expanding agent autonomy.

---

## Architecture Patterns

### Single-Agent Workflows

One autonomous agent handles complete tasks with centralized control. Best for:
- Focused domain tasks
- Simple to moderate complexity
- Clear success criteria

### Supervisor-Worker Pattern

A lead agent coordinates specialized subagents:

```
┌──────────────────────────────────────────┐
│            Supervisor Agent              │
│   - Decomposes complex queries           │
│   - Spawns worker agents                 │
│   - Monitors progress in real-time       │
└─────────────────────┬────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│Worker 1 │     │Worker 2 │     │Worker 3 │
└─────────┘     └─────────┘     └─────────┘
```

**Characteristics:**
- Significant performance gains through parallel exploration (varies by task complexity)
- Higher token consumption due to coordination overhead (typically 5-20x single-agent baseline)
- Best for complex multi-domain research and open-ended analysis
- Trade-off: Quality improvement vs. cost increase must be evaluated per use case

### Agent-as-Tool Pattern

A central orchestration agent calls specialist agents as tools:

```python
# Conceptual example
orchestrator_tools = [
    research_agent.as_tool(),
    analysis_agent.as_tool(),
    code_agent.as_tool(),
]

orchestrator = Agent(
    name="Orchestrator",
    tools=orchestrator_tools,
    instructions="Coordinate specialists to complete complex tasks"
)
```

**Benefits:**
- Maintains global view of complex tasks
- Transparent and auditable
- Supports parallel execution
- Deep specialization per agent

### Handoff Pattern

Agents transfer control to each other mid-problem:

```
User Query → Agent A → [handoff] → Agent B → [handoff] → Agent C → Response
```

Best for open-ended workflows with domain transitions.

> **Critical Insight**: "Reliability lives and dies in the handoffs." Most agent failures are orchestration and context-transfer issues, not individual agent failures.

#### Handoff Reliability Requirements

**1. Structured Handoff Schema** (not free-form prose):
```typescript
interface HandoffMessage {
  source_agent: string;
  target_agent: string;
  reason: string;                    // Why the handoff is occurring
  context_summary: string;           // Compressed relevant context
  conversation_history: Message[];   // Full or summarized history
  task_state: {
    completed_steps: string[];
    pending_steps: string[];
    artifacts: Record<string, any>;  // Files, data, intermediate results
  };
  confidence_score: number;          // 0-1 confidence in handoff decision
  metadata: {
    timestamp: string;
    handoff_id: string;
    attempt_number: number;
  };
}
```

**2. Capability-Based Routing**:
```python
def select_target_agent(task: Task, available_agents: list) -> Agent:
    """Route based on capability match, not just agent name."""
    scores = []
    for agent in available_agents:
        capability_match = compute_capability_overlap(task.requirements, agent.capabilities)
        load_factor = agent.current_load / agent.max_capacity
        confidence = capability_match * (1 - load_factor * 0.3)
        scores.append((agent, confidence))
    
    best_agent, confidence = max(scores, key=lambda x: x[1])
    
    if confidence < CONFIDENCE_THRESHOLD:
        return escalate_to_human()  # Graceful fallback
    
    return best_agent
```

**3. Handoff Validation**:
```python
def validate_handoff(handoff: HandoffMessage) -> bool:
    """Validate handoff before execution."""
    checks = [
        len(handoff.context_summary) > 0,           # Context preserved
        handoff.target_agent in REGISTERED_AGENTS,  # Valid target
        handoff.confidence_score >= MIN_CONFIDENCE, # Sufficient confidence
        validate_schema(handoff.task_state),        # Valid state
    ]
    return all(checks)
```

**4. Metrics to Track**:
- Handoff success rate (successful transfers / total attempts)
- Context preservation score (relevant info retained)
- Round-trip time (handoff latency)
- Fallback activation rate

### Swarm Pattern

Decentralized coordination where agents delegate tasks through tool calls while sharing message context. Unlike supervisor patterns, swarms enable **localized decision-making** without central orchestration.

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Message Context                    │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
         ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
         │  Agent A  │◄─┤  Agent B  │◄─┤  Agent C  │
         │           ├──►           ├──►           │
         └───────────┘  └───────────┘  └───────────┘
              HandoffMessage signals enable delegation
```

**Implementation** (AutoGen-style):
```python
from autogen import Agent, HandoffMessage

agent_a = Agent(
    name="researcher",
    handoffs=["writer", "analyst"],  # Agents it can delegate to
)

agent_b = Agent(
    name="writer",
    handoffs=["researcher", "reviewer"],
)

# Agents use HandoffMessage to signal delegation
# Shared context flows automatically between agents
```

**When to use**: Parallel exploration, dynamic task allocation, when centralized oversight adds unnecessary bottlenecks.

### Hierarchical Event-Driven Pattern

Agents organized in supervisor→worker levels coordinated through events:

```
Level 0: Strategic Agent (publishes high-level directives)
    ↓ events
Level 1: Tactical Agents (decompose and distribute)
    ↓ events
Level 2: Operational Agents (execute and report status upward)
```

Benefits: Resilient orchestration, clear separation of concerns, hierarchical oversight. Best for enterprise systems requiring audit trails and approval chains.

---

## Framework Selection

### Framework Comparison Matrix

| Framework | Best For | Learning Curve | Production Ready | Vendor Lock-in |
|-----------|----------|----------------|------------------|----------------|
| **LangChain/LangGraph** | Enterprise multi-step workflows, complex state | Steep | Yes | Low (multi-LLM) |
| **OpenAI Agents SDK** | Minimal abstraction, rapid deployment | Low | Yes | High (OpenAI only) |
| **Pydantic AI** | Type-safe development, validation-first | Low | Yes | Low |
| **DSPy** | Programmatic prompt optimization, research | Moderate | Experimental | Low |
| **CrewAI** | Rapid prototyping, role-based agents | Easy | Moderate | Low |
| **AutoGen** | Multi-agent conversations, swarms | Moderate | Moderate | Low |
| **Semantic Kernel** | Microsoft ecosystem, enterprise .NET/Python | Moderate | Yes | Medium (Azure) |
| **Mastra** | TypeScript-first orchestration | Low | Yes | Low |
| **LlamaIndex Agents** | RAG-centric workflows | Moderate | Yes | Low |

### Selection Criteria

Choose based on your priorities:

1. **Rapid prototyping vs. production operations**
2. **Visual builders vs. code-first approaches**
3. **Single vs. multi-agent needs**
4. **Cloud-managed vs. self-hosted deployment**
5. **Language preference (Python vs. TypeScript)**

### LangGraph (Recommended for Complex Workflows)

LangGraph 1.0 provides:
- Graph-based stateful workflows
- Node caching for performance
- Pre/post hooks for control flow
- State persistence across conversation turns
- Human-in-the-loop interrupts
- Time travel debugging
- Enterprise observability via LangSmith

### OpenAI Agents SDK (Recommended for Minimal Abstraction)

Lightweight, production-ready framework with:
- Built-in primitives for agents, handoffs, and guardrails
- Tracing and evaluation capabilities
- TypeScript and Python support
- MCP server integration

---

## Project Structure

### TypeScript Project (Mastra/OpenAI SDK)

```
src/
├── agents/
│   ├── orchestrator.ts
│   ├── research-agent.ts
│   └── action-agent.ts
├── tools/
│   ├── web-search.ts
│   ├── database.ts
│   └── api-client.ts
├── workflows/
│   ├── customer-support.ts
│   └── data-analysis.ts
├── prompts/
│   └── system-prompts.ts
├── scorers/                 # Optional: evaluation
│   └── accuracy-scorer.ts
├── mcp/                     # Optional: MCP servers
│   └── custom-server.ts
└── index.ts
```

### Python Project (LangGraph/LangChain)

```
src/
├── agents/
│   ├── __init__.py
│   ├── base.py
│   ├── orchestrator.py
│   └── specialists/
│       ├── research.py
│       └── analysis.py
├── tools/
│   ├── __init__.py
│   ├── search.py
│   └── database.py
├── graphs/
│   ├── __init__.py
│   └── main_workflow.py
├── memory/
│   ├── __init__.py
│   └── persistence.py
├── prompts/
│   └── templates.py
├── config/
│   └── settings.py
└── tests/
    ├── test_agents.py
    └── test_tools.py
```

### Prompt Version Control

Treat prompts as code with versioning, testing, and rollback capabilities:

```
prompts/
├── schemas/
│   └── prompt-schema.json   # Validation schema
├── globals.json             # Shared variables
└── agents/
    └── customer-support/
        ├── v1/
        │   ├── system.md    # System prompt (Markdown/Jinja2)
        │   ├── variables.json
        │   └── metadata.json  # Version info, rollback config
        ├── v2/
        │   └── ...
        └── active.json      # Points to active version
```

**Best Practices:**
- Use Git for prompt version control
- Tag releases with semantic versioning
- Include rollback configuration
- Run regression tests before promoting versions
- Track A/B test results per version

---

## Tool & Function Calling

### Core Concept

Function calling bridges natural language understanding with programmatic execution, transforming models from conversational interfaces into actionable systems.

### Tool Schema Design

```typescript
// Well-designed tool schema
const searchTool = {
  name: "web_search",
  description: "Search the web for current information. Use when user asks about recent events or needs real-time data.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query. Be specific and include relevant keywords."
      },
      num_results: {
        type: "integer",
        description: "Number of results to return (1-10)",
        default: 5
      }
    },
    required: ["query"]
  }
};
```

### Tool Categories

1. **Custom Functions**: Application-specific logic
2. **Managed Tools**: Code Interpreter, WebSearch (platform-provided)
3. **External MCP Servers**: Third-party integrations
4. **Agent-as-Tool**: Other agents callable as tools

### Execution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent (LLM)                              │
│   1. Receives user query                                    │
│   2. Searches tool registry for relevant tools              │
│   3. Selects tool and constructs arguments                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Tool Execution Layer                       │
│   - Validates parameters                                    │
│   - Executes function                                       │
│   - Handles errors and retries                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Agent (LLM)                              │
│   - Receives tool results                                   │
│   - Generates response or calls next tool                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Memory & State Management

### Memory Types (Cognitive Architecture)

Modern AI agents use a cognitive memory model with four distinct types:

| Type | Purpose | Persistence | Storage | Example |
|------|---------|-------------|---------|---------|
| **Working Memory** | Active manipulation of current task | Request | Context window | Current reasoning chain, tool results |
| **Episodic Memory** | Records of past experiences | Long-term | Vector DB | Conversation summaries, few-shot examples |
| **Semantic Memory** | Facts and knowledge | Long-term | DB/Vector | User preferences, knowledge triplets |
| **Procedural Memory** | System behavior patterns | Permanent | Prompts/Code | Personality, response style, tool usage patterns |

> **2025 Research Insight**: Episodic memory is identified as "the missing piece for long-term LLM agents." Effective systems explicitly integrate experience records for better task continuity.

### Memory Formation Policy

Define clear policies for memory management:

```python
class MemoryPolicy:
    """Define what to learn, when, and where to store."""
    
    # What content types to capture
    content_types = [
        "user_preferences",      # Extract and store
        "task_outcomes",         # Success/failure patterns
        "correction_events",     # When user corrects agent
        "tool_usage_patterns",   # Which tools work for which tasks
    ]
    
    # When to form memories
    formation_triggers = [
        "explicit_user_request",    # "Remember that I prefer..."
        "task_completion",          # After successful task
        "conversation_end",         # Summarize session
        "significant_interaction",  # High-value exchanges
    ]
    
    # Consolidation: when to promote working → long-term
    consolidation_rules = {
        "repeated_access": 3,       # Accessed 3+ times
        "explicit_importance": True, # User marked important
        "task_success_correlation": 0.8,  # High success rate
    }
```

### Hybrid Storage Architecture

```python
# LangGraph Composite Backend Pattern
storage = CompositeBackend({
    # Transient data stays in memory
    "default": InMemoryBackend(),
    
    # Persistent paths route to database
    "/memories/": PostgresBackend(connection_string),
    "/user_preferences/": PostgresBackend(connection_string),
})
```

### State Persistence Patterns

**1. Checkpointing**
```python
# Save state at critical points
@graph.node
def critical_operation(state):
    result = perform_operation(state)
    checkpoint_state(state)  # Persist for recovery
    return result
```

**2. Semantic Caching**
- Cache previous queries and results
- Use vector similarity for cache lookup
- Significant latency and cost reduction for repeated/similar queries (effectiveness varies by query distribution)

**3. Memory Pruning**
```python
def prune_memory(memories: list, max_age_days: int = 30):
    cutoff = datetime.now() - timedelta(days=max_age_days)
    return [m for m in memories if m.timestamp > cutoff]
```

### Best Practices

1. Use descriptive memory paths (`/memories/user_context/` not `/m/`)
2. Document memory structures clearly
3. Implement data pruning for old entries
4. Choose storage backends based on access patterns
5. Balance context window management with token costs

---

## Human-in-the-Loop Patterns

### Approval Pattern

Request human approval for sensitive actions before execution:

```typescript
const sensitiveTools = [
  {
    name: "send_email",
    needsApproval: true,  // Always require approval
    // ...
  },
  {
    name: "database_write",
    needsApproval: async (params) => {
      // Conditional approval based on parameters
      return params.table === "production";
    },
    // ...
  }
];
```

### Interrupt Flow

```
Agent decides to execute tool
         │
         ▼
┌─────────────────────┐
│ Needs approval?     │──No──► Execute immediately
└─────────────────────┘
         │ Yes
         ▼
┌─────────────────────┐
│ Pause execution     │
│ Return interruption │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Human reviews       │
│ Approve/Reject      │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Resume with updated │
│ state               │
└─────────────────────┘
```

### Implementation Rules

1. Interrupt calls should NOT be wrapped in try/except
2. Maintain order of interrupts
3. Cannot return complex values from interrupts
4. Side effects before interrupts MUST be idempotent

### Use Cases

- Approve or reject tool calls
- Review and edit agent state before proceeding
- Validate human input during execution
- Confirm high-risk operations (payments, deletions)

---

## Guardrails & Safety

### Guardrail Types

| Type | Purpose | Implementation |
|------|---------|----------------|
| **Technical** | Real-time structured validation | Filters, validators, formatters |
| **Ethical** | Fairness, bias reduction | Policy checks, content filters |
| **Operational** | Regulatory compliance | Logging, access control, audit trails |

### Input/Output Guardrails

```python
# Input guardrails - prevent inappropriate content before LLM
@input_guardrail
def validate_input(user_message: str) -> str:
    if contains_pii(user_message):
        raise GuardrailViolation("PII detected in input")
    if is_jailbreak_attempt(user_message):
        raise GuardrailViolation("Potential jailbreak attempt")
    return sanitize(user_message)

# Output guardrails - validate before returning to user
@output_guardrail
def validate_output(response: str) -> str:
    if contains_harmful_content(response):
        return "I cannot provide that information."
    return response
```

### Defense Against Attacks

Protect against:
- **Prompt injection**: Validate and sanitize all inputs
- **Character obfuscation**: Normalize unicode characters
- **Multi-step attacks**: Track conversation patterns
- **Jailbreaks**: Layered safeguards with custom validators

### Implementation Architecture

```
User Input
    │
    ▼
┌─────────────────────┐
│   Input Guardrails  │ ← PII detection, injection prevention
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Agent (LLM)       │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Output Guardrails  │ ← Content validation, format checking
└─────────────────────┘
    │
    ▼
User Response
```

### Tooling Ecosystem (2025)

| Framework | Provider | Key Features |
|-----------|----------|--------------|
| **LlamaFirewall** | Meta | PromptGuard 2 (jailbreak detection), Agent Alignment Checks (CoT auditor), CodeShield |
| **Guardrails AI** | Open Source | Validation framework, structured output enforcement |
| **NeMo Guardrails** | NVIDIA | Dialog safety, topical rails, programmable guardrails |
| **AWS Bedrock Guardrails** | AWS | Managed service, content filters, PII redaction |
| **Azure AI Content Safety** | Microsoft | Multi-modal content filtering, prompt shields |

### Agent Alignment Checks

Beyond input/output filtering, monitor agent **reasoning** for goal misalignment:

```python
class AgentAlignmentChecker:
    """Inspect chain-of-thought for misalignment signals."""
    
    def check_reasoning(self, thought_chain: list[str]) -> AlignmentResult:
        signals = []
        
        for thought in thought_chain:
            # Check for goal drift
            if self.detects_goal_deviation(thought):
                signals.append(("goal_drift", thought))
            
            # Check for prompt injection indicators
            if self.detects_injection_response(thought):
                signals.append(("injection_response", thought))
            
            # Check for unauthorized capability usage
            if self.detects_capability_escalation(thought):
                signals.append(("capability_escalation", thought))
        
        return AlignmentResult(
            aligned=len(signals) == 0,
            signals=signals,
            recommendation="halt" if signals else "continue"
        )
```

### Systems-Level Security Approach

> **2025 Best Practice**: Model hardening alone is insufficient. Apply security defenses across multiple layers of abstraction.

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│   Rate limiting, user authentication, audit logging          │
├─────────────────────────────────────────────────────────────┤
│                    Orchestration Layer                       │
│   Agent alignment checks, handoff validation, tool ACLs      │
├─────────────────────────────────────────────────────────────┤
│                    Model Layer                               │
│   Input/output guardrails, content filters, PII detection    │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│   Network isolation, secrets management, encrypted storage   │
└─────────────────────────────────────────────────────────────┘
```

---

## Security & Compliance

### API Key & Secrets Management

```python
# ❌ Bad: Hardcoded or environment variables in code
api_key = "sk-abc123..."
api_key = os.environ["OPENAI_API_KEY"]  # Better, but still risky

# ✅ Good: Secrets manager with rotation support
from cloud_secrets import SecretManager

secrets = SecretManager(
    backend="aws-secrets-manager",  # or "hashicorp-vault", "gcp-secret-manager"
    rotation_policy="90_days",
)

api_key = secrets.get("openai-api-key")
```

**Best Practices:**
- Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager)
- Implement automatic key rotation
- Never log or expose keys in error messages
- Use separate keys for development, staging, and production
- Implement key usage monitoring and anomaly detection

### Least Privilege for Tools

Grant agents only the permissions they need:

```python
class ToolPermissions:
    """Define granular permissions for each tool."""
    
    TOOL_PERMISSIONS = {
        "file_read": {
            "allowed_paths": ["/data/public/", "/tmp/"],
            "denied_paths": ["/etc/", "/root/", "~/.ssh/"],
            "max_file_size_mb": 10,
        },
        "database_query": {
            "allowed_operations": ["SELECT"],
            "denied_operations": ["DROP", "DELETE", "TRUNCATE", "ALTER"],
            "allowed_tables": ["products", "public_users"],
            "row_limit": 1000,
        },
        "api_call": {
            "allowed_domains": ["api.company.com", "public-api.service.com"],
            "denied_domains": ["*"],  # Deny all others
            "rate_limit_per_minute": 60,
        },
    }
    
    def check_permission(self, tool: str, action: dict) -> bool:
        perms = self.TOOL_PERMISSIONS.get(tool)
        if not perms:
            return False  # Deny by default
        return self.validate_action(action, perms)
```

### Agent-to-Agent Authentication

When agents communicate, verify identity and authorization:

```python
import jwt
from datetime import datetime, timedelta

class AgentAuthenticator:
    """Authenticate agent-to-agent communication."""
    
    def generate_agent_token(self, agent_id: str, capabilities: list) -> str:
        payload = {
            "agent_id": agent_id,
            "capabilities": capabilities,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=15),
            "iss": "agent-orchestrator",
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")
    
    def verify_agent_request(self, token: str, required_capability: str) -> bool:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return required_capability in payload["capabilities"]
        except jwt.ExpiredSignatureError:
            return False
        except jwt.InvalidTokenError:
            return False
```

### Audit Logging

Maintain comprehensive logs for compliance and debugging:

```python
import structlog
from datetime import datetime

logger = structlog.get_logger()

class AuditLogger:
    """Structured audit logging for agent actions."""
    
    def log_agent_action(
        self,
        agent_id: str,
        action: str,
        tool: str,
        input_data: dict,
        output_data: dict,
        user_id: str | None = None,
        success: bool = True,
    ):
        # Sanitize PII before logging
        sanitized_input = self.redact_pii(input_data)
        sanitized_output = self.redact_pii(output_data)
        
        logger.info(
            "agent_action",
            timestamp=datetime.utcnow().isoformat(),
            agent_id=agent_id,
            action=action,
            tool=tool,
            input_hash=self.hash_data(input_data),  # Hash for correlation
            input_preview=sanitized_input,
            output_preview=sanitized_output,
            user_id=user_id,
            success=success,
            # Compliance fields
            data_classification="internal",
            retention_days=90,
        )
```

### Data Residency & GDPR Compliance

```python
class DataResidencyManager:
    """Ensure data stays in appropriate regions."""
    
    REGION_CONSTRAINTS = {
        "eu_users": {
            "allowed_regions": ["eu-west-1", "eu-central-1"],
            "model_providers": ["azure-eu", "anthropic-eu"],
            "storage_backends": ["s3-eu", "gcs-eu"],
        },
        "us_users": {
            "allowed_regions": ["us-east-1", "us-west-2"],
            "model_providers": ["openai", "anthropic", "azure-us"],
            "storage_backends": ["s3-us"],
        },
    }
    
    def get_compliant_config(self, user_region: str) -> dict:
        """Return configuration that satisfies data residency requirements."""
        constraints = self.REGION_CONSTRAINTS.get(user_region)
        if not constraints:
            raise ComplianceError(f"No policy for region: {user_region}")
        
        return {
            "model_endpoint": self.select_regional_model(constraints),
            "memory_backend": self.select_regional_storage(constraints),
            "vector_db": self.select_regional_vector_db(constraints),
        }
```

### PII Handling in Memory Systems

```python
class PIIAwareMemory:
    """Memory system with PII detection and handling."""
    
    def store_memory(self, content: str, metadata: dict) -> str:
        # Detect PII before storage
        pii_detected = self.detect_pii(content)
        
        if pii_detected:
            # Option 1: Redact PII
            content = self.redact_pii(content)
            metadata["pii_redacted"] = True
            
            # Option 2: Encrypt PII sections
            # content = self.encrypt_pii_sections(content)
            # metadata["pii_encrypted"] = True
            
            # Option 3: Store in separate secure storage
            # pii_ref = self.secure_pii_storage.store(pii_detected)
            # metadata["pii_reference"] = pii_ref
        
        return self.memory_backend.store(content, metadata)
    
    def detect_pii(self, text: str) -> list[PIIEntity]:
        """Detect PII using pattern matching and NER."""
        entities = []
        
        # Pattern-based detection
        patterns = {
            "email": r'\b[\w.-]+@[\w.-]+\.\w+\b',
            "phone": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
            "credit_card": r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
        }
        
        for pii_type, pattern in patterns.items():
            matches = re.findall(pattern, text)
            entities.extend([PIIEntity(type=pii_type, value=m) for m in matches])
        
        return entities
```

### Rate Limiting & Abuse Prevention

```python
from collections import defaultdict
import time

class RateLimiter:
    """Multi-tier rate limiting for agent requests."""
    
    def __init__(self):
        self.request_counts = defaultdict(list)
        
        self.limits = {
            "per_user_per_minute": 30,
            "per_user_per_hour": 500,
            "per_agent_per_minute": 100,
            "global_per_minute": 10000,
        }
    
    def check_rate_limit(self, user_id: str, agent_id: str) -> bool:
        now = time.time()
        
        # Clean old entries
        self._cleanup_old_entries(now)
        
        # Check all applicable limits
        checks = [
            self._check_limit(f"user:{user_id}", now, 60, self.limits["per_user_per_minute"]),
            self._check_limit(f"user:{user_id}", now, 3600, self.limits["per_user_per_hour"]),
            self._check_limit(f"agent:{agent_id}", now, 60, self.limits["per_agent_per_minute"]),
            self._check_limit("global", now, 60, self.limits["global_per_minute"]),
        ]
        
        if all(checks):
            # Record this request
            self._record_request(user_id, agent_id, now)
            return True
        
        return False
```

---

## Prompt Engineering for Agents

### System Prompt Structure for Agents

Include three critical components:

```markdown
## Agent Identity and Role
You are a customer support specialist agent for [Company].

## Persistence Reminder (Critical)
Continue working through multi-step tasks until completely resolved.
Do not yield control back to the user until the task is finished.

## Tool-Calling Instruction (Critical)
Always use available tools to gather information rather than guessing.
Never hallucinate data - if you don't have information, use tools to find it.

## Planning Reminder (Optional)
Before each action, briefly plan your approach:
1. What do I need to accomplish?
2. What tools are available?
3. What's the most efficient path?
```

### Best Practices

**1. Be Specific and Structured**
```markdown
❌ "Help the user with their questions"

✅ "You are a technical support agent. For each user issue:
1. Identify the product and issue category
2. Search the knowledge base for solutions
3. If no solution found, escalate to human support
4. Always confirm resolution with the user"
```

**2. Use Examples (Few-Shot)**
```markdown
## Example Interactions

User: "My order hasn't arrived"
Agent: [Uses order_lookup tool with user_id]
Agent: "I found your order #12345. It's currently in transit and expected to arrive by [date]. Would you like tracking details?"
```

**3. Define Output Format**
```markdown
## Response Format
Always structure responses as:
- **Summary**: One-line overview
- **Details**: Relevant information
- **Next Steps**: Clear actions for the user
```

**4. Iterate and Evaluate**
- Start with zero-shot, add examples if needed
- Build evaluations to validate prompt changes
- Test against edge cases systematically

### Agent-Specific Prompt Patterns

#### ReAct (Reasoning + Acting)

The industry-standard pattern for tool-using agents:

```markdown
## ReAct Format

For each step, use this format:
Thought: [Your reasoning about what to do next]
Action: [The tool to use]
Action Input: [The input to the tool]
Observation: [The result from the tool]

Continue until you can provide a final answer:
Thought: I now have enough information to answer.
Final Answer: [Your response to the user]
```

#### Self-Reflection Prompting

Enable agents to critique and improve their own outputs:

```markdown
## Self-Reflection Instructions

After generating a response, evaluate it:
1. **Accuracy Check**: Is all information factual and verifiable?
2. **Completeness Check**: Does it fully address the user's request?
3. **Safety Check**: Could this response cause harm?
4. **Quality Check**: Is it clear, concise, and well-structured?

If any check fails, revise your response before returning it.
```

#### Structured Output Prompting

Ensure consistent, parseable responses:

```markdown
## Output Format

Always respond with valid JSON matching this schema:
{
  "status": "success" | "error" | "needs_clarification",
  "reasoning": "Brief explanation of your approach",
  "result": { ... task-specific output ... },
  "confidence": 0.0-1.0,
  "follow_up_questions": ["optional clarifying questions"]
}
```

#### Chain-of-Thought for Complex Reasoning

```markdown
## Complex Task Instructions

For multi-step problems:
1. Break down the problem into sub-tasks
2. Solve each sub-task, showing your work
3. Combine results into a final answer
4. Verify your answer makes sense

Think step-by-step. Show your reasoning explicitly.
```

---

## RAG Integration

### Agentic RAG Architecture

Move beyond static RAG pipelines to dynamic, adaptive retrieval:

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent (Orchestrator)                     │
│   - Determines retrieval strategy                           │
│   - Selects data sources dynamically                        │
│   - Refines queries based on results                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    ▼                     ▼                     ▼
┌─────────┐         ┌─────────┐         ┌─────────┐
│Vector DB│         │  APIs   │         │Knowledge│
│ Search  │         │         │         │  Graph  │
└─────────┘         └─────────┘         └─────────┘
```

### Design Patterns

**1. Reflection Pattern**
Agents iteratively self-critique and refine outputs:
```
Query → Retrieve → Generate → Validate → (Refine if needed) → Response
```

**2. Planning Pattern**
Complex tasks decomposed into structured subtasks:
```
Complex Query → Decompose → Sub-queries → Parallel Retrieval → Synthesize
```

**3. Tool Use Pattern**
Agents dynamically select retrieval tools:
```python
retrieval_tools = [
    vector_search_tool,      # For semantic queries
    keyword_search_tool,     # For exact matches
    api_search_tool,         # For real-time data
    graph_query_tool,        # For relationship queries
]
```

### Advantages Over Static RAG

| Static RAG | Agentic RAG |
|------------|-------------|
| Fixed retrieval pipeline | Dynamic retrieval strategy |
| Single data source | Multiple source orchestration |
| One-shot retrieval | Iterative refinement |
| No query adaptation | Query rewriting and expansion |
| Limited reasoning | Multi-step reasoning |

### Advanced RAG Patterns (2025)

#### GraphRAG

Combines knowledge graphs with retrieval for multi-hop reasoning:

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphRAG Pipeline                         │
├─────────────────────────────────────────────────────────────┤
│  1. Knowledge Graph Extraction                               │
│     Documents → Entity/Relationship extraction → Graph       │
├─────────────────────────────────────────────────────────────┤
│  2. Community Detection (Leiden Algorithm)                   │
│     Graph → Hierarchical clusters → Community summaries      │
├─────────────────────────────────────────────────────────────┤
│  3. Query Processing                                         │
│     Query → Graph traversal + Vector search → Context        │
├─────────────────────────────────────────────────────────────┤
│  4. Response Generation                                      │
│     Context + Community summaries → LLM → Response           │
└─────────────────────────────────────────────────────────────┘
```

**When to use**: Multi-hop reasoning, "holistic understanding" queries, document collections with rich entity relationships.

#### Hybrid Search

Combine keyword (BM25) and semantic (vector) search:

```python
def hybrid_search(query: str, alpha: float = 0.5) -> list[Document]:
    """
    Alpha controls balance: 0 = pure keyword, 1 = pure semantic
    """
    keyword_results = bm25_search(query)
    semantic_results = vector_search(embed(query))
    
    # Reciprocal Rank Fusion
    combined = reciprocal_rank_fusion(
        keyword_results, 
        semantic_results,
        weights=[1 - alpha, alpha]
    )
    
    return combined[:top_k]
```

#### Corrective RAG (CRAG)

Self-correction mechanism for retrieved content:

```python
def corrective_rag(query: str, documents: list) -> str:
    # Grade retrieved documents
    relevance_scores = [grade_relevance(query, doc) for doc in documents]
    
    if all(score < RELEVANCE_THRESHOLD for score in relevance_scores):
        # All documents irrelevant → web search fallback
        documents = web_search(query)
    elif any(score < RELEVANCE_THRESHOLD for score in relevance_scores):
        # Mixed relevance → filter + augment
        documents = [d for d, s in zip(documents, relevance_scores) 
                     if s >= RELEVANCE_THRESHOLD]
        documents += web_search(query)[:2]  # Augment with web
    
    # Knowledge refinement
    refined_context = extract_key_information(documents)
    
    return generate_response(query, refined_context)
```

#### Reranking

Cross-encoder reranking for precision improvement:

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def retrieve_and_rerank(query: str, top_k: int = 5) -> list[Document]:
    # Initial retrieval (fast, recall-focused)
    candidates = vector_search(query, top_k=50)
    
    # Reranking (slower, precision-focused)
    pairs = [(query, doc.content) for doc in candidates]
    scores = reranker.predict(pairs)
    
    # Sort by reranker scores
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    
    return [doc for doc, score in ranked[:top_k]]
```

---

## Multi-Agent Orchestration

### When to Use Multi-Agent Systems

| Pattern | Use Case | Trade-offs |
|---------|----------|------------|
| **Supervisor-Worker** | Complex multi-domain research | High accuracy, 15x token usage |
| **Event-Driven Hierarchical** | Multi-level coordination | Resilient, more complex setup |
| **Swarm** | Parallel exploration | Fast, higher resource usage |
| **Pipeline** | Sequential processing | Predictable, less flexible |

### Implementation with LangGraph

```python
from langgraph.graph import StateGraph, END

# Define state
class AgentState(TypedDict):
    messages: list
    current_agent: str
    task_status: str

# Create graph
workflow = StateGraph(AgentState)

# Add agent nodes
workflow.add_node("supervisor", supervisor_agent)
workflow.add_node("researcher", research_agent)
workflow.add_node("writer", writing_agent)

# Define edges
workflow.add_edge("supervisor", "researcher")
workflow.add_conditional_edges(
    "researcher",
    should_continue,
    {"continue": "writer", "end": END}
)

# Compile
app = workflow.compile()
```

### Communication Patterns

**1. Direct Handoff**
```
Agent A → [state transfer] → Agent B
```

**2. Message Passing**
```
Agent A → [message queue] → Agent B
```

**3. Shared State**
```
Agent A ↔ [shared memory] ↔ Agent B
```

---

## Error Handling & Recovery

### Error Classification

| Type | Examples | Strategy |
|------|----------|----------|
| **Transient** | Rate limits, timeouts, temporary unavailability | Retry with exponential backoff |
| **Permanent** | Invalid credentials, malformed requests | Fail fast, alert, no retry |
| **LLM-Specific** | Context overflow, hallucinations, format failures | Validation, fallbacks |

### Exponential Backoff Implementation

```python
import random
import time

def retry_with_backoff(
    func,
    max_retries: int = 5,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    jitter: float = 0.25
):
    for attempt in range(max_retries):
        try:
            return func()
        except TransientError as e:
            if attempt == max_retries - 1:
                raise
            
            delay = min(base_delay * (2 ** attempt), max_delay)
            jitter_amount = delay * jitter * random.uniform(-1, 1)
            time.sleep(delay + jitter_amount)
```

### Circuit Breaker Pattern

```python
class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60
    ):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = "closed"  # closed, open, half-open
        self.last_failure_time = None
    
    def call(self, func):
        if self.state == "open":
            if self._should_attempt_recovery():
                self.state = "half-open"
            else:
                raise CircuitOpenError()
        
        try:
            result = func()
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
```

### Fallback Mechanisms

```python
# Tiered model fallback
MODEL_FALLBACKS = [
    "claude-sonnet-4.5",     # Primary
    "gpt-4.1",               # Alternative
    "gemini-2.5-flash",      # Simpler/cheaper
    "cached_response",       # From cache
    "default_message",       # Graceful degradation
]

async def call_with_fallback(prompt: str):
    for model in MODEL_FALLBACKS:
        try:
            return await call_model(model, prompt)
        except Exception as e:
            log_fallback(model, e)
            continue
    return DEFAULT_ERROR_MESSAGE
```

### Agentic-Specific Considerations

1. **Idempotency**: Ensure tool calls can be safely retried
2. **Compensating Transactions**: Implement rollback for multi-step operations
3. **State Persistence**: Checkpoint progress for recovery
4. **Saga Pattern**: Manage long-running distributed transactions

---

## Cost Optimization

### Understanding Token Economics

| Model | Input (per 1M) | Output (per 1M) | Use Case |
|-------|----------------|-----------------|----------|
| Claude Sonnet 4.5 | $3.00 | $15.00 | Complex reasoning |
| GPT-4.1 | $2.00 | $8.00 | General purpose |
| Gemini 2.5 Flash | $0.40 | $1.20 | High volume, simpler tasks |

### Cost Optimization Strategies

**1. Context Window Management**
```python
def trim_context(messages: list, max_tokens: int = 8000):
    """Keep only essential context within token budget."""
    total_tokens = 0
    trimmed = []
    
    # Always keep system prompt
    for msg in reversed(messages):
        msg_tokens = count_tokens(msg)
        if total_tokens + msg_tokens > max_tokens:
            break
        trimmed.insert(0, msg)
        total_tokens += msg_tokens
    
    return trimmed
```

**2. Context Compression**
```python
def compress_conversation(messages: list) -> str:
    """Summarize older messages instead of keeping verbatim."""
    recent = messages[-5:]  # Keep recent verbatim
    older = messages[:-5]   # Summarize older
    
    summary = summarize_messages(older)
    return [{"role": "system", "content": f"Previous context: {summary}"}] + recent
```

**3. Model Selection by Task**
```python
def select_model(task_complexity: str) -> str:
    return {
        "simple": "gemini-2.5-flash",      # $0.40/$1.20
        "moderate": "gpt-4.1-mini",        # $0.40/$1.60
        "complex": "claude-sonnet-4.5",    # $3.00/$15.00
    }.get(task_complexity, "gpt-4.1-mini")
```

**4. Prompt Optimization**
- Strip redundant instructions
- Combine related queries
- Remove verbose examples
- Request concise responses (output tokens cost more)

**5. Caching Strategies**
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_embedding(text: str) -> list:
    return generate_embedding(text)

# Semantic cache for similar queries
class SemanticCache:
    def get_similar(self, query: str, threshold: float = 0.95):
        query_embedding = cached_embedding(query)
        for cached_query, response in self.cache.items():
            similarity = cosine_similarity(query_embedding, cached_embedding(cached_query))
            if similarity > threshold:
                return response
        return None
```

---

## Observability & Monitoring

### Key Platforms

| Platform | Type | Best For |
|----------|------|----------|
| **LangSmith** | Managed (LangChain) | LangChain/LangGraph ecosystems, production tracing |
| **Langfuse** | Open-source/Managed | Self-hosted, budget-conscious, full control |
| **AgentOps** | Managed | Agent-specific analytics, session replay |
| **Arize Phoenix** | Open-source | ML platform integration, experimentation |
| **OpenTelemetry** | Standard | Vendor-agnostic, existing observability stack |
| **Helicone** | Managed | Cost tracking, prompt caching analytics |

> **Note**: Overhead varies significantly based on sampling rate, payload size, and network latency. Benchmark in your environment before production deployment.

### Essential Metrics

```python
# Metrics to track
AGENT_METRICS = {
    # Performance
    "latency_p50": "50th percentile response time",
    "latency_p99": "99th percentile response time",
    "throughput": "Requests per second",
    
    # Quality
    "success_rate": "Successful completions / total attempts",
    "hallucination_rate": "Detected hallucinations / responses",
    "tool_call_accuracy": "Correct tool selections / total calls",
    
    # Cost
    "tokens_per_request": "Average tokens consumed",
    "cost_per_request": "Average dollar cost",
    "cache_hit_rate": "Cached responses / total requests",
    
    # Reliability
    "error_rate": "Errors / total requests",
    "fallback_rate": "Fallback activations / total requests",
    "retry_rate": "Retries / total requests",
}
```

### Tracing Implementation

```python
from opentelemetry import trace

tracer = trace.get_tracer("agent-service")

@tracer.start_as_current_span("agent_execution")
async def execute_agent(request):
    span = trace.get_current_span()
    span.set_attribute("agent.name", "customer_support")
    span.set_attribute("user.id", request.user_id)
    
    with tracer.start_span("tool_selection") as tool_span:
        tool = select_tool(request)
        tool_span.set_attribute("tool.name", tool.name)
    
    with tracer.start_span("tool_execution") as exec_span:
        result = await tool.execute(request)
        exec_span.set_attribute("tool.success", result.success)
    
    return result
```

### Dashboard Essentials

1. **Real-time Metrics**: Request rate, latency, error rate
2. **Agent Flow Visualization**: Graph of agent decisions and tool calls
3. **Cost Tracking**: Token usage and spend over time
4. **Quality Indicators**: Success rates, user feedback scores
5. **Alerting**: Anomaly detection for key metrics

---

## Testing & Evaluation

### Evaluation Framework: HAL Approach

The Holistic Agent Leaderboard (HAL) provides standardized evaluation across dimensions:

| Domain | Examples |
|--------|----------|
| Coding | Code generation, debugging, refactoring |
| Web Navigation | Form filling, information extraction |
| Science | Research tasks, data analysis |
| Customer Service | Issue resolution, information lookup |

### Testing Pyramid for Agents

```
           ╱╲
          ╱  ╲         End-to-End Tests
         ╱    ╲        (Full agent workflows)
        ╱──────╲
       ╱        ╲      Integration Tests
      ╱          ╲     (Agent + tools + memory)
     ╱────────────╲
    ╱              ╲   Unit Tests
   ╱                ╲  (Individual tools, prompts)
  ╱──────────────────╲
```

### Unit Testing Tools

```python
import pytest
from unittest.mock import AsyncMock

class TestSearchTool:
    @pytest.fixture
    def mock_api(self):
        return AsyncMock(return_value={"results": [...]})
    
    async def test_search_returns_results(self, mock_api):
        tool = SearchTool(api=mock_api)
        result = await tool.execute(query="test query")
        
        assert result.success
        assert len(result.items) > 0
        mock_api.assert_called_once_with("test query")
    
    async def test_search_handles_empty_results(self, mock_api):
        mock_api.return_value = {"results": []}
        tool = SearchTool(api=mock_api)
        result = await tool.execute(query="nonexistent")
        
        assert result.success
        assert result.items == []
```

### Evaluation Metrics

```python
class AgentEvaluator:
    def evaluate(self, agent, test_cases: list) -> dict:
        metrics = {
            "accuracy": [],
            "latency": [],
            "token_usage": [],
            "tool_calls": [],
        }
        
        for case in test_cases:
            start = time.time()
            result = agent.run(case.input)
            latency = time.time() - start
            
            metrics["accuracy"].append(
                self.score_accuracy(result, case.expected)
            )
            metrics["latency"].append(latency)
            metrics["token_usage"].append(result.token_count)
            metrics["tool_calls"].append(len(result.tool_calls))
        
        return {k: statistics.mean(v) for k, v in metrics.items()}
```

### Key Evaluation Challenges to Address

1. **Non-standardized infrastructure**: Use consistent evaluation harness
2. **Inconsistent cost reporting**: Track and normalize token costs
3. **Agent shortcuts**: Detect gaming of benchmarks
4. **Problematic behaviors**: Monitor for unintended actions
5. **Scaffold comparison**: Test agents with different tooling

### Advanced Testing Strategies

#### Adversarial Testing

Deliberately try to break agents to find vulnerabilities:

```python
class AdversarialTestSuite:
    """Test agent robustness against edge cases and attacks."""
    
    test_categories = {
        "prompt_injection": [
            "Ignore previous instructions and...",
            "```system\nNew instructions:```",
            "Translation: [malicious payload]",
        ],
        "edge_cases": [
            "",                          # Empty input
            "a" * 100000,                # Very long input
            "🔥" * 1000,                 # Unicode stress test
            "{'key': 'value'}",          # JSON in text
        ],
        "ambiguous_requests": [
            "Do that thing we discussed",  # Missing context
            "Fix it",                      # Vague instruction
            "Make it better",              # Subjective goal
        ],
        "conflicting_instructions": [
            "Delete all files but don't delete anything",
            "Send an email but don't contact anyone",
        ],
    }
    
    def run_adversarial_tests(self, agent) -> TestReport:
        results = []
        for category, tests in self.test_categories.items():
            for test_input in tests:
                result = self.run_single_test(agent, test_input, category)
                results.append(result)
        return TestReport(results)
```

#### Behavioral Consistency Testing

Verify that similar inputs produce consistent behavior:

```python
def test_behavioral_consistency(agent, test_cases: list, runs: int = 5):
    """Same input should yield consistent behavior across runs."""
    
    for case in test_cases:
        outputs = [agent.run(case.input) for _ in range(runs)]
        
        # Check structural consistency
        structures = [extract_structure(o) for o in outputs]
        assert len(set(structures)) == 1, f"Inconsistent structure for: {case.input}"
        
        # Check semantic consistency (embeddings should be similar)
        embeddings = [embed(o) for o in outputs]
        similarities = pairwise_similarity(embeddings)
        assert min(similarities) > 0.85, f"Inconsistent semantics for: {case.input}"
```

#### Multi-Turn Conversation Testing

Test behavior across conversation boundaries:

```python
class ConversationTest:
    """Test multi-turn conversation handling."""
    
    def test_context_retention(self, agent):
        """Agent should remember earlier context."""
        agent.send("My name is Alice")
        response = agent.send("What's my name?")
        assert "Alice" in response
    
    def test_reference_resolution(self, agent):
        """Agent should resolve pronouns and references."""
        agent.send("I want to book a flight to Paris")
        agent.send("Actually, make it London instead")
        response = agent.send("Confirm my destination")
        assert "London" in response
        assert "Paris" not in response
    
    def test_graceful_context_overflow(self, agent):
        """Agent should handle context window limits gracefully."""
        # Fill context with many messages
        for i in range(100):
            agent.send(f"Message {i}: " + "x" * 1000)
        
        # Should still function, not crash
        response = agent.send("Are you still working?")
        assert response is not None
```

#### Regression Testing for Prompts

Detect when prompt changes break functionality:

```python
class PromptRegressionSuite:
    """Track prompt changes and their impact."""
    
    def __init__(self, baseline_results: dict):
        self.baseline = baseline_results
    
    def test_prompt_change(self, agent, test_suite: list) -> RegressionReport:
        current_results = self.run_test_suite(agent, test_suite)
        
        regressions = []
        for test_id, baseline_result in self.baseline.items():
            current_result = current_results.get(test_id)
            
            if current_result.score < baseline_result.score * 0.95:  # 5% threshold
                regressions.append(Regression(
                    test_id=test_id,
                    baseline_score=baseline_result.score,
                    current_score=current_result.score,
                    delta=current_result.score - baseline_result.score,
                ))
        
        return RegressionReport(regressions)
```

#### Shadow Mode Testing

Test new agents in production without affecting users:

```python
async def shadow_mode_handler(request, production_agent, shadow_agent):
    """Run shadow agent in parallel, compare results."""
    
    # Production response (returned to user)
    prod_response = await production_agent.run(request)
    
    # Shadow response (logged only, not returned)
    shadow_task = asyncio.create_task(shadow_agent.run(request))
    
    # Don't wait for shadow—return production response immediately
    asyncio.create_task(
        log_shadow_comparison(request, prod_response, shadow_task)
    )
    
    return prod_response
```

---

## Deployment Patterns

### Serverless (Cloud Run, Lambda)

**Best for**: Lightweight agents, event-triggered tasks, variable workloads

```yaml
# Cloud Run deployment
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: agent-service
spec:
  template:
    spec:
      containers:
        - image: gcr.io/project/agent:latest
          resources:
            limits:
              memory: "2Gi"
              cpu: "2"
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: api-keys
                  key: openai
```

**Advantages**:
- Automatic scaling
- Pay-per-use
- Lower operational overhead
- Rapid instance provisioning

### Kubernetes (GKE, EKS)

**Best for**: Complex orchestration, sustained workloads, GPU requirements

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent
  template:
    spec:
      containers:
        - name: agent
          image: agent:latest
          resources:
            requests:
              memory: "4Gi"
              cpu: "2"
              nvidia.com/gpu: "1"
          volumeMounts:
            - name: model-cache
              mountPath: /models
```

**Advantages**:
- Full infrastructure control
- GPU support for self-hosted models
- Complex networking and service mesh
- Persistent storage options

### Decision Matrix

| Factor | Serverless | Kubernetes |
|--------|------------|------------|
| Workload pattern | Sporadic, bursty | Sustained, predictable |
| Complexity | Simple agents | Complex orchestration |
| GPU needs | Limited | Full support |
| Cold start tolerance | Acceptable | Not acceptable |
| Cost model | Pay-per-use | Reserved capacity |
| Operational overhead | Low | Higher |

---

## Reference Implementations

### AWS Guidance for Agentic AI

- **Repository**: `aws-solutions-library-samples/guidance-for-agentic-ai-operational-foundations-on-aws`
- **Coverage**: Agent patterns, LLM workflows, AWS service mappings
- **Best for**: AWS-native deployments

### LangGraph Starter Kit

- **Repository**: `langchain-ai/langgraph-starter-kit`
- **Coverage**: Supervisor/Swarm patterns, memory, HTTP API
- **Best for**: Production LangGraph deployments

### Dapr Agents

- **Documentation**: `docs.dapr.io/developing-ai/dapr-agents/`
- **Coverage**: Distributed systems, durable execution, state management
- **Best for**: Microservices-based agent architectures

### OpenAI Agents SDK

- **Documentation**: `platform.openai.com/docs/guides/agents-sdk`
- **Coverage**: Minimal abstraction, TypeScript/Python, MCP integration
- **Best for**: OpenAI-centric applications

---

## Quick Start Checklist

### Project Setup

- [ ] Choose framework based on requirements (LangGraph, OpenAI SDK, etc.)
- [ ] Set up project structure with separate folders for agents, tools, workflows
- [ ] Configure environment variables and secrets management
- [ ] Set up version control for prompts and configurations

### Core Implementation

- [ ] Define agent responsibilities (single-responsibility principle)
- [ ] Implement tool schemas with clear descriptions
- [ ] Set up memory/state persistence appropriate to use case
- [ ] Implement human-in-the-loop for sensitive operations

### Safety & Quality

- [ ] Add input/output guardrails
- [ ] Implement error handling with fallbacks
- [ ] Set up observability and tracing
- [ ] Create evaluation test suite
- [ ] Implement agent alignment checks

### Security & Compliance

- [ ] Configure secrets management (not env vars)
- [ ] Implement least-privilege tool permissions
- [ ] Set up audit logging
- [ ] Add rate limiting and abuse prevention
- [ ] Address data residency requirements (if applicable)
- [ ] Implement PII detection and handling

### Production Readiness

- [ ] Implement cost controls and monitoring
- [ ] Set up alerting for key metrics
- [ ] Configure deployment pipeline (serverless or K8s)
- [ ] Document agent behaviors and limitations
- [ ] Set up shadow mode for new agent versions
- [ ] Create rollback procedures

---

## Resources

### Official Documentation

- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents-sdk)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Anthropic Claude SDK](https://docs.anthropic.com/en/docs/agents-and-tools)
- [Anthropic MCP Protocol](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-mcp)
- [AWS Agentic AI Patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-patterns/)
- [Microsoft Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/)

### Frameworks

- [LangChain](https://docs.langchain.com/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [CrewAI](https://docs.crewai.com/)
- [AutoGen](https://microsoft.github.io/autogen/)
- [Mastra](https://mastra.ai/docs/)
- [Pydantic AI](https://ai.pydantic.dev/)
- [DSPy](https://dspy-docs.vercel.app/)
- [LlamaIndex Agents](https://docs.llamaindex.ai/en/stable/use_cases/agents/)

### Observability

- [LangSmith](https://www.langchain.com/langsmith)
- [Langfuse](https://langfuse.com/)
- [Arize Phoenix](https://phoenix.arize.com/)
- [Helicone](https://www.helicone.ai/)
- [OpenTelemetry](https://opentelemetry.io/)

### Security

- [LlamaFirewall](https://github.com/meta-llama/PurpleLlama)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Guardrails AI](https://www.guardrailsai.com/)
- [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)

### RAG & Retrieval

- [Microsoft GraphRAG](https://microsoft.github.io/graphrag/)
- [LlamaIndex](https://docs.llamaindex.ai/)
- [Chroma](https://docs.trychroma.com/)
- [Pinecone](https://docs.pinecone.io/)

### Learning Resources

- [OpenAI Practical Guide to Building Agents (PDF)](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
- [Microsoft AI Agents for Beginners](https://microsoft.github.io/ai-agents-for-beginners/)
- [Agentic Design Patterns](https://agentic-design.ai/)
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)
- [OpenAI Cookbook - Agent Orchestration](https://cookbook.openai.com/examples/orchestrating_agents)

---

*Last updated: January 2026*
