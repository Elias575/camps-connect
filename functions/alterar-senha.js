// Cloudflare Pages Function: POST /alterar-senha
// Requer sessão válida e confirmação da senha atual.
export async function onRequestPost(context) {
  const json = (data, status = 200) => Response.json(data, {status, headers: {'Cache-Control':'no-store'}});
  try {
    const cookie = context.request.headers.get('Cookie') || '';
    const token = cookie.split(';').map(x => x.trim()).find(x => x.startsWith('camps_sessao='))?.slice('camps_sessao='.length);
    if (!token) return json({mensagem:'Sua sessão expirou. Entre novamente.'},401);
    const {senhaAtual, novaSenha} = await context.request.json();
    if (typeof senhaAtual !== 'string' || typeof novaSenha !== 'string' || novaSenha.length < 8 || novaSenha.length > 128) {
      return json({mensagem:'Informe a senha atual e uma nova senha entre 8 e 128 caracteres.'},400);
    }
    if (senhaAtual === novaSenha) return json({mensagem:'A nova senha precisa ser diferente da atual.'},400);
    const url = context.env.SUPABASE_URL;
    const key = context.env.SUPABASE_PUBLISHABLE_KEY;
    const email = context.env.SUPABASE_LOGIN_EMAIL;
    if (!url || !key || !email) return json({mensagem:'Configuração de autenticação indisponível.'},503);
    // Confirma que o token pertence à conta autenticada.
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers:{apikey:key, Authorization:`Bearer ${token}`}
    });
    if (!userResponse.ok) return json({mensagem:'Sua sessão expirou. Entre novamente.'},401);
    const usuario = await userResponse.json();
    // Reautentica com a senha atual; nunca retorna tokens ao navegador.
    const confirmResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method:'POST', headers:{apikey:key,'Content-Type':'application/json'},
      body:JSON.stringify({email,password:senhaAtual})
    });
    if (!confirmResponse.ok) return json({mensagem:'A senha atual está incorreta.'},401);
    const confirmacao = await confirmResponse.json();
    if (!confirmacao.user?.id || confirmacao.user.id !== usuario.id) return json({mensagem:'Conta não corresponde à sessão.'},403);
    const updateResponse = await fetch(`${url}/auth/v1/user`, {
      method:'PUT', headers:{apikey:key, Authorization:`Bearer ${confirmacao.access_token}`,'Content-Type':'application/json'},
      body:JSON.stringify({password:novaSenha})
    });
    if (!updateResponse.ok) return json({mensagem:'Não foi possível atualizar a senha. Confira os requisitos de segurança.'},400);
    return json({sucesso:true});
  } catch (err) {
    return json({mensagem:'Erro temporário ao alterar a senha.'},500);
  }
}
