import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HF_TOKEN = Deno.env.get("HF_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// FLUX.1-schnell is fast, free-tier friendly, and actively maintained
const MODEL = "black-forest-labs/FLUX.1-schnell";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
      },
    });
  }

  const corsHeaders = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  try {
    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ error: "HF_TOKEN not configured" }), { status: 500, headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers: corsHeaders });
    }

    const cleanPrompt = prompt.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 500).trim();
    console.log(`generating: "${cleanPrompt.substring(0, 60)}"`);

    const hfResp = await fetch(
      `https://router.huggingface.co/hf-inference/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: cleanPrompt }),
      }
    );

    if (!hfResp.ok) {
      const errText = await hfResp.text();
      console.error(`HF ${hfResp.status}:`, errText.substring(0, 300));

      if (hfResp.status === 503) {
        return new Response(
          JSON.stringify({ error: "Model is loading, please try again in ~20 seconds." }),
          { status: 503, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ error: `Image generation failed (${hfResp.status}). Try again.` }),
        { status: 500, headers: corsHeaders }
      );
    }

    const imageBuffer = await hfResp.arrayBuffer();
    const bytes = new Uint8Array(imageBuffer);
    let base64 = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      base64 += String.fromCharCode(...bytes.slice(i, i + chunkSize));
    }
    base64 = btoa(base64);

    const contentType = hfResp.headers.get("content-type") || "image/jpeg";
    console.log(`done, ${imageBuffer.byteLength} bytes, ${contentType}`);

    return new Response(
      JSON.stringify({ image: base64, mimeType: contentType }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("generate-image error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
