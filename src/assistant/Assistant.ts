import OpenAI from '@openai/openai';

import type { AssistantOptions } from './AssistantOptions.ts';
import type { AssistantResponse } from './AssistantResponse.ts';
import {
    AssistantError,
    AssistantErrorAlreadyProcessing,
    AssistantErrorNoReply,
    AssistantErrorNotInitialized,
    AssistantErrorThreadNotFound,
} from './AssistantError.ts';

/**
 * The main class to represent your assistant
 */
class Assistant {
    #openAi: OpenAI;
    #assistantId: string;
    #thread?: OpenAI.Beta.Threads.Thread;
    #isProcessing: boolean;

    constructor({ apiKey, assistantId }: AssistantOptions) {
        this.#openAi = new OpenAI({
            apiKey,
        });

        this.#assistantId = assistantId;
        this.#isProcessing = false;
    }

    /**
     * Initialize with an existing thread or leave out to start a new thread (ex. thread_abc123abc123)
     * @param  {String} threadId    Optional ID of an existing thread to continue
     * @return {String}             The ID of the used thread
     * @throws {AssistantError}
     */
    async initialize(threadId?: string): Promise<string> {
        try {
            this.#thread = threadId ? await this.#getThread(threadId) : await this.#createThread();

            return this.#thread.id;
        } catch (error) {
            console.error(error);
            throw new AssistantErrorThreadNotFound();
        }
    }

    async #getThread(threadId: string) {
        return await this.#openAi.beta.threads.retrieve(threadId);
    }

    async #createThread() {
        return await this.#openAi.beta.threads.create();
    }

    async #getLastSystemMessage(run: OpenAI.Beta.Threads.Runs.Run) {
        const data = await this.#openAi.beta.threads.messages.list(
            run.thread_id,
        );

        const message = data.data.find((message) => message.role === 'assistant');

        if (!message) {
            return null;
        }

        for (const content of message.content) {
            if (content.type === 'text') {
                return content.text.value;
            }
        }

        return null;
    }

    async #handleReply(
        run: OpenAI.Beta.Threads.Runs.Run,
    ): Promise<string> {
        if (run.status === 'completed') {
            const reply = await this.#getLastSystemMessage(run);
            if (!reply) {
                throw new AssistantErrorNoReply();
            }

            return reply;
        }

        throw new AssistantError(run.last_error?.message ?? 'OpenAI: Unknown error');
    }

    /**
     * Sends a request to your assistant
     * @param  {String} message The message to send to your assistant
     * @return {String}         The reply from your assistant
     * @throws {AssistantError}
     */
    async requestReply(message: string): Promise<AssistantResponse> {
        try {
            if (!this.#thread) {
                throw new AssistantErrorNotInitialized();
            }
            if (this.#isProcessing) {
                throw new AssistantErrorAlreadyProcessing();
            }

            this.#isProcessing = true;

            const run = await this.#openAi.beta.threads.runs.createAndPoll(this.#thread.id, {
                assistant_id: this.#assistantId,
                additional_messages: [
                    { role: 'user', content: message },
                ],
            });

            const reply = await this.#handleReply(run);
            this.#isProcessing = false;

            return { originalMessage: message, reply };
        } catch (error) {
            throw error;
        } finally {
            this.#isProcessing = false;
        }
    }
}

export { Assistant };
