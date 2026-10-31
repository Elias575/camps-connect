
export async function onRequestGet(context) {
  const cookies = context.request.headers.get("Cookie") || "";

  const sessao = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("camps_sessao="));

  if (!sessao) {
    return Response.json({ autenticado: false }, { status: 401 });
  }

  const token = sessao.substring("camps_sessao=".length);

  try {
    const resposta = await fetch(
      `${context.env.SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: context.env.SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!resposta.ok) {
      return Response.json({ autenticado: false }, { status: 401 });
    }

    return Response.json({ autenticado: true });
  } catch (erro) {
    return Response.json(
      { autenticado: false },
      { status: 500 }
    );
  }
}
