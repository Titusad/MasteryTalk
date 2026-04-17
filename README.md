# MasteryTalk PRO

**AI-powered executive English communication coaching for LATAM professionals.**

Practice job interviews, remote meetings, and presentations with AI-driven business counterparts that challenge you like real U.S. executives.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 + Vite 6 |
| Backend | Supabase Edge Functions (Deno + Hono) |
| AI Chat | GPT-4o |
| AI Analysis | Gemini 1.5 Flash |
| TTS | ElevenLabs + Azure Neural |
| STT | Azure Speech REST API |
| Payments | Stripe |
| Hosting | Vercel (frontend) + Supabase (backend) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Fill in your Supabase and API credentials

# Run development server
pnpm run dev
```

## Project Structure

```
├── .agent/          # AI agent configuration (Antigravity Kit)
├── docs/            # Product documentation
│   ├── PRODUCT_SPEC.md    # Product specification (source of truth)
│   ├── ROADMAP.md         # Development roadmap
│   ├── DESIGN_SYSTEM.md   # Visual design rules
│   └── SYSTEM_PROMPTS.md  # AI prompt engineering
├── src/             # Frontend source code (FSD architecture)
│   ├── app/         # App coordination, routing
│   ├── pages/       # Full pages
│   ├── widgets/     # Composed UI blocks
│   ├── features/    # Business logic
│   ├── entities/    # Domain types
│   ├── shared/      # Shared UI, utilities
│   └── services/    # Service adapters
├── supabase/        # Edge Functions (backend)
├── CONTRIBUTING.md  # Working rules & conventions
└── guidelines/      # Quick design reference
```

## Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How we work (start here)
- **[Product Spec](docs/PRODUCT_SPEC.md)** — What the product is
- **[Roadmap](docs/ROADMAP.md)** — What to build next
- **[Design System](docs/DESIGN_SYSTEM.md)** — How it looks
- **[System Prompts](docs/SYSTEM_PROMPTS.md)** — How the AI thinks

## License

Proprietary. All rights reserved.
