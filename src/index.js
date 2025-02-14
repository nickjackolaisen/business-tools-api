export default {
  async fetch(request) {
    // Always handle OPTIONS first
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        }
      });
    }

    // Handle POST requests
    if (request.method === "POST") {
      // Test response
      return new Response(JSON.stringify({
        names: [
          "Test LLC 1",
          "Test LLC 2",
          "Test LLC 3"
        ]
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Handle all other requests
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
