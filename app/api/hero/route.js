export async function GET() {
  try {
    const res = await fetch("http://localhost:5000/api/hero", {
      headers: { "Cache-Control": "no-cache" },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ message: "Failed to fetch hero data" }), { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 });
  }
}
