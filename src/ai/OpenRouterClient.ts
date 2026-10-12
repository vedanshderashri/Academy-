export const OPENROUTER_API_KEY =
  (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Helper to strip markdown code blocks before JSON parsing
function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  return JSON.parse(cleaned);
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  temperature: number = 0.7,
  jsonOutput: boolean = false
): Promise<string> {
  const modelsToTry = [
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-r1-distill-llama-70b',
    'openai/gpt-4o-mini',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173/',
          'X-Title': 'Network Tycoon',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature,
          response_format: jsonOutput ? { type: 'json_object' } : undefined,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`OpenRouter model ${modelName} returned status ${response.status}: ${errText}`);
        lastError = new Error(`OpenRouter (${modelName}) failed: ${response.status}`);
        continue; // try next fallback model
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      if (content.trim()) {
        return content;
      }
    } catch (error: any) {
      console.warn(`Error calling OpenRouter model ${modelName}:`, error);
      lastError = error;
    }
  }

  throw lastError || new Error('All OpenRouter AI models failed to respond.');
}

// 1. AI Quiz Generator
export async function generateAIQuizQuestions(
  topic: string = 'Networking Fundamentals',
  count: number = 4
) {
  const prompt = `Generate ${count} university-level Computer Networks multiple-choice quiz questions on topic "${topic}".
  Return ONLY a valid JSON object matching this exact format, with NO code fences or explanations:
  {
    "questions": [
      {
        "id": 101,
        "question": "Question text here...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Detailed step-by-step explanation...",
        "topic": "${topic}"
      }
    ]
  }`;

  const responseText = await callOpenRouter(
    [
      {
        role: 'system',
        content: 'You are an expert university Computer Networks professor creating educational quiz questions. Output valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    0.7,
    true
  );

  return cleanAndParseJSON(responseText);
}

// 2. AI Custom Mission Generator
export async function generateAIMission(promptIdea: string) {
  const prompt = `Create a complete educational networking mission for the game Network Tycoon based on idea: "${promptIdea}".
  Return ONLY a valid JSON object with NO markdown or code fences, matching this exact structure:
  {
    "title": "Mission Title",
    "category": "Enterprise",
    "difficulty": "Intermediate",
    "description": "Detailed mission task summary...",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "startingBudget": 15000,
    "hint": "Instructor hint...",
    "rewardMoney": 3500,
    "explanation": "Networking concept explanation..."
  }`;

  const responseText = await callOpenRouter(
    [
      {
        role: 'system',
        content: 'You are a senior computer network game designer. Output valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    0.7,
    true
  );

  return cleanAndParseJSON(responseText);
}

// 3. AI Live Network Engineer Chat Assistant
export async function chatWithAINetworkEngineer(
  userQuery: string,
  networkTopologyState: string,
  chatHistory: OpenRouterMessage[] = []
): Promise<string> {
  const systemPrompt = `You are the lead AI Network Engineer for Network Tycoon.
  Analyze the student's live network topology state below:
  
  CURRENT NETWORK STATE:
  ${networkTopologyState}

  Answer the student's question accurately, concisely, and helpfully based on real computer networking principles (OSI model, IP CIDR subnetting, Dijkstra routing, ARP, TCP handshake, firewalls). Give exact step-by-step instructions. Keep response concise in Markdown.`;

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: userQuery },
  ];

  return await callOpenRouter(messages, 0.5, false);
}
