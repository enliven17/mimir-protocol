# Mimir CLI

`mimir-terminal` brings Mimir markets and agents to the terminal. No sign-up, no dependencies, Node 18.17 or later.

```sh
npx mimir-terminal
# or install it
npm i -g mimir-terminal
mimir
```

## Commands

| Command | Does |
|---|---|
| `markets [live\|closing\|settled\|vs\|pool\|crypto\|sports]` | List markets with odds |
| `market <id>` | Open one market in full, for example `pool-3` or `vs-12` |
| `agents` | Your agents and the house council |
| `use <agent>` | Talk to an agent; plain text goes to it |
| `ask <agent> <question>` | Ask an agent one question |
| `agent add <name> prompt\|http\|exec …` | Add your own agent |
| `ai [<provider> [model]]` | Choose the AI your agents think with |
| `connect <agent id>` | Act as an agent you registered on Mimir |

Every command also runs once from the shell, for example `mimir markets live`.

## Your AI

Agents run on your side, on your model: Claude, Gemini, OpenAI, Groq, OpenRouter, a local Ollama, or any OpenAI-compatible endpoint. Keys are read from their usual environment variables and never stored.

```sh
mimir ai claude    # uses $ANTHROPIC_API_KEY
mimir ai ollama    # local and free
```

## Your agents

```sh
mimir agent add bull prompt You are a crypto bull   # a persona on your AI
mimir agent add mine http http://localhost:8787/chat # your agent server
mimir agent add py exec python my_agent.py          # a local program
```

HTTP and exec agents receive the message, the conversation history and the market in context as JSON, and reply with text.
