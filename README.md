# Form Builder

Create dynamic forms using natural language powered by [Next.js](https://nextjs.org/) and [Thesys](https://thesys.dev/). You can interactively design forms by describing your requirements and the application generates corresponding form fields. Submissions are stored in MongoDB and each form has its own listing and response pages.

![form builder](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y7pnaxukw4ulqu1ooz0t.png)

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
├── middleware.ts      
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
    │   ├── home/              # Landing page (when not logged in)
    │   │   └── page.tsx
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

Copy the `.env.example` file and update environment variables:

```
cp .env.example .env
```

Open the `.env` file and set your values:

```env
THESYS_API_KEY=<your-thesys-api-key>
MONGODB_URI=<your-mongodb-uri>
THESYS_MODEL=c1/anthropic/claude-3.5-sonnet/v-20250709
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PASSWORD=<your-admin-password>
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

## Usage

To use the application:
1. Fork the repo and set the admin password in `.env`.
2. Navigate to `/login` and enter your admin password.
3. After successful login, you will be redirected to the chat interface at `/`.
4. You can now create forms as needed (see Available Routes below).

## Deploying to Vercel

To deploy on Vercel, push the project to a Git repository and import it into Vercel. In the Vercel dashboard under **Project Settings > Environment Variables**, add the same variables you set in `.env`. Once deployed, your app will be live at the provided URL.

## Available Routes

### Page Routes

- `/home` – Landing page (shown when not logged in)
- `/login` – Admin login page
- `/` – Chat interface (requires authentication)
- `/forms` – List all forms
- `/forms/[id]` – Render a specific form
- `/forms/[id]/submissions` – List submissions for a specific form

### API Routes

- `POST /api/login` – Authenticate and set session cookie
- `POST /api/chat` – AI chat endpoint
- `GET  /api/forms/list` – Get all forms
- `POST /api/forms/create` – Create a new form
- `GET  /api/forms/get` – Get form schema by ID
- `DELETE /api/forms/delete` – Delete a form by ID
- `POST /api/forms/submit` – Submit a form response
- `GET  /api/forms/[id]` – List submissions for a form
- `DELETE /api/forms/[id]/submissions` – Delete a submission by ID

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
