# Free Models Configuration

This project has been configured to use only free models through OpenRouter API. No paid models are used.

## Available Free Models

The following free models are available through OpenRouter:

### 1. Meta Llama 3.1 8B (Default)
- **Model ID**: `meta-llama/llama-3.1-8b-instruct:free`
- **Performance**: Good balance of performance and speed
- **Use Case**: General conversation, coding assistance, text generation

### 2. Microsoft Phi-3 Mini
- **Model ID**: `microsoft/phi-3-mini-4k-instruct:free`
- **Performance**: Fast and efficient
- **Use Case**: Quick responses, lightweight tasks

### 3. Google Gemma 2B
- **Model ID**: `google/gemma-2b-it:free`
- **Performance**: Lightweight and fast
- **Use Case**: Simple queries, quick responses

### 4. Mistral 7B
- **Model ID**: `mistralai/mistral-7b-instruct:free`
- **Performance**: Good balance of performance and speed
- **Use Case**: General conversation, moderate complexity tasks

## Configuration

The models are configured in `supabase/functions/chat-with-ai/models.ts`. To change the default model:

1. Open `supabase/functions/chat-with-ai/models.ts`
2. Modify the `DEFAULT` constant to use a different model
3. Example: `DEFAULT: 'microsoft/phi-3-mini-4k-instruct:free'`

## Environment Variables

Make sure you have the following environment variable set in your Supabase project:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## API Key Setup

1. Sign up for a free account at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Add the API key to your Supabase environment variables
4. The free tier includes generous usage limits

## Benefits of Free Models

- **No Cost**: All models are completely free to use
- **No Credit Card Required**: OpenRouter free tier doesn't require payment information
- **Good Performance**: Modern free models provide excellent performance for most use cases
- **Reliable**: OpenRouter provides stable API access to these models

## Model Comparison

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| Llama 3.1 8B | Medium | High | General use, coding |
| Phi-3 Mini | Fast | Medium | Quick responses |
| Gemma 2B | Very Fast | Medium | Simple queries |
| Mistral 7B | Medium | High | Complex tasks |

## Troubleshooting

If you encounter issues:

1. Check that your OpenRouter API key is valid
2. Verify the model name is correct
3. Check OpenRouter's status page for any service issues
4. Ensure you're within the free tier usage limits

## Switching Models

To switch models dynamically, you can modify the `getModelName()` function call in `index.ts`:

```typescript
// Use a specific model
model: getModelName('PHI_3_MINI'),

// Or use the default
model: getModelName('DEFAULT'),
``` 