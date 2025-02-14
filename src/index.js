export default {
  async fetch(request, env) {
    // Handle CORS for all routes
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    
    // Route handler for different tools
    switch (url.pathname) {
      case "/business-structure":
        return handleBusinessStructure(request, env);
      case "/llc-generator":
        return handleLLCGenerator(request, env);
      default:
        return new Response("Not found", { status: 404 });
    }
  },
};

async function handleBusinessStructure(request, env) {
  try {
    const { answers } = await request.json();

    const prompt = `Based on the following business characteristics, recommend the most suitable business structure (Sole Proprietorship, LLC, or Corporation) and provide detailed explanation:

Revenue Level: ${answers.revenue}
Employee Plans: ${answers.employees}
Liability Concern: ${answers.liability}
Funding Plans: ${answers.funding}
Business Complexity: ${answers.complexity}

Please provide the response in the following JSON format:
{
  "recommendation": "structure name",
  "explanation": "detailed explanation",
  "benefits": ["benefit1", "benefit2", "benefit3"],
  "nextSteps": ["step1", "step2", "step3"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a business structure expert advisor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(content), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

async function handleLLCGenerator(request, env) {
  try {
    const { industry, keywords } = await request.json();

    const prompt = `Generate 5 unique and creative LLC business names for a company in the ${industry} industry.
    Keywords to consider: ${keywords}
    The names should be professional, memorable, and end with "LLC".
    Return only the names, one per line.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a creative business name generator." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const names = data.choices[0].message.content
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    return new Response(JSON.stringify({ names }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
} 
