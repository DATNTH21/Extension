import { retryOn429 } from "../../utils/fix429";
import { initializeLLM } from '../../setting/extensionSetup';

const generateResponse = initializeLLM();

export async function getUIComponentStruct(source: string): Promise<string> {
    const prompt = `Analyze the following UI code and extract its structure. Identify:  
                            - **Components** (if applicable in the framework)  
                            - **UI elements** (buttons, text fields, containers, etc.)  
                            - **Attributes** (properties, IDs, styles, event handlers, etc.)  
                            - **Bindings** (state variables, data context, props, ViewModel bindings, etc.)
                            Source Code: ${source}
                            The output must be in json format without any explanations. `;
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(prompt);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}

export async function getUIBehaviour(source: string): Promise<string> {
    const prompt = `Extract user interactions from the following UI code. Identify:  
                            - **Event Listeners** (e.g., onClick, addEventListener, gesture recognizers).  
                            - **Event Handlers** (functions triggered by events).  
                            - **API Calls** (HTTP requests, fetch, network calls).  
                            Source Code: ${source}
                            The output must be in json format without any explanations. `;
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(prompt);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}

export async function getUIState(source: string): Promise<string> {
    const prompt = `Analyze the following UI code and extract its state management details. Identify:  
                            - **State Variables**: Variables that store component or UI state.  
                            - **Props/Input Bindings**: Properties passed between components (if applicable).  
                            - **Computed/Derived Values**: Values that are dynamically computed based on state.  
                            Source Code: ${source}
                            The output must be in json format without any explanations. `;
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(prompt);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}