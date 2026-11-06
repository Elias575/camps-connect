/* Leitor guiado: o conteúdo vem do manual cadastrado, sem alterar regras. */
(() => {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const contexts = {
    lavagem: ['Tenha em mãos as fotos da unidade, o tamanho do contêiner, o serviço solicitado e a margem de operação.', 'Use a tabela de códigos e valores nesta página para conferir o lançamento. USER e OWNER são os valores de pagador usados no guia.', 'Antes de salvar, revise os dados lançados. O guia não informa o significado do campo 1/0 nem o caminho do protocolo em lote: confirme esses pontos com a equipe.'],
    isentos: ['A busca começa na caixa de e-mails de AVARIA da equipe. Use o número completo do contêiner.', 'Há duas evidências obrigatórias: o número da unidade no assunto e a expressão “Custos isentos.” no corpo do e-mail.', 'A pasta de destino e o controle operacional são os definidos pela equipe. O guia não fornece o caminho dessas pastas.'],
    aprovados: ['A ordem deste fluxo é PÁTIO → FIS. Comece pelo registro da unidade na Transtec.', 'Só entre no FIS depois de concluir os registros no PÁTIO.', 'Este trecho está incompleto no manual: a sequência após ALT + M depende da orientação da pessoa responsável.'],
    gateout: ['Primeiro separe as unidades com restrições. A tabela de consulta mostra quais marcações impedem a impressão.', 'Cada PDF deve corresponder a uma unidade liberada. Confira o número da unidade antes de salvar o arquivo.', 'Imprima apenas os documentos autorizados. Use somente ferramentas de PDF aprovadas pela empresa.'],
    maerskstatus: ['Use a planilha correspondente à margem em que está trabalhando. Não reúna unidades de margens diferentes.', 'O caminho documentado é Sistema Transtec → Documental → Atualização de Status.', 'Região, armador e transição devem corresponder à planilha escolhida.', 'A execução ocorre no botão “Atualizar status”. Revise os campos e a relação de unidades antes desse clique.'],
    conferencia: ['Compare o mesmo pátio e os mesmos números de contêiner nos dois sistemas.', 'A tabela desta página relaciona os status e as ações propostas. Ela não substitui a validação da gestão.', 'Valide a relação de ações antes de alterar os registros e preserve o histórico da conferência.'],
    onefotos: ['Separe as fotos pelo número do contêiner antes de acessar o EOS.', 'O guia documenta o acesso, mas não apresenta as telas ou campos de lançamento do EOS. Peça orientação para essa parte.', 'Confira o vínculo das fotos com a unidade. Preserve os arquivos originais da rede.'],
    evergreenfotos: ['Comece pela unidade correta e pelas fotos da vistoria no APP.', 'Extraia as fotos e confira se os arquivos abrem normalmente antes de seguir.', 'Use a sequência de pastas e execução descrita no guia.', 'Confira a unidade e a data de estimativa ao organizar os arquivos.']
  };
  let current = null;
  function instruction(text) {
    return escape(text).replace(/“([^”]+)”/g, '<strong>“$1”</strong>').replace(/\b(USER|OWNER|TICKET VIP|ALT \+ M|IWO|7010)\b/g, '<strong>$1</strong>');
  }
  window.renderProcedureGuide = (p, options) => {
    const steps = p.sections.flatMap((section, group) => section.items.map((text, item) => ({text, group, item, section:section.name})));
    current = {p, steps, index:0};
    const incomplete = /não está completa|ainda precisam ser documentados|ainda não foi fornecido/.test(p.sections.map(s=>s.items.join(' ')).join(' ')+' '+p.warning);
    return `<div class="reader" data-reader="${escape(p.id)}"><button class="back" id="back">← Voltar à biblioteca</button><header class="reader-header"><span class="eyebrow">${escape(p.brand)} · GUIA OPERACIONAL</span><h1>${escape(p.title)}</h1><p>${escape(p.objective)}</p><div class="links">${p.systems.map(options.link).join('')}</div>${incomplete ? '<div class="reader-pending"><strong>Este guia tem trechos pendentes de documentação.</strong> As lacunas estão sinalizadas nas instruções. Consulte a pessoa responsável para executar essas partes.</div>' : ''}</header><div class="reader-layout"><nav class="reader-index" aria-label="Etapas do procedimento"><span class="eyebrow">ROTEIRO DE LEITURA</span>${p.sections.map((s,i)=>`<button type="button" data-reader-section="${i}"><span>${String(i+1).padStart(2,'0')}</span><span>${escape(s.name)}</span></button>`).join('')}<a href="#reader-references">Consultar referências ↓</a></nav><div class="reader-body"><section class="reader-action" aria-label="Instrução atual"><div class="reader-action-meta"><span id="reader-stage"></span><span id="reader-position"></span></div><progress id="reader-progress" aria-label="Posição no guia"></progress><h2 id="reader-heading" tabindex="-1"></h2><p id="reader-context" class="reader-context"></p><div class="reader-task"><span class="eyebrow">O QUE FAZER AGORA</span><p id="reader-text"></p></div><div class="reader-controls"><button type="button" id="reader-prev">← Anterior</button><button type="button" id="reader-next">Próxima instrução →</button></div><p class="reader-reading-note">A navegação acompanha sua leitura. Os registros devem ser feitos no sistema operacional.</p></section><section class="reader-resources" id="reader-references"><h2>Material de apoio</h2><p>Consulte estas referências enquanto segue as instruções.</p>${p.table ? `<details open><summary>Tabela de consulta</summary><div class="tablewrap"><table><thead><tr>${p.table.headers.map(x=>`<th>${escape(x)}</th>`).join('')}</tr></thead><tbody>${p.table.rows.map(r=>`<tr>${r.map(x=>`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>` : ''}${p.visuals ? `<details open><summary>Capturas de tela · ${p.visuals.length} imagens</summary>${p.visuals.map(v=>`<figure class="reader-figure"><figcaption><h3>${escape(v.title)}</h3><p>${escape(v.caption)}</p></figcaption><a href="${v.src}" target="_blank" rel="noopener noreferrer"><img src="${v.src}" alt="${escape(v.title)}" loading="lazy"></a><ol>${(v.arrows||[]).map(a=>`<li>${escape(a)}</li>`).join('')}</ol></figure>`).join('')}</details>` : ''}${p.example ? `<details open><summary>Exemplo de comprovação no e-mail</summary><p>Confira o número da unidade no assunto e a expressão “Custos isentos.” no corpo da mensagem.</p><a href="${options.email}" target="_blank" rel="noopener noreferrer"><img class="example" src="${options.email}" alt="Exemplo de e-mail com assunto e confirmação de custos isentos"></a></details>` : ''}<details open><summary>Regras e pontos de atenção</summary><p>${escape(p.warning)}</p></details></section><section class="panel reader-checklist" id="reader-checklist"><span class="eyebrow">REVISÃO FINAL</span><h2>Confira antes de encerrar</h2>${p.checks.map(x=>`<label class="check"><input type="checkbox"><span>${escape(x)}</span></label>`).join('')}<p class="reader-reading-note">Checklist local de estudo; não substitui o registro operacional.</p></section></div></div></div>`;
  };
  function paint(focus=false) {
    if (!current || !document.querySelector('.reader')) return;
    const {p,steps,index} = current;
    const step = steps[index];
    document.getElementById('reader-stage').textContent = `ETAPA ${step.group+1} DE ${p.sections.length}`;
    document.getElementById('reader-position').textContent = `Instrução ${index+1} de ${steps.length}`;
    const bar = document.getElementById('reader-progress');bar.max=steps.length;bar.value=index+1;
    const heading=document.getElementById('reader-heading');heading.textContent=step.section;
    document.getElementById('reader-context').textContent = contexts[p.id]?.[step.group] || 'Siga as ações desta etapa na ordem indicada e confira os dados da unidade antes de avançar.';
    const text=document.getElementById('reader-text');text.innerHTML=instruction(step.text);
    text.closest('.reader-task').classList.toggle('needs-guidance',/não está completa|ainda precisam|ainda não|consulte a pessoa responsável/i.test(step.text));
    document.getElementById('reader-prev').disabled=index===0;
    document.getElementById('reader-next').textContent=index===steps.length-1?'Ir para a revisão final ↓':'Próxima instrução →';
    document.querySelectorAll('[data-reader-section]').forEach(b=>{const active=Number(b.dataset.readerSection)===step.group;b.classList.toggle('is-current',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    if(focus){heading.focus({preventScroll:true});document.querySelector('.reader-action').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }
  window.mountProcedureGuide = () => paint();
  document.addEventListener('click', e=>{
    const button=e.target.closest('button');if(!button||!current||!document.querySelector('.reader'))return;
    if(button.hasAttribute('data-reader-section')){current.index=current.steps.findIndex(s=>s.group===Number(button.dataset.readerSection));paint(true);}
    else if(button.id==='reader-prev'){current.index=Math.max(0,current.index-1);paint(true);}
    else if(button.id==='reader-next'){
      if(current.index<current.steps.length-1){current.index++;paint(true);}
      else {document.getElementById('reader-checklist').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('.reader-checklist input')?.focus({preventScroll:true});}
    }
  });
})();
