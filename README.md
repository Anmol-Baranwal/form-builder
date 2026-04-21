# Form Builder

A self-hosted form builder built with [Next.js](https://nextjs.org/) and [C1 by Thesys](https://thesys.dev/). Describe the form you need in natural language and the app instantly generates the UI spec automatically.

This project uses signed JSON Web Tokens (JWT) stored in an HTTP-only cookie for admin authentication. I have covered the architecture, data flow, system prompt and how everything works behind the scenes in this [blog post](https://dev.to/anmolbaranwal/i-built-a-self-hosted-google-forms-alternative-and-made-it-open-source-4f11).

To use the application:

1. Fork this repository and clone it.
2. Set your admin password and other credentials in `.env` (check the format below).
3. Deploy it on any hosting provider (Vercel, Netlify, Render) or your own server.
4. Visit `/login` and enter your admin password.
5. After successful login, you will be redirected to the chat interface at `/`.
6. You can now create forms as needed (see the demo below).

https://github.com/user-attachments/assets/4747fa52-25be-40e9-bed2-e5d751906fdd

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
    │   ├──C1ChatWrapper.tsx
    |   ├──ClientApp.tsx
    |   ├──FormsListPage.ts
    │   └──SubmissionsPage.tsx
    │
    └── lib/                      
        ├── dbConnect.ts          # MongoDB connection helper
        ├── fonts.ts              # Next.js font setup
        ├── models/               # Mongoose models
        │   ├── Form.ts
        │   └── Submission.ts
        └── utils.ts              
```


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

## Environment Variables

Copy the `.env.example` file and update environment variables:

```
cp .env.example .env
```

Open the `.env` file and set your values:

```env
THESYS_API_KEY=<your-thesys-api-key>
MONGODB_URI=<your-mongodb-uri>
THESYS_MODEL=c1/anthropic/claude-sonnet-4/v-20250930
ADMIN_PASSWORD=<your-admin-password>
JWT_SECRET=<your-jwt-secret> # generate with: npm run generate-secret
```

To generate the `JWT_SECRET`, just run the following command and copy/paste into `.env`:

```
npm run generate-secret # Node.js (recommended)
```

For Linux/Mac, you can also use: `openssl rand -hex 32`

> ℹ There are open source generators out there ([1](https://generate-secret.vercel.app/32), [2](https://secrets-generator.vercel.app/)). Be careful though, we don’t know the entropy level of their server and we don’t know the code that is really running behind it so for a real production I advise you to generate it yourself with the above command.

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

## Deploying to Diploi

[![launch with diploi button](https://diploi.com/launch-big.svg)](https://diploi.com/launch/Anmol-Baranwal/form-builder)

In Diploi, open **Deployment Page > Options > Next.js > Environment** and add the same environment variables from your `.env` file.
After you save the changes, Diploi will rebuild the app and make it available at the preview URL shown on the Deployment page.

## Deploying to Vercel

To deploy on Vercel, push the project to a Git repository and import it into Vercel. In the Vercel dashboard under **Project Settings > Environment Variables**, add the same variables you set in `.env`. Once deployed, your app will be live at the provided URL.


## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
