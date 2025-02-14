export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://www.businessinitiative.org",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Handle actual requests
    if (request.method === "POST") {
      const url = new URL(request.url);
      
      // Route handler for different tools
      switch (url.pathname) {
        case "/business-structure":
          return handleBusinessStructure(request, env);
        case "/llc-generator":
          return handleLLCGenerator(request, env);
        default:
          return new Response("Not found", { 
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "https://www.businessinitiative.org"
            }
          });
      }
    }

    return new Response("Method not allowed", { 
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "https://www.businessinitiative.org"
      }
    });
  }
};

async function handleBusinessStructure(request, env) {
  try {
    const { answers } = await request.json();

    const prompt = `Based on the following business details, recommend the most suitable business structure (Sole Proprietorship, LLC, or Corporation):
    - Expected Revenue: ${answers.revenue}
    - Employee Plans: ${answers.employees}
    - Liability Concerns: ${answers.liability}
    - Funding Plans: ${answers.funding}
    - Business Complexity: ${answers.complexity}

    Please provide:
    1. The recommended structure
    2. A brief explanation
    3. Three key benefits of this structure for their situation`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response
    const [recommendation, explanation, ...benefits] = content.split('\n').filter(line => line.trim());

    return new Response(JSON.stringify({
      recommendation: recommendation.replace(/^[0-9]\.\s*/, ''),
      explanation: explanation.replace(/^[0-9]\.\s*/, ''),
      benefits: benefits.map(benefit => benefit.replace(/^[0-9]\.\s*/, '').replace(/^-\s*/, '')),
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://www.businessinitiative.org",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://www.businessinitiative.org",
      },
    });
  }
}

async function handleLLCGenerator(request, env) {
  try {
    const { industry, keywords } = await request.json();

    const prompt = `Generate 5 creative and professional LLC business names based on:
    Industry: ${industry}
    Keywords: ${keywords}

    Requirements:
    - Names should be unique and memorable
    - Include "LLC" at the end
    - Avoid common or generic terms
    - Consider brand potential
    - Keep it professional`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const names = data.choices[0].message.content
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    return new Response(JSON.stringify({ names }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://www.businessinitiative.org",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://www.businessinitiative.org",
      },
    });
  }
}
