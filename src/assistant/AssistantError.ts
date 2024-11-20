/**
 * All errors thrown will be of this type.
 */
export class AssistantError extends Error {}
export class AssistantErrorNotInitialized extends AssistantError {
    constructor(message?: string) {
        super(message ?? 'Assistant not initialized with a thread');
    }
}
export class AssistantErrorThreadNotFound extends AssistantError {
    constructor(message?: string) {
        super(message ?? 'Thread not found');
    }
}
export class AssistantErrorAlreadyProcessing extends AssistantError {
    constructor(message?: string) {
        super(message ?? 'Assistant is already processing a message');
    }
}
export class AssistantErrorNoReply extends AssistantError {
    constructor(message?: string) {
        super(message ?? 'No reply or bad response from OpenAI');
    }
}
