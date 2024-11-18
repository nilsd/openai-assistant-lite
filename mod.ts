import OpenAI from '@openai/openai';

export interface AssistantOptions {
    /**
     * Your OpenAI API token
     */
    apiKey: string;
    /**
     * Your OpenAI Assistant ID (eg. 'asst_abc123abc123')
     */
    assistantId: string;
}

/**
 * The main class to represent your OpenAI Assistant
 */
export class Assistant {
    #openAi: OpenAI;
    #assistantId: string;
    #isProcessing: boolean;

    constructor({ apiKey, assistantId }: AssistantOptions) {
        this.#openAi = new OpenAI({
            apiKey,
        });

        this.#assistantId = assistantId;
        this.#isProcessing = false;
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
                throw new AssistantError('noReply');
            }

            return reply;
        }

        console.error(run.last_error?.message ?? 'OpenAI: Unknown error');

        throw new AssistantError('unknown');
    }

    /**
     * Sends a request to your assistant
     * @param  {String} message The message to send to your assistant
     * @return {String}         The reply from your assistant
     * @throws {AssistantError}
     */
    async requestReply(message: string): Promise<AssistantResponse> {
        try {
            if (this.#isProcessing) {
                throw new AssistantError('alreadyProcessing');
            }

            this.#isProcessing = true;

            const run = await this.#openAi.beta.threads.createAndRunPoll({
                assistant_id: this.#assistantId,
                thread: {
                    messages: [
                        { role: 'user', content: message },
                    ],
                },
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

export type AssistantErrorMessage = 'unknown' | 'alreadyProcessing' | 'noReply';

export interface AssistantResponse {
    /**
     * The message you sent to your assistant
     */
    originalMessage: string;
    /**
     * The reply from your assistant
     */
    reply: string;
}

/**
 * All errors thrown will be of this type.
 * See AssistantErrorMessage for known errors.
 *
 * Fatal errors from OpenAI will be caught and logged to the console,
 * and your request will return an AssistantError with 'unknown' as message.
 */
export class AssistantError extends Error {
    constructor(message: AssistantErrorMessage) {
        super(message);
    }
}
