import { Assistant } from './src/mod.ts';

const assistant = new Assistant({
    apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
    assistantId: Deno.env.get('OPENAI_ASSISTANT_ID') ?? '',
});

await assistant.initialize();

const response = await assistant.requestReply('How are you doing?');

console.log(response.reply);
