import { OpenAI } from "@llamaindex/openai";

export class RequestyLLM extends OpenAI {
    get supportToolCall(): boolean {
        return true;
    }

    constructor(init?: Partial<OpenAI>) {
        //@ts-ignore
        super(init);
    }
}

