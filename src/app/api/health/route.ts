export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "yora-front",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
