import { createClient } from '@supabase/supabase-js';
import { Database } from '../_lib/database.ts';
import { processMarkdown } from '../_lib/markdown-parser.ts';
import { processPDF } from '../_lib/pdf-parser.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

Deno.serve(async (req) => {
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

  const { document_id } = await req.json();

  type DocumentWithPath = Database['public']['Views']['documents_with_storage_path']['Row'];
  const { data: document, error: docError } = await supabase
    .from('documents_with_storage_path')
    .select('*')
    .eq('id', document_id)
    .single() as { data: DocumentWithPath | null; error: null } | { data: null; error: any };

  if (docError) {
    return new Response(
      JSON.stringify({ error: 'Failed to find document' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!document) {
    return new Response(
      JSON.stringify({ error: 'Document not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!document.storage_object_path || !document.name) {
    return new Response(
      JSON.stringify({ error: 'Failed to find uploaded document or document name' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const { data: file } = await supabase.storage
    .from('files')
    .download(document.storage_object_path);

  if (!file) {
    return new Response(
      JSON.stringify({ error: 'Failed to download storage object' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Détecter le type de fichier
  const isMarkdown = document.name.toLowerCase().endsWith('.md');
  const isPDF = document.name.toLowerCase().endsWith('.pdf');

  if (!isMarkdown && !isPDF) {
    return new Response(
      JSON.stringify({ error: 'Unsupported file type. Only .md and .pdf files are supported.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let sections;
  if (isMarkdown) {
    const fileContents = await file.text();
    const processedMd = processMarkdown(fileContents);
    sections = processedMd.sections;
  } else {
    const arrayBuffer = await file.arrayBuffer();
    const processedPdf = await processPDF(arrayBuffer);
    sections = processedPdf.sections;
  }

  const { error } = await supabase.from('document_sections').insert(
    sections.map(({ content }) => ({
      document_id,
      content,
    }))
  );

  if (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Failed to save document sections' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  console.log(
    `Successfully processed and saved ${sections.length} sections from '${document.name}'`
  );

  return new Response(null, {
    status: 204,
    headers: { 'Content-Type': 'application/json' },
  });
});
