
export async function onRequestPost(context) {
  return new Response(
    JSON.stringify({ mensagem: "Rota de login funcionando" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
