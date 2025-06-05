/* 
    Autor: Rafael V. Gogge
    Copyright © 2025 Rafael V. Gogge
    Projeto: UniLab - Sistema de Gerenciamento de Laboratórios
*/

(function () {
  // Implementação segura do bloqueio de teclas do desenvolvedor
  try {
    document.addEventListener("keydown", function (e) {
      const ctrl = e.ctrlKey, shift = e.shiftKey, meta = e.metaKey;
      const key = e.key.toLowerCase();
      const blockedKeys = ["f12", "u", "i", "j", "c", "r", "p", "s"];

      if (
        key === "f12" ||
        (ctrl && blockedKeys.includes(key)) ||
        (ctrl && shift && blockedKeys.includes(key)) ||
        (meta && shift && blockedKeys.includes(key))
      ) {
        e.preventDefault();
      }
    });
  } catch (error) {
    console.error("Erro na inicialização da proteção:", error);
  }

  // Função para inicializar o assistente com tratamento de erros
  function inicializarAssistente() {
    try {
      // Verificar se a função mostrarMensagem existe
      if (typeof mostrarMensagem !== 'function') {
        console.error("Função mostrarMensagem não encontrada. O assistente não funcionará corretamente.");
        return;
      }

      // Configura o timer de inatividade
      let tempoInativo = 0;
      const tempoLimite = 20; // 20 segundos
      let intervalId = null;

      // Função para resetar o timer
      function resetarTimer() {
        tempoInativo = 0;
      }

      // Função para verificar inatividade
      function verificarInatividade() {
        tempoInativo++;
        if (tempoInativo >= tempoLimite) {
          try {
            mostrarMensagem('Notei que você está há algum tempo na página. Posso ajudar em algo?', 'assistente');
          } catch (e) {
            console.error("Erro ao mostrar mensagem:", e);
          }
          resetarTimer();
        }
      }

      // Adiciona eventos para detectar atividade do usuário com verificação
      const eventos = ['mousemove', 'keypress', 'click', 'scroll'];
      eventos.forEach(evento => {
        document.addEventListener(evento, resetarTimer);
      });

      // Inicia o timer de verificação e armazena o ID para limpeza posterior
      intervalId = setInterval(verificarInatividade, 1000);

      // Retorna uma função para limpar os recursos quando necessário
      return function limpar() {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        eventos.forEach(evento => {
          document.removeEventListener(evento, resetarTimer);
        });

        console.log("Assistente desativado e recursos liberados");
      };
    } catch (error) {
      console.error("Erro ao inicializar o assistente:", error);
    }
  }

  // Adicionar a função ao escopo global ou exportar conforme necessário
  window.inicializarAssistente = inicializarAssistente;

  // Inicializar o assistente quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function () {
    try {
      // Verificar se devemos inicializar o assistente automaticamente
      const assistenteAtivo = localStorage.getItem('assistenteAtivo') !== 'false';
      if (assistenteAtivo) {
        const limparAssistente = inicializarAssistente();

        // Armazenar a função de limpeza para uso posterior
        if (typeof limparAssistente === 'function') {
          window.limparAssistente = limparAssistente;
        }
      }
    } catch (error) {
      console.error("Erro ao verificar configurações do assistente:", error);
    }
  });
})();
