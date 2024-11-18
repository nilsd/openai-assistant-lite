# @nilsd/openai-assistant-lite

A simple way to send a plain text message to an existing OpenAI Assistant and get a response.

### Example

```
const assistant = new Assistant({
    apiKey: 'your_openai_api_key',
    assistantId: 'your_assistant_id' // Ex. 'asst_abc123abc123'
});

const result = await assistant.sendRequest('Hello, how are you?');

console.log(result.reply);
```
