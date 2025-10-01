# AI Form Builder

Create dynamic forms using natural language powered by [Next.js](https://nextjs.org/) and [Thesys](https://thesys.dev/). You can interactively design forms by describing your requirements and the application generates corresponding form fields. Submissions are stored in MongoDB and each form has its own listing and response pages.

## Project Structure

```
.
├── .env.example              
├── .gitignore
├── LICENSE                   
├── next.config.ts            
├── package.json              
├── postcss.config.mjs        
├── tsconfig.json             
├── public/                   
└── src/
    ├── app/                  # Next.js App Router
    │   ├── api/              # Serverless API routes
    │   │   ├── chat/route.ts # Chat endpoint
    │   │   └── forms/        # Form CRUD + submissions
    │   │       ├── [id]/     # Form-specific endpoints
    │   │       │   ├── submissions/
    │   │       │   │   ├── [submissionId]/
    │   │       │   │   │   └── route.ts   # Delete submission of a form
    │   │       │   │   └── route.ts       # GET form submissions
    │   │       ├── create/route.ts        # Create new form
    │   │       ├── delete/route.ts        # Delete form by ID
    │   │       ├── get/route.ts           # Get form by ID
    │   │       ├── list/route.ts          # List all forms
    │   │       └── submit/route.ts        # Handle form submission
    │   │
    │   ├── assets/            # Local fonts
    │   ├── forms/             
    │   │   ├── [id]/          # Dynamic form route
    │   │   │   ├── submissions/
    │   │   │   │   └── page.tsx  # Show all submissions for a form
    │   │   │   └── page.tsx      # Show a single form (renders via C1Component)
    │   │   └── page.tsx          # All forms listing page
    │   │
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx              
    │
    ├── components/               
    │
    └── lib/                      
        ├── dbConnect.ts          # MongoDB connection helper
        ├── fonts.ts              # Next.js font setup
        ├── models/               # Mongoose models
        │   ├── Form.ts
        │   └── Submission.ts
        └── utils.ts              
```

## Environment Variables

Copy the `.env.example` file.

```
cp .env.example .env
```

Then update `.env` with your API keys.

```env
THESYS_API_KEY=
MONGODB_URI=
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
