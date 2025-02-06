import { createClient } from '@supabase/supabase-js';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { codeBlock } from 'common-tags';
import OpenAI from 'openai';
import { Database } from '../_lib/database.ts';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// These are automatically injected
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({
        error: 'Missing environment variables.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return new Response(
      JSON.stringify({ error: `No authorization header passed` }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  const { messages, embedding } = await req.json();

  try {
    // Type-safe database query
    const { data, error: matchError } = await supabase
      .rpc('match_document_sections', {
        embedding,
        match_threshold: 0.8,
      })
      .select<'content', { content: string }>('content')
      .limit(3) // Reduced from 5 to lower response time
      .abortSignal(AbortSignal.timeout(10000)); // 10 second timeout for DB query

    if (matchError) {
      console.error(matchError);
      throw new Error('Database query error');
    }

    if (!data) {
      throw new Error('No documents returned');
    }

    const injectedDocs = data.length > 0
      ? data.map(doc => doc.content).join('\n\n')
      : 'No documents found';

  console.log(injectedDocs);

  const completionMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    [
      {
        role: 'user',
        content: codeBlock`
        You're an AI assistant who answers questions about documents.

        You're a chat bot, so keep your replies succinct.

        You're only allowed to use the documents below to answer the question.

        If the question isn't related to these documents, say:
        "Sorry, I couldn't find any information on that."

        If the information isn't available in the below documents, say:
        "Sorry, I couldn't find any information on that."

        Do not go off topic.

        Documents:
        ${injectedDocs}
      `,
      },
      ...messages,
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const completionStream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: completionMessages,
      max_tokens: 512, // Reduced from 1024 to lower response time
      temperature: 0,
      stream: true,
    }, { signal: controller.signal });

    clearTimeout(timeoutId);
    
    const stream = OpenAIStream(completionStream);
    return new StreamingTextResponse(stream, { headers: corsHeaders });
  } catch (error: unknown) {
    console.error('Error in chat function:', error);
    
    // Check if the error is due to timeout/cancellation
    if (
      error instanceof Error && 
      (error.name === 'AbortError' || error.message?.includes('cancelled'))
    ) {
      return new Response(
        JSON.stringify({
          error: 'The request took too long to process. Please try again with a shorter question.',
        }),
        {
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request. Please try again.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
