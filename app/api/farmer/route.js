// app/api/hello/route.js

export async function GET() {
  return new Response(JSON.stringify({ message: 'Hello from App Router API!' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
