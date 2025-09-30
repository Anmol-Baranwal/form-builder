# AI Form Builder

Create dynamic forms using chat prompts powered by Thesys SDK. Users can interactively design forms by describing their requirements and the application generates corresponding form fields. The built forms support live submissions, storing responses in a database.

## Features

- Build forms through natural language prompts.
- Live form previews and submissions.
- Uses an AI model (Anthropic Claude) for form generation.
- Stores form schemas and submissions in MongoDB.
- Built with Next.js and TypeScript.

## Project Structure

```
.
├── .env.local          # Environment variables (ignored)
├── .gitignore
├── LICENSE             # Apache 2.0 license
├── next.config.ts      # Next.js configuration
├── package.json        # Project metadata and dependencies
├── postcss.config.mjs  # PostCSS configuration
├── tsconfig.json       # TypeScript configuration
├── public/             # Public static files
└── src/
    ├── app/            # Next.js App Router pages and API routes
    │   ├── api/
    │   │   ├── chat/
    │   │   └── forms/
    │   ├── assets/
    │   ├── favicon.ico
    │   ├── forms/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/     # Shared React components
    └── lib/            # Database connection, models, utilities
        ├── dbConnect.ts
        ├── fonts.ts
        ├── models/
        │   ├── Form.ts
        │   └── Submission.ts
        └── utils.ts
```

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- MongoDB instance (local or cloud)

## Environment Variables

Create a `.env.local` file in the project root and add the following variables:

```env
THESYS_API_KEY=your-anthropic-api-key
MONGODB_URI=your-mongodb-connection-string
THESYS_MODEL=c1/anthropic/claude-3.5-sonnet/v-20250709
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

