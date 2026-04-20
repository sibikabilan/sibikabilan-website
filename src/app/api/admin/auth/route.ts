import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = body.password;

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `admin_token=authenticated; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
  );

  return response;
}

export async function DELETE() {
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );
  return response;
}
