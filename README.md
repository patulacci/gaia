# Gaia

A Next.js application for secure document chat using AI, built with Supabase and OpenAI.

## 🌟 Features

- **AI-Powered Document Chat**: Chat with your documents using OpenAI's GPT models
- **Secure Authentication**: Built-in authentication system with Supabase
- **Document Management**: Upload, store, and process various document formats
- **PDF Processing Service**: Dedicated microservice for PDF text extraction
- **Vector Search**: Efficient document search using pgvector
- **Row Level Security**: Built-in data security at the database level

## 🛠 Prerequisites

- Node.js 18+
- Docker
- Python 3.11+ (for PDF service)
- OpenAI API key
- Supabase project

## 🔧 Environment Variables

### Core Application Variables

Create a `.env.local` file in the root directory:

```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Optional - Development Configuration
# Add any additional environment variables here
```

### PDF Parser Service Variables

In the `pdf-parser-service` directory:

```bash
# Required - API Security
PDF_PARSER_API_KEY="your-secure-api-key"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

### Edge Functions Variables

Create `supabase/functions/.env` for local development:

```bash
# Required - OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# Required - PDF Parser Configuration
PDF_PARSER_API_URL="your-pdf-parser-service-url" # e.g. http://host.docker.internal:8001 in development
PDF_PARSER_API_KEY="your-api-key"
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gaia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Supabase locally**
   ```bash
   npx supabase start
   ```

4. **Set up environment variables**
   ```bash
   # Get Supabase URL and anon key
   npx supabase status -o env \
     --override-name api.url=NEXT_PUBLIC_SUPABASE_URL \
     --override-name auth.anon_key=NEXT_PUBLIC_SUPABASE_ANON_KEY |
     grep NEXT_PUBLIC > .env.local
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start the PDF parser service**
   ```bash
   cd pdf-parser-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📁 Project Structure

```
gaia/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication routes
│   ├── chat/              # Chat interface
│   ├── files/             # File management
│   └── login/             # Login interface
├── components/            # React components
├── lib/                   # Utility functions and hooks
├── pdf-parser-service/    # PDF processing microservice
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
└── sample-files/         # Sample documents for testing
```

## 🔄 Development Workflow

1. **Database Changes**
   ```bash
   # Create a new migration
   npx supabase migration new your-migration-name
   
   # Apply migrations
   npx supabase db reset
   ```

2. **Edge Functions**
   ```bash
   # Serve functions locally
   npx supabase functions serve
   
   # Deploy functions
   npx supabase functions deploy
   ```

3. **PDF Parser Service**
   ```bash
   # Build Docker image
   cd pdf-parser-service
   docker build -t pdf-parser-service .
   
   # Run container
   docker run -d \
      -p 8001:8000 \
      -e PDF_PARSER_API_KEY="your-api-key" \
      -e PDF_PARSER_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173" \
      pdf-parser-service
   ```

## 🚀 Deployment

1. **Deploy Supabase Project**
   ```bash
   # Link to your project
   npx supabase link --project-ref your-project-ref
   
   # Push database changes
   npx supabase db push
   
   # Deploy edge functions
   npx supabase functions deploy
   
   # Set edge functions secrets
   npx supabase secrets set \
     OPENAI_API_KEY=your-openai-api-key \
     PDF_PARSER_API_URL=your-pdf-parser-service-url \
     PDF_PARSER_API_KEY=your-api-key
   ```

2. **Deploy PDF Parser Service**
   - Build and push Docker image to your registry
   - Deploy using your preferred container platform
   - Set environment variables in your deployment platform

3. **Deploy Next.js Application**
   - Deploy to Vercel or your preferred platform
   - Set environment variables in your deployment platform

## 🔒 Security Notes

1. Never commit environment variables to version control
2. Use HTTPS in production
3. Set specific ALLOWED_ORIGINS in production
4. Regularly rotate API keys
5. Ensure proper configuration of Row Level Security policies

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

## 📝 License

[MIT License](LICENSE)
