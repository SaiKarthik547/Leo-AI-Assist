import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from 'https://deno.land/x/openai@v4.57.0/mod.ts';
import { getModelName } from './models.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let message = '';
    let fileListSummary = '';
    let files: Array<{ name: string; type: string; size: number }> = [];
    let fileContentSummary = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      message = formData.get('message') as string || '';
      // Collect all files and analyze
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push({ name: value.name, type: value.type, size: value.size });
          // Analyze text/code files
          if (value.type.startsWith('text') || value.name.match(/\.(js|ts|py|java|c|cpp|json|md|txt|csv|html|css)$/i)) {
            const text = await value.text();
            fileContentSummary += `\n\nFile: ${value.name}\nType: ${value.type || 'unknown'}\nSize: ${value.size} bytes\nContent Preview:\n` + text.slice(0, 1000) + (text.length > 1000 ? '\n...[truncated]' : '');
          } else if (value.type.startsWith('image/')) {
            fileContentSummary += `\n\nImage: ${value.name}\nType: ${value.type}\nSize: ${value.size} bytes`;
          } else {
            fileContentSummary += `\n\nFile: ${value.name}\nType: ${value.type || 'unknown'}\nSize: ${value.size} bytes`;
          }
        }
      }
      if (files.length > 0) {
        fileListSummary = '\n\nThe user also uploaded the following files:\n' + files.map(f => `- ${f.name} (${f.type || 'unknown'}, ${f.size} bytes)`).join('\n');
      }
    } else {
      // Fallback to JSON
      const body = await req.json();
      message = body.message || '';
    }

    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'AI Assistant',
      },
    });

    const completion = await openai.chat.completions.create({
      model: getModelName('DEFAULT'),
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent AI assistant. Provide helpful, accurate, and concise responses. If the user uploads files, summarize what you can based on the file names, types, and content previews.'
        },
        {
          role: 'user',
          content: message + fileListSummary + fileContentSummary,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    // If user prompt requests a document or download, return as .txt file
    const wantsDocument = /\b(generate|create|download).*\b(document|file|txt|report|summary)/i.test(message);
    if (wantsDocument) {
      const file = new Blob([response], { type: 'text/plain' });
      const fileBuffer = await file.arrayBuffer();
      return new Response(fileBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="ai-response.txt"',
        },
      });
    }

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});