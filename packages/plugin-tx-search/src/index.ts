import {
    Action,
    elizaLogger,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    Plugin,
    State,
} from "@elizaos/core";
import { encodingForModel, TiktokenModel } from "js-tiktoken";

const DEFAULT_MAX_WEB_SEARCH_TOKENS = 4000;
const DEFAULT_MODEL_ENCODING = "gpt-3.5-turbo";

function getTotalTokensFromString(
    str: string,
    encodingName: TiktokenModel = DEFAULT_MODEL_ENCODING
) {
    const encoding = encodingForModel(encodingName);
    return encoding.encode(str).length;
}

function MaxTokens(
    data: string,
    maxTokens: number = DEFAULT_MAX_WEB_SEARCH_TOKENS
): string {
    if (getTotalTokensFromString(data) >= maxTokens) {
        return data.slice(0, maxTokens);
    }
    return data;
}

const txSearch: Action = {
    name: "Tx_SEARCH",
    similes: ["SEARCH_Tx", "CHAIN_SEARCH", "LOOKUP_DEX", "QUERY_Tx"],
    description:
        "Perform a chain search to find information related to the message.",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        elizaLogger.log("Composing state for message:", message);
        state = (await runtime.composeState(message)) as State;
        const userId = runtime.agentId;
        elizaLogger.log("User ID:", userId);

        const webSearchPrompt = message.content.text;
        elizaLogger.log("web search prompt received:", webSearchPrompt);
        callback({
            text: `[POC Test] Search Result: Coming soon...`,
        });
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Find the latest news about DDFF Token.",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here is the latest news about DDFF Token Tx:",
                    action: "Tx_SEARCH",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you find details about the DDFF Token Tx?",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Here are the details I found about the DDFF Token Tx:",
                    action: "Tx_SEARCH",
                },
            },
        ],
    ],
} as Action;

export const txSearchPlugin: Plugin = {
    name: "TxSearch",
    description: "Search Tx",
    actions: [txSearch],
    evaluators: [],
    providers: [],
};

export default txSearchPlugin;
