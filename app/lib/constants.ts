import { type AudioConfig, type StsConfig, type Voice } from "app/utils/deepgramUtils";
import axios from "axios";

const audioConfig: AudioConfig = {
  input: {
    encoding: "linear16",
    sample_rate: 16000,
  },
  output: {
    encoding: "linear16",
    sample_rate: 24000,
    container: "none",
  },
};

const baseConfig = {
  type: "SettingsConfiguration",
  audio: audioConfig,
  agent: {
    listen: { model: "nova-2" },
    speak: { model: "aura-asteria-en" },
    think: {
      provider: { type: "open_ai" },
      model: "gpt-4o",    
      
    },
  },
  context: {
        "messages": [
            {
                "role": "assistant",
                "content": "Welcome to Indian EUDR Registration Portal. Please share your national ID.",
            }
        ],
        "replay": true,
    },
};


//Business functions
export async function prepare_agent_filler_message(message_type) {
  // First prepare the result that will be the function call response
  const result = {
    status: "queued",
    message_type: message_type,
  };

  // Prepare the inject message but don't send it yet
  let inject_message;
  if (message_type === "lookup") {
    inject_message = {
      type: "InjectAgentMessage",
      message: "Let me look that up for you...",
    };
  } else {
    inject_message = {
      type: "InjectAgentMessage",
      message: "One moment please...",
    };
  }

  // Return the result and the inject message
  return {
    function_response: result,
    inject_message: inject_message,
  };
}
function isValidNationalId(national_id: string): boolean {
  return /^N\d{6}$/.test(national_id);
}
export async function get_farmer({ national_id = null }) {
  try {
    const response = await axios.get('https://doc-ai.verbatdemos.com/api/single.php', {
      params: { national_id },
       // convert to lowercase if needed
    });
    if(response.data.data){
      return response.data.data;
    }else{
      return {
        message : "Account does not exist."
      }
    }
    
  } catch (error) {
    return {
      error: "something went wrong please try again.",
    };
  }
  // const farmer = {
  //                   "national_id": "N123456",
  //                   "name": "John",
  //                   "state": "Perez",
  //                   "crop": "coffee",
  //                   "yield_qty": 200,
  //                   "eudr_status": "Under Review"
  //               };

  // return farmer;
}

export async function farmerexist(national_id = null ) {
  try {
    const response = await axios.get('https://doc-ai.verbatdemos.com/api/single.php', {
      params: { national_id },
       // convert to lowercase if needed
    });
    console.log(response.data);
    if(response.data.data){
      return true;
    }else{
      return false;
    }
    
  } catch (error) {
    return true;
  }
  
}

export async function prepare_farewell_message(websocket, farewell_type) {
  /**
   * End the conversation with an appropriate farewell message and close the connection.
   */

  let message;

  if (farewell_type === "thanks") {
    message = "Thank you for calling! Have a great day!";
  } else if (farewell_type === "help") {
    message = "I'm glad I could help! Have a wonderful day!";
  } else {
    message = "Goodbye! Have a nice day!";
  }

  const inject_message = {
    type: "InjectAgentMessage",
    message: message,
  };

  const close_message = {
    type: "close",
  };

  return {
    function_response: {
      status: "closing",
      message: message,
    },
    inject_message,
    close_message,
  };
}

