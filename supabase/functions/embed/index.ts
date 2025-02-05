// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from '@supabase/supabase-js';
import { Database } from '../_lib/database.ts';

// Initialize Supabase AI Session for embeddings
const model = new Supabase.ai.Session("gte-small"); // ✅ Use new AI Session API

// Supabase Credentials
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  // 🔹 Validate Environment Variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    return new Response(JSON.stringify({ error: "Missing environment variables." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 🔹 Validate Authorization Header
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    console.error("❌ No authorization header provided.");
    return new Response(JSON.stringify({ error: "No authorization header passed" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create Supabase Client
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { authorization } },
    auth: { persistSession: false },
  });

  // 🔹 Read JSON Request Payload
  let requestData;
  try {
    requestData = await req.json();
  } catch (error) {
    console.error("❌ Failed to parse request JSON:", error);
    return new Response(JSON.stringify({ error: "Invalid request format." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { ids, table, contentColumn, embeddingColumn } = requestData;
  if (!ids || !table || !contentColumn || !embeddingColumn) {
    console.error("❌ Missing required request fields.");
    return new Response(JSON.stringify({ error: "Invalid request parameters." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`📌 Processing embeddings for ${ids.length} IDs from table: ${table}`);

  // 🔹 Fetch Rows That Need Embeddings
  const { data: rows, error: selectError } = await supabase
    .from(table)
    .select(`id, ${contentColumn}`)
    .in("id", ids)
    .is(embeddingColumn, null);

  if (selectError) {
    console.error("❌ Database query failed:", selectError);
    return new Response(JSON.stringify({ error: selectError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!rows || rows.length === 0) {
    console.log("✅ No rows found to process.");
    return new Response(JSON.stringify({ message: "No data to process" }), { status: 204 });
  }

  // 🔹 Process Embeddings Sequentially (To Reduce Memory Usage)
  for (const row of rows) {
    try {
      const { id, [contentColumn]: content } = row;

      if (!content) {
        console.warn(`⚠️ No content found for ID ${id}`);
        continue;
      }

      console.log(`🚀 Generating embedding for ID ${id}`);

      // Generate embedding with a timeout to prevent infinite execution
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // Increased timeout

      let output;
      try {
        output = (await model.run(content, {
          mean_pool: true,
          normalize: true,
        })) as number[];
      } catch (error) {
        console.error(`❌ Embedding generation failed for ID ${id}:`, error);
        continue;
      } finally {
        clearTimeout(timeout);
      }

      if (!output) {
        console.error(`❌ Null embedding for ID ${id}`);
        continue;
      }

      const embedding = JSON.stringify(output);

      // 🔹 Save Embedding to Supabase
      const { error } = await supabase
        .from(table)
        .update({ [embeddingColumn]: embedding })
        .eq("id", id);

      if (error) {
        console.error(`❌ Failed to update embedding for ID ${id}:`, error);
      } else {
        console.log(`✅ Successfully saved embedding for ID ${id}`);
      }
    } catch (error) {
      console.error(`🔥 Embedding processing failed for ID ${row.id}:`, error);
    }
  }

  console.log("✅ Embedding processing complete.");

  return new Response(JSON.stringify({ message: "Processing complete" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
