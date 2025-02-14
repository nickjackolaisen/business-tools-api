addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Add CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  // Handle POST requests
  if (request.method === 'POST') {
    return new Response(JSON.stringify({
      names: ['Test LLC 1', 'Test LLC 2', 'Test LLC 3']
    }), {
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })
  }

  // Handle all other requests
  return new Response('Hello World!', { headers })
}
