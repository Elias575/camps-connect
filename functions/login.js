

export async function onRequestPost(context) {
  try {
   const { usuario, password } = await context.request.json();

    if (
      typeof usuario !== "string" ||
      typeof password !== "string" ||
     !usuario.trim() ||
      !password
    ) {
      return Response.json(
       { mensagem: "Informe o usuário e a senha." },
        { status: 400 }
      );
    }

    const supabaseUrl = context.env.SUPABASE_URL;
    if (usuario.trim() !== "transtec.camps") {
  return Response.json(
    { mensagem: "Usuário ou senha incorretos." },
    { status: 401 }
  );
}
  const supabaseKey = context.env.SUPABASE_PUBLISHABLE_KEY;

    const resposta = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey
        },
        body: JSON.stringify({
         email: context.env.SUPABASE_LOGIN_EMAIL,
          password
        })
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      return Response.json(
        { mensagem: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }

    return new Response(
  JSON.stringify({ sucesso: true }),
  {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": `camps_sessao=${resultado.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/`
    }
  }
);
  } catch (erro) {
    return Response.json(
      { mensagem: "Não foi possível realizar o login." },
      { status: 500 }
    );
  }
}
