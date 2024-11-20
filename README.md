# @nilsd/openai-assistant-lite

A simple way to send a plain text message to an existing OpenAI Assistant and get a response.

### Example

- Create an assistant at https://platform.openai.com/assistants and configure it with a return type of `text`.
- Add instructions and you are good to go using the example below:

```
import { Assistant } from '@nilsd/openai-assistant-lite';

const assistant = new Assistant({
    apiKey: 'your_openai_api_key',
    assistantId: 'your_assistant_id' // Ex. 'asst_abc123abc123',
});

await assistant.initialize();

const response = await assistant.requestReply('How are you doing?');

console.log(response.reply);
```
