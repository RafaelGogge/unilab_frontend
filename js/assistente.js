/* 
    Autor: Rafael V. Gogge
    Copyright © 2025 Rafael V. Gogge
    Projeto: UniLab - Sistema de Gerenciamento de Laboratórios
*/

(function(){
  const k=["keydown","ctrlKey","shiftKey","metaKey","key","toLowerCase","preventDefault"];
  const b=["f12","u","i","j","c","r","p","s"];
  document.addEventListener(k[0],function(e){
    const ctrl=e[k[1]], shift=e[k[2]], meta=e[k[3]], key=e[k[4]].toLowerCase();
    if (
      e[k[4]].toLowerCase()===b[0] ||
      (ctrl && b.includes(key)) ||
      (ctrl && shift && b.includes(key)) ||
      (meta && shift && b.includes(key))
    ) {
      e[k[6]]();
    }
  });
// Função para inicializar o assistente
function inicializarAssistente() {
    // Configura o timer de inatividade
    let tempoInativo = 0;
    const tempoLimite = 20; // 20 segundos

    // Função para resetar o timer
    function resetarTimer() {
        tempoInativo = 0;
    }

    // Função para verificar inatividade
    function verificarInatividade() {
        tempoInativo++;
        if (tempoInativo >= tempoLimite) {
            mostrarMensagem('Notei que você está há algum tempo na página. Posso ajudar em algo?', 'assistente');
            resetarTimer();
        }
    }

    // Adiciona eventos para detectar atividade do usuário
    ['mousemove', 'keypress', 'click', 'scroll'].forEach(evento => {
        document.addEventListener(evento, resetarTimer);
    });

    // Inicia o timer de verificação
    setInterval(verificarInatividade, 1000);
} 