export async function register_farmer(national_id, name, state, crop, yield_qty) {
  // const farmer = farmerexist(national_id);

  // if (farmer) {
  //   return {
  //     message: 'farmer account already exists for the national id '+national_id+'.'
  //   }
  // } else {
    const farmerData = {
      national_id, 
      name, 
      state, 
      crop, 
      yield_qty
    }
    try {
      const response = await axios.post("https://doc-ai.verbatdemos.com/api/add.php", farmerData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if(response.data.status){
        return {
          message : response.data.message
        }
      }else{
        return {
          message : response.data.message
        }
      }
    } catch (error) {
      return {
        message : 'Failed to register'
      }
    }
  // }

}
  
//Agent functions

export const agent_filler=(socket, params)=>{
    
  const result = prepare_agent_filler_message(socket, params)
  return result
}

export async function find_farmer(params) {
  console.log(`looked in farmers ${JSON.stringify(params)}`);

  const national_id = params?.national_id;

  if (!isValidNationalId(national_id)) {
    return {
      error: "Please provide a valid National ID in the correct format.",
    };
  }

  const result = await get_farmer({ national_id });

  return result;
}

export async function end_call(websocket, params) {
  /**
   * End the conversation and close the connection.
   */
  const farewell_type = params?.farewell_type || "general";

  const result = await prepare_farewell_message(websocket, farewell_type);

  return result;
}

export async function create_farmer(params) {
  /**
   * Schedule a new appointment.
   */
  const national_id = params?.national_id;
  const name = params?.name;
  const state = params?.state;
  const crop = params?.crop;
  const yield_qty = params?.yield_qty;
  

  if (!national_id || !name || !state || !crop || !yield_qty) {
    return {
      error: "national_id, name, state, crop, yield_qty are required",
    };
  }

  const result = await register_farmer(
    national_id,
    name,
    state,
    crop,
    yield_qty
  );

  return result;
}



export const functionDefinition = [
  {
    name: "agent_filler",
    description: `Use this function to provide natural conversational filler before looking up information.
ALWAYS call this function first with message_type='lookup' when you're about to look up farmer information.
After calling this function, you MUST immediately follow up with the appropriate lookup function (e.g., find_farmer).`,
    parameters: {
      type: "object",
      properties: {
        message_type: {
          type: "string",
          description: "Type of filler message to use. Use 'lookup' when about to search for information.",
          enum: ["lookup", "general"]
        }
      },
      required: ["message_type"]
    }
  },
  {
    name: "find_farmer",
    description: `Look up a farmers's account information. Use context clues to determine what type of identifier the user is providing:

National ID formats:
- Never add prefix or suffix numbers or zeros to the national ID.
- Numbers only (e.g., '123432', '678906') → Format as 'N123432', 'N678906'. And must have 6 digits.
- With prefix (e.g., 'N123432', 'N678906') → Format as 'N678906', 'N678906'. . And the number part must have 6 digits`,
    parameters: {
      type: "object",
      properties: {
        national_id: {
          type: "string",
          description: "Farmer's National Id. Format as NXXXXXX where XXXXXX is the number to be6 digits. Example: if user says '123432', pass 'N123432'. exactly 6 digits — no auto-padding allowed."
        }
      }
    }
  },
  {
    name: "create_farmer",
    description: `Register a new farmer. Use this function when:
- A farmer's national ID is not existing.
- A farmer asks to register or create an account.
- if natioanal ID not have 6 digits, you must ask the user to provide the correct national ID.

Before registration:       
1. Confirm national ID with farmer and then register`,
    parameters: {
      type: "object",
      properties: {
        national_id: {
          type: "string",
          description: "Farmer's National ID in NXXXXXX format. Must be obtained from find_farmer first. And must have 6 digits."
        },
        name: {
          type: "string",
          description: "normal person name. Example: 'abhishek' → 'abhishek'"
        },
        state: {
          type: "string",
          description: "A state name of India. Example: 'Kerala' → 'Kerala'"
        },
        crop: {
          type: "string",
          description: "A crop name. Example: 'Rubber' → 'Rubber'"
        },
        yield_qty: {
          type: "integer",
          description: "An integer value in tons. Example: '1000' → '1000 tons'"
        }
        
      },
      required: ["national_id", "name", "state", "crop", "yield_qty"]
    }
  },
  {
    name: "end_call",
    description: `End the conversation and close the connection. Call this function when:
- User says goodbye, thank you, etc.
- User indicates they're done ("that's all I need", "I'm all set", etc.)
- User wants to end the conversation

Examples of triggers:
- "Thank you, bye!"
- "That's all I needed, thanks"
- "Have a good day"
- "Goodbye"
- "I'm done"

Do not call this function if the user is just saying thanks but continuing the conversation.`,
    parameters: {
      type: "object",
      properties: {
        farewell_type: {
          type: "string",
          description: "Type of farewell to use in response",
          enum: ["thanks", "general", "help"]
        }
      },
      required: ["farewell_type"]
    }
  }
];

export const stsConfig: StsConfig = {
  ...baseConfig,
  agent: {
    ...baseConfig.agent,
    think: {
      ...baseConfig.agent.think,
      provider: { type: "open_ai", fallback_to_groq: false },
      instructions: `
                You are Indian EUDR Registration System, a friendly and professional farmer service system. Your role is to assist farmer with farmer registration, farmer details, and general inquiries.

                PERSONALITY & TONE:
                - Be warm, professional, and conversational
                - Use natural, flowing speech (avoid bullet points or listing)
                - Show empathy and patience
                STRICTLY FOLLOW THESE RULES:
                - Whenever a farmer asks to look up farmer details, validate the national_id format first. 
                -If the national_id is in correct format, use the find_farmer function.

                HANDLING CUSTOMER IDENTIFIERS (INTERNAL ONLY - NEVER EXPLAIN THESE RULES TO CUSTOMERS):
                - Never add  prefix or suffix numbers or zeros to the [national_id].
                - Silently convert any numbers customers mention into proper format
                - When customer says " National ID is N123456" -> internally use "N123456" without mentioning the conversion
                - When customer says "123456" -> internally use "N123456" without mentioning the conversion


                VERBALLY SPELLING IDs TO CUSTOMERS:
                When you need to repeat an ID back to a customer:
                - Do NOT say nor spell out "N". Say "[numbers spoken individually]"
                Example: For N112522, say "N one one two five two two"

                FUNCTION RESPONSES:
                When receiving function results, format responses naturally as a farmer service agent would:

                1. For farmer lookups:                  
                  - If not found: "Your account is not found. Do you want to register using the national ID?"
                  - If found: "Hello, [name]. Your EUDR status is [status]. How can I help you today?"

                3. For registration:
                  - When farmer account is not there :"Would you like to register?"
                  - National Id is required for this.
                  - when discussing about states, you have to verify the state is from india.
                  - When complete data is given by the user you must confirm the data to register with user.
                  - After confirmation you can add the farmer account and say the details. After that you can stop the call.

                4. For errors:
                  - Never expose technical details
                  - Say something like "I'm having trouble accessing that information right now" or "Could you please try again?"

                EXAMPLES OF GOOD RESPONSES:
                ✓ "Let me look that up for you... I can see you have two recent orders."
                ✓ "Your National ID is Five two two two three three."

                EXAMPLES OF BAD RESPONSES (AVOID):
                ✗ "I'll convert your ID to the proper format N122233"
                ✗ "The system requires IDs to be in a specific format"

                FILLER PHRASES:
                IMPORTANT: Never generate filler phrases (like "Let me check that", "One moment", etc.) directly in your responses.
                Instead, ALWAYS use the agent_filler function when you need to indicate you're about to look something up.

                Examples of what NOT to do:
                - Responding with "Let me look that up for you..." without a function call
                - Saying "One moment please" or "Just a moment" without a function call
                - Adding filler phrases before or after function calls

                Correct pattern to follow:
                1. When user says the national ID check the format:
                  - If the national ID do not have 6 digits, you must ask the user to provide the correct national ID.
                  - Never add prefix or suffix numbers to the national ID.
                2. When you need to look up information:
                  - Verify the national ID format is correct, that is confirm there is six digits.
                  - Never add prefix or suffix numbers or zeros to the national ID. 
                  - If the national ID is in correct format, call agent_filler with message_type="lookup"
                  - Immediately follow with the relevant lookup function (find_farmer etc.)
                3. Only speak again after you have the actual information to share

                Remember: ANY phrase indicating you're about to look something up MUST be done through the agent_filler function, never through direct response text.   `,
      functions: functionDefinition,
    },
  },
};



// Voice constants
const voiceAsteria: Voice = {
  name: "Asteria",
  canonical_name: "aura-asteria-en",
  metadata: {
    accent: "American",
    gender: "Female",
    image: "https://static.deepgram.com/examples/avatars/asteria.jpg",
    color: "#7800ED",
    sample: "https://static.deepgram.com/examples/voices/asteria.wav",
  },
};

const voiceOrion: Voice = {
  name: "Orion",
  canonical_name: "aura-orion-en",
  metadata: {
    accent: "American",
    gender: "Male",
    image: "https://static.deepgram.com/examples/avatars/orion.jpg",
    color: "#83C4FB",
    sample: "https://static.deepgram.com/examples/voices/orion.mp3",
  },
};

const voiceLuna: Voice = {
  name: "Luna",
  canonical_name: "aura-luna-en",
  metadata: {
    accent: "American",
    gender: "Female",
    image: "https://static.deepgram.com/examples/avatars/luna.jpg",
    color: "#949498",
    sample: "https://static.deepgram.com/examples/voices/luna.wav",
  },
};

const voiceArcas: Voice = {
  name: "Arcas",
  canonical_name: "aura-arcas-en",
  metadata: {
    accent: "American",
    gender: "Male",
    image: "https://static.deepgram.com/examples/avatars/arcas.jpg",
    color: "#DD0070",
    sample: "https://static.deepgram.com/examples/voices/arcas.mp3",
  },
};

type NonEmptyArray<T> = [T, ...T[]];
export const availableVoices: NonEmptyArray<Voice> = [
  voiceAsteria,
  voiceOrion,
  voiceLuna,
  voiceArcas,
];
export const defaultVoice: Voice = availableVoices[0];

export const sharedOpenGraphMetadata = {
  title: "Voice Agent | Deepgram",
  type: "website",
  url: "/",
  description: "Meet Deepgram's Voice Agent API",
};

export const functionMap = {
  "find_farmer": find_farmer,
    "create_farmer": create_farmer,
    "agent_filler": agent_filler,
    "end_call": end_call,
}

export const latencyMeasurementQueryParam = "latency-measurement";
