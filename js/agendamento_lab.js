/* 
    Autor: Rafael V. Gogge
    Copyright © 2025 Rafael V. Gogge
    Projeto: UniLab - Sistema de Gerenciamento de Laboratórios
*/

(function () {
    try {
        document.addEventListener("keydown", function (e) {
            const ctrl = e.ctrlKey, shift = e.shiftKey, meta = e.metaKey;
            const key = e.key ? e.key.toLowerCase() : '';

            if (
                key === "f12" ||
                (ctrl && ["u", "i", "j", "c", "r", "p", "s"].includes(key)) ||
                (ctrl && shift && ["i", "j", "c"].includes(key)) ||
                (meta && shift && ["i", "j", "c"].includes(key))
            ) {
                e.preventDefault();
            }
        });
    } catch (error) {
        console.error("Erro na inicialização da proteção:", error);
    }
})(); // Fechamento correto da IIFE

// Constantes para uso no localStorage
const STORAGE_KEYS = {
    LABORATORIOS: 'laboratorios',
    PROFESSORES: 'professores',
    HISTORICO: 'historicoAgendamentos',
    NOTIFICACOES: 'notificacoes',
    LAB_AGENDAMENTOS: (id) => `lab${id}_agendamentos`
};

// Melhor prática: não armazenar senhas em texto puro no código
// Em uma aplicação real, isso deveria ser autenticado via API
const senhaAdministrador = "admin";
let agendamentos = [];
let labGlobal = null;
let laboratorios = [];

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", inicializarAplicacao);

// Função principal de inicialização
function inicializarAplicacao() {
    try {
        console.log('DOM carregado, iniciando aplicação...');

        // Inicializar dados de exemplo se necessário
        try {
            inicializarDadosExemplo();
        } catch (error) {
            console.error("Erro ao inicializar dados de exemplo:", error);
        }

        // Carregar dados
        try {
            carregarDados();
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            mostrarMensagem("Ocorreu um erro ao carregar os dados dos laboratórios.", "danger");
        }

        // Adicionar efeito de ripple aos botões
        try {
            addRippleEffect();
        } catch (error) {
            console.error("Erro ao adicionar efeito ripple:", error);
        }

        // Adicionar evento para o botão de trocar laboratório
        const changeLabBtn = document.querySelector('.btn-change-lab');
        if (changeLabBtn) {
            changeLabBtn.addEventListener('click', () => {
                try {
                    showLabSelectionOverlay();
                } catch (error) {
                    console.error("Erro ao mostrar seleção de laboratórios:", error);
                    mostrarMensagem("Não foi possível mostrar a seleção de laboratórios.", "warning");
                }
            });
        } else {
            console.warn("Botão de troca de laboratório não encontrado");
        }

        // Verificar Bootstrap
        if (typeof bootstrap === 'undefined') {
            console.warn("Bootstrap não encontrado. Alguns recursos podem não funcionar corretamente.");
        }

    } catch (error) {
        console.error("Erro crítico na inicialização da aplicação:", error);
        // Tentar mostrar alguma mensagem para o usuário
        try {
            alert("Ocorreu um erro ao inicializar a aplicação. Por favor, recarregue a página.");
        } catch (e) {
            // Em caso de falha completa, pelo menos logamos o erro
        }
    }
}

// Função para inicializar dados de exemplo se não existirem
function inicializarDadosExemplo() {
    // Verificar se já existem laboratórios
    const labsExistem = localStorage.getItem(STORAGE_KEYS.LABORATORIOS) !== null;

    if (!labsExistem) {
        console.log('Inicializando dados de exemplo...');

        // Criar laboratórios de exemplo
        const labsExemplo = [
            {
                id: 0,
                nome: "Laboratório de Informática",
                tipo: "Informática",
                localizacao: "Bloco A, Sala 101",
                capacidade: 30,
                status: "disponivel",
                ferramentas: ["Computador", "Monitor", "Mouse", "Teclado", "Projetor", "Impressora"]
            },
            {
                id: 1,
                nome: "Laboratório de Química",
                tipo: "Química",
                localizacao: "Bloco B, Sala 203",
                capacidade: 25,
                status: "disponivel",
                ferramentas: ["Microscópio", "Vidraria", "Reagentes", "Balança", "pHmetro"]
            },
            {
                id: 2,
                nome: "Laboratório de Física",
                tipo: "Física",
                localizacao: "Bloco B, Sala 205",
                capacidade: 20,
                status: "disponivel",
                ferramentas: ["Osciloscópio", "Multímetro", "Gerador de Sinais", "Kit de Ferramentas"]
            },
            {
                id: 3,
                nome: "Laboratório de Biologia",
                tipo: "Biologia",
                localizacao: "Bloco C, Sala 102",
                capacidade: 22,
                status: "disponivel",
                ferramentas: ["Microscópio", "Centrífuga", "Estufa", "Pipeta"]
            }
        ];

        localStorage.setItem(STORAGE_KEYS.LABORATORIOS, JSON.stringify(labsExemplo));

        // Criar professores de exemplo
        const professoresExistem = localStorage.getItem(STORAGE_KEYS.PROFESSORES) !== null;

        if (!professoresExistem) {
            const professoresExemplo = [
                { id: 1, nome: "Dr. Carlos Silva", departamento: "Ciência da Computação" },
                { id: 2, nome: "Dra. Ana Oliveira", departamento: "Química" },
                { id: 3, nome: "Dr. Roberto Santos", departamento: "Física" },
                { id: 4, nome: "Dra. Mariana Costa", departamento: "Biologia" }
            ];

            localStorage.setItem(STORAGE_KEYS.PROFESSORES, JSON.stringify(professoresExemplo));
        }
    }
}

// Carrega os dados do laboratório a partir do localStorage
function carregarDados() {
    console.log('Iniciando carregamento de dados...');

    try {
        laboratorios = JSON.parse(localStorage.getItem(STORAGE_KEYS.LABORATORIOS)) || [];

        if (laboratorios.length === 0) {
            console.log('Nenhum laboratório encontrado');
            mostrarMensagem('Nenhum laboratório cadastrado no sistema.', 'warning');
            return;
        }

        // Mostrar overlay de seleção de laboratório
        showLabSelectionOverlay();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        mostrarMensagem("Erro ao carregar dados dos laboratórios.", "danger");
        laboratorios = [];
    }
}

// Função para mostrar o overlay de seleção de laboratório
function showLabSelectionOverlay() {
    try {
        const overlay = document.getElementById('labSelectionOverlay');
        if (!overlay) {
            console.error("Elemento 'labSelectionOverlay' não encontrado");
            return;
        }

        // Esconder o conteúdo principal
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.add('opacity-0');
        }

        // Resetar o grid de laboratórios
        const labGrid = document.getElementById('labSelectionGrid');
        if (!labGrid) {
            console.error("Elemento 'labSelectionGrid' não encontrado");
            return;
        }

        labGrid.innerHTML = '';

        // Carregar laboratórios do localStorage
        laboratorios = JSON.parse(localStorage.getItem(STORAGE_KEYS.LABORATORIOS)) || [];

        if (laboratorios.length === 0) {
            labGrid.innerHTML = '<p class="text-center text-white">Nenhum laboratório encontrado.</p>';
            return;
        }

        // Criar card para cada laboratório
        laboratorios.forEach((lab, index) => {
            // Verificar status do laboratório
            const agendamentosLab = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAB_AGENDAMENTOS(lab.id))) || [];
            const hoje = new Date().toISOString().split('T')[0];
            const agendamentosHoje = agendamentosLab.filter(a => a.data === hoje);

            let statusClass = 'disponivel';
            let statusText = 'Disponível';

            if (agendamentosHoje.length > 0) {
                if (agendamentosHoje.some(a => a.horario === "19:00 às 20:20 e 20:50 às 22:00")) {
                    statusClass = 'ocupado';
                    statusText = 'Ocupado Hoje';
                } else {
                    statusClass = 'parcial';
                    statusText = 'Parcialmente Disponível';
                }
            }

            // Criar card
            const card = document.createElement('div');
            card.className = 'lab-card';
            card.setAttribute('data-lab-id', lab.id);
            card.setAttribute('data-lab-index', index);
            card.tabIndex = 0; // Para acessibilidade
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
            <div class="lab-card-icon">
                <i class="bi ${getLabIcon(lab.tipo)}"></i>
            </div>
            <h3>${lab.nome}</h3>
            <p>${lab.localizacao}</p>
            <span class="lab-card-status ${statusClass}">
                <i class="bi ${statusClass === 'disponivel' ? 'bi-check-circle' : statusClass === 'parcial' ? 'bi-exclamation-circle' : 'bi-x-circle'}"></i>
                ${statusText}
            </span>
        `;

            // Adicionar evento de clique
            card.addEventListener('click', () => {
                const clickedId = card.getAttribute('data-lab-id');
                console.log(`Laboratório clicado: ${lab.nome} (ID: ${clickedId})`);
                selecionarLaboratorio(clickedId);
            });

            // Adicionar evento de teclado para acessibilidade
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selecionarLaboratorio(lab.id);
                    hideLabSelectionOverlay();
                }
            });

            labGrid.appendChild(card);
        });

        // Mostrar overlay com animação
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.remove('opacity-0', 'translate-y-10');
        }, 10);
    } catch (error) {
        console.error("Erro ao mostrar overlay de seleção:", error);
    }
}

// Função para selecionar um laboratório
function selecionarLaboratorio(labId) {
    console.log(`Selecionando laboratório com ID: ${labId}, tipo: ${typeof labId}`);
    window.labAtual = labId;

    try {
        // Buscar laboratório mais cuidadosamente, comparando strings
        labGlobal = laboratorios.find(lab => String(lab.id) === String(labId));

        if (!labGlobal) {
            console.error(`Laboratório com ID ${labId} não encontrado na lista de ${laboratorios.length} laboratórios`);
            // Debugar todos os IDs de laboratórios disponíveis
            console.log("IDs disponíveis:", laboratorios.map(lab => `${lab.id} (${typeof lab.id})`));
            mostrarMensagem('Erro ao carregar laboratório. ID não encontrado.', 'danger');
            return;
        }

        console.log(`Laboratório encontrado: ${labGlobal.nome} (ID: ${labGlobal.id})`);

        // Carregar agendamentos do laboratório
        try {
            const agendamentosData = localStorage.getItem(STORAGE_KEYS.LAB_AGENDAMENTOS(labId));
            console.log(`Dados de agendamentos obtidos: ${agendamentosData ? 'sim' : 'não'}`);
            agendamentos = agendamentosData ? JSON.parse(agendamentosData) : [];
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
            agendamentos = [];
        }

        console.log(`Agendamentos carregados: ${agendamentos.length}`);

        // Verificar e atualizar elementos DOM antes de prosseguir
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error("Elemento 'main-content' não encontrado");
            mostrarMensagem("Erro na interface: Elemento principal não encontrado.", "danger");
            return;
        }

        // Garantir que o conteúdo principal esteja visível
        mainContent.style.display = 'block';
        mainContent.classList.remove('opacity-0');

        // Garantir que os elementos necessários existam antes de continuar
        const necessaryElements = [
            'labTitle', 'labLocalizacao', 'labTipo', 'labCapacidade', 'labStatus'
        ];

        for (const elementId of necessaryElements) {
            if (!document.getElementById(elementId)) {
                console.error(`Elemento '${elementId}' não encontrado`);
                mostrarMensagem(`Erro na interface: Elemento ${elementId} não encontrado.`, "danger");
                return;
            }
        }

        // Atualizar informações do laboratório
        atualizarInformacoesLaboratorio(labGlobal);

        // Carregar professores
        carregarProfessores();

        // Atualizar status
        atualizarStatus();

        // Carregar ferramentas
        carregarFerramentasLaboratorio(labId);

        // Animar elementos
        animateElements();

        // Garantir que o overlay seja escondido
        hideLabSelectionOverlay();

        // Mostrar uma mensagem de sucesso para confirmar ao usuário
        mostrarMensagem(`Laboratório ${labGlobal.nome} selecionado com sucesso!`, 'success');

    } catch (error) {
        console.error("Erro ao selecionar laboratório:", error);
        mostrarMensagem("Erro ao carregar dados do laboratório selecionado.", "danger");
    }
}

// Função para esconder o overlay de seleção de laboratório
function hideLabSelectionOverlay() {
    try {
        const overlay = document.getElementById('labSelectionOverlay');
        if (!overlay) {
            console.error("Elemento 'labSelectionOverlay' não encontrado");
            return;
        }

        overlay.classList.add('opacity-0', 'translate-y-10');

        // Mostrar o conteúdo principal imediatamente e forçar a visibilidade
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            console.log("Exibindo conteúdo principal");
            mainContent.classList.remove('opacity-0');
            mainContent.style.display = 'block'; // Garantir que esteja visível
            mainContent.style.visibility = 'visible'; // Forçar visibilidade
            mainContent.style.opacity = '1'; // Garantir opacidade completa
        } else {
            console.error("Elemento 'main-content' não encontrado");
        }

        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    } catch (error) {
        console.error("Erro ao esconder overlay:", error);
    }
}

// Função para obter o ícone correto para cada tipo de laboratório
function getLabIcon(tipo) {
    const icons = {
        'Informática': 'bi-pc-display',
        'Química': 'bi-flask',
        'Física': 'bi-lightning',
        'Biologia': 'bi-virus',
        'Robótica': 'bi-robot',
        'Eletrônica': 'bi-cpu',
        'Mecânica': 'bi-gear',
        'Artes': 'bi-palette'
    };

    return icons[tipo] || 'bi-building';
}

// Função para carregar a lista de professores com tratamento de erros
function carregarProfessores() {
    try {
        console.log('Carregando lista de professores...');
        let professores = [];

        try {
            const professoresJSON = localStorage.getItem("professores");
            professores = professoresJSON ? JSON.parse(professoresJSON) : [];
        } catch (error) {
            console.error("Erro ao carregar professores do localStorage:", error);
            professores = [];
        }

        if (professores.length === 0) {
            console.log('Nenhum professor encontrado');
            mostrarMensagem('Nenhum professor cadastrado no sistema.', 'warning');
            return;
        }

        const selectProfessor = document.getElementById("nomeProfessor");
        if (!selectProfessor) {
            console.error("Elemento select de professor não encontrado");
            return;
        }

        // Mantém apenas a primeira opção (placeholder)
        selectProfessor.innerHTML = '<option value="">Selecione um professor</option>';

        // Ordena os professores por nome
        professores.sort((a, b) => a.nome.localeCompare(b.nome));

        professores.forEach(professor => {
            const option = document.createElement("option");
            option.value = professor.nome;
            option.textContent = professor.nome;
            selectProfessor.appendChild(option);
        });

        console.log(`${professores.length} professores carregados`);
    } catch (error) {
        console.error("Erro ao carregar professores:", error);
    }
}

// Função para formatar a data com validação
function formatarData(data) {
    try {
        if (!data || typeof data !== 'string') {
            return "Data inválida";
        }

        const parts = data.split("-");
        if (parts.length !== 3) {
            return "Data inválida";
        }

        const [ano, mes, dia] = parts;
        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        console.error("Erro ao formatar data:", error);
        return "Data inválida";
    }
}

// Função para atualizar as informações do laboratório selecionado
function atualizarInformacoesLaboratorio(lab) {
    // Atualizar título
    document.getElementById('labTitle').textContent = `Agendamento: ${lab.nome}`;

    // Atualizar detalhes
    document.getElementById('labLocalizacao').textContent = lab.localizacao || 'Não informado';
    document.getElementById('labTipo').textContent = lab.tipo || 'Não informado';
    document.getElementById('labCapacidade').textContent = `${lab.capacidade || 0} lugares`;

    // Verificar status do laboratório
    const hoje = new Date().toISOString().split('T')[0];
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje);

    const statusIcon = document.querySelector('.status-icon');
    const labStatusElement = document.getElementById('labStatus');

    if (agendamentosHoje.length === 0) {
        statusIcon.className = 'bi bi-circle-fill status-icon disponivel';
        labStatusElement.textContent = 'Disponível Hoje';
    } else if (agendamentosHoje.some(a => a.horario === "19:00 às 20:20 e 20:50 às 22:00")) {
        statusIcon.className = 'bi bi-circle-fill status-icon ocupado';
        labStatusElement.textContent = 'Ocupado Hoje';
    } else {
        statusIcon.className = 'bi bi-circle-fill status-icon parcial';
        labStatusElement.textContent = 'Parcialmente Disponível';
    }
}

// Função para mostrar mensagens ao usuário com tratamento de erros
function mostrarMensagem(mensagem, tipo = 'info') {
    try {
        if (!mensagem) return;

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.maxWidth = '400px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        alertDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        alertDiv.innerHTML = `
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        `;

        document.body.appendChild(alertDiv);

        // Animar entrada
        setTimeout(() => {
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translateY(0)';
        }, 10);

        // Remover após 5 segundos
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        }, 5000);
    } catch (error) {
        console.error("Erro ao mostrar mensagem:", error);
        // Fallback para alertas nativos em caso de erro
        alert(`${tipo.toUpperCase()}: ${mensagem}`);
    }
}

// Função para animar elementos quando aparecem na tela
function animateElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-element').forEach(el => {
        observer.observe(el);
    });
}

// Função para adicionar efeito de ripple nos botões
function addRippleEffect() {
    document.querySelectorAll('.btn-custom, .btn-cancel').forEach(button => {
        button.addEventListener('click', function (event) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();

            ripple.className = 'ripple';
            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Atualiza o status exibido (lista de agendamentos) na tela
function atualizarStatus() {
    console.log('Atualizando status do laboratório...');

    // Remover container de status existente, se houver
    const existingStatus = document.querySelector('.status-container');
    if (existingStatus) {
        existingStatus.remove();
    }

    // Criar novo container de status
    const statusContainer = document.createElement('div');
    statusContainer.className = 'status-container fade-in-element';
    statusContainer.setAttribute('data-delay', '400');

    const statusTitle = document.createElement('h3');
    statusTitle.className = 'status-title';
    statusTitle.innerHTML = '<i class="bi bi-calendar-check"></i> Status do Laboratório';
    statusContainer.appendChild(statusTitle);

    const statusList = document.createElement('ul');
    statusList.id = 'statusList';
    statusList.className = 'status-list';

    if (agendamentos.length === 0) {
        const li = document.createElement('li');
        li.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> Nenhuma data indisponível';
        statusList.appendChild(li);
        document.getElementById("cancelButton")?.classList.add("d-none");
    } else {
        agendamentos.sort((a, b) => new Date(a.data) - new Date(b.data)).forEach((agendamento, index) => {
            const listItem = document.createElement("li");
            const hoje = new Date().toISOString().split('T')[0];
            const classe = agendamento.data === hoje ? 'hoje' : '';

            listItem.innerHTML = `
            <div class="agendamento-info ${classe}">
                <i class="bi bi-person-circle"></i>
                <span>Professor: ${agendamento.professor}</span>
            </div>
            <div class="agendamento-info ${classe}">
                <i class="bi bi-calendar-event"></i>
                <span>Data: ${formatarData(agendamento.data)}</span>
            </div>
            <div class="agendamento-info ${classe}">
                <i class="bi bi-clock"></i>
                <span>Horário: ${agendamento.horario}</span>
            </div>
        `;
            statusList.appendChild(listItem);
        });
        document.getElementById("cancelButton")?.classList.remove("d-none");
    }

    statusContainer.appendChild(statusList);

    // Inserir o container de status após os botões de horário
    const formContainer = document.querySelector('.form-container');
    formContainer.insertAdjacentElement('afterend', statusContainer);
}

// --- INTEGRAÇÃO: Histórico e Notificações ---

// Adiciona o registro do agendamento ao histórico global
function adicionarAoHistorico(agendamento) {
    try {
        const historico = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO)) || [];
        historico.push({
            ...agendamento,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historico));
    } catch (error) {
        console.error("Erro ao adicionar ao histórico:", error);
    }
}

// Adiciona uma notificação de alteração
function adicionarNotificacao(titulo, mensagem) {
    try {
        const notificacoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICACOES)) || [];
        const novaNotificacao = {
            titulo,
            mensagem,
            data: new Date().toISOString(),
            lida: false
        };
        notificacoes.push(novaNotificacao);
        localStorage.setItem(STORAGE_KEYS.NOTIFICACOES, JSON.stringify(notificacoes));
    } catch (error) {
        console.error("Erro ao adicionar notificação:", error);
    }
}

// Função para obter o ícone correto para cada ferramenta
function getFerramentaIcon(ferramenta) {
    const ferramentasIcons = {
        'Computador': 'bi bi-pc-display',
        'Monitor': 'bi bi-display',
        'Mouse': 'bi bi-mouse',
        'Teclado': 'bi bi-keyboard',
        'Projetor': 'bi bi-projector',
        'Microscópio': 'bi bi-microscope',
        'Impressora': 'bi bi-printer',
        'Scanner': 'bi bi-scanner',
        'Câmera': 'bi bi-camera',
        'Microfone': 'bi bi-mic',
        'Fone de Ouvido': 'bi bi-headphones',
        'Webcam': 'bi bi-webcam',
        'Roteador': 'bi bi-router',
        'Switch': 'bi bi-hdd-network',
        'Cabo de Rede': 'bi bi-ethernet',
        'Fonte de Alimentação': 'bi bi-plug',
        'Multímetro': 'bi bi-lightning-charge',
        'Osciloscópio': 'bi bi-graph-up',
        'Gerador de Sinais': 'bi bi-soundwave',
        'Fonte DC': 'bi bi-battery',
        'Protoboard': 'bi bi-grid-3x3',
        'Kit de Ferramentas': 'bi bi-tools',
        'Componentes Eletrônicos': 'bi bi-cpu',
        'Balança': 'bi bi-arrow-down-up',
        'Vidraria': 'bi bi-flask',
        'Reagentes': 'bi bi-droplet',
        'Pipeta': 'bi bi-thermometer',
        'Estufa': 'bi bi-box',
        'Centrífuga': 'bi bi-arrow-repeat',
        'pHmetro': 'bi bi-water'
    };

    return ferramentasIcons[ferramenta] || 'bi bi-tools';
}

// Função para carregar e exibir as ferramentas do laboratório
function carregarFerramentasLaboratorio(labId) {
    console.log('Carregando ferramentas do laboratório...');
    const lab = laboratorios.find(l => l.id === labId);

    if (!lab) {
        console.log('Laboratório não encontrado');
        return;
    }

    // Remover container de ferramentas existente, se houver
    const existingContainer = document.querySelector('.lab-info');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Criar novo container de ferramentas
    const ferramentasContainer = document.createElement('div');
    ferramentasContainer.className = 'lab-info fade-in-element';
    ferramentasContainer.setAttribute('data-delay', '500');

    // Adicionar título
    const titulo = document.createElement('h3');
    titulo.innerHTML = '<i class="bi bi-tools"></i> Ferramentas Disponíveis';
    titulo.className = 'ferramentas-titulo';
    ferramentasContainer.appendChild(titulo);

    // Container para as ferramentas
    const ferramentasGrid = document.createElement('div');
    ferramentasGrid.className = 'ferramentas-grid';

    if (!lab.ferramentas || lab.ferramentas.length === 0) {
        console.log('Nenhuma ferramenta encontrada');
        const mensagem = document.createElement('p');
        mensagem.innerHTML = '<i class="bi bi-info-circle"></i> Nenhuma ferramenta cadastrada para este laboratório.';
        mensagem.className = 'text-white-70';
        ferramentasContainer.appendChild(mensagem);
    } else {
        console.log('Ferramentas encontradas:', lab.ferramentas);
        lab.ferramentas.forEach((ferramenta, index) => {
            const ferramentaItem = document.createElement('div');
            ferramentaItem.className = 'ferramenta-item';
            ferramentaItem.style.animationDelay = `${index * 0.1}s`;

            const icon = document.createElement('i');
            icon.className = getFerramentaIcon(ferramenta);

            const span = document.createElement('span');
            span.textContent = ferramenta;

            ferramentaItem.appendChild(icon);
            ferramentaItem.appendChild(span);
            ferramentasGrid.appendChild(ferramentaItem);
        });
        ferramentasContainer.appendChild(ferramentasGrid);
    }

    // Inserir o container de ferramentas após o container de status
    const statusContainer = document.querySelector('.status-container');
    if (statusContainer) {
        statusContainer.insertAdjacentElement('afterend', ferramentasContainer);
    } else {
        document.querySelector('.form-container').insertAdjacentElement('afterend', ferramentasContainer);
    }
}

// Função para salvar os agendamentos no localStorage
function salvarAgendamentos() {
    try {
        if (!window.labAtual) {
            console.error("ID do laboratório não definido");
            mostrarMensagem("Erro ao salvar: laboratório não selecionado.", "danger");
            return false;
        }

        localStorage.setItem(STORAGE_KEYS.LAB_AGENDAMENTOS(window.labAtual), JSON.stringify(agendamentos));
        console.log(`Agendamentos salvos com sucesso para o laboratório ${window.labAtual}`);
        return true;
    } catch (error) {
        console.error("Erro ao salvar agendamentos:", error);
        mostrarMensagem("Erro ao salvar agendamentos. Tente novamente.", "danger");
        return false;
    }
}

// Função para reservar horário
async function reservar(horario) {
    try {
        const selectProfessor = document.getElementById("nomeProfessor");
        const dataInput = document.getElementById("dataAgendamento");

        if (!selectProfessor || !dataInput) {
            mostrarMensagem("Erro: Elementos do formulário não encontrados.", "danger");
            return;
        }

        const nomeProfessor = selectProfessor.value;
        const dataAgendamento = dataInput.value;

        if (!nomeProfessor) {
            mostrarMensagem("Por favor, selecione um professor.", "danger");
            return;
        }

        if (!dataAgendamento) {
            mostrarMensagem("A data é obrigatória para efetuar a reserva.", "danger");
            return;
        }

        // Validação de data mais robusta
        const dataAtual = new Date();
        let dataSelecionada;

        try {
            dataSelecionada = new Date(dataAgendamento + 'T00:00:00');
            if (isNaN(dataSelecionada.getTime())) {
                throw new Error("Data inválida");
            }
        } catch (error) {
            mostrarMensagem("A data selecionada é inválida.", "danger");
            return;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (dataSelecionada < hoje) {
            mostrarMensagem("Não é possível agendar para uma data que já passou.", "danger");
            return;
        }

        if (dataSelecionada.toDateString() === dataAtual.toDateString() && dataAtual.getHours() >= 18) {
            mostrarMensagem("Não é permitido realizar agendamentos após as 18h deste dia.", "danger");
            return;
        }

        const bookingsForDate = agendamentos.filter(agendamento => agendamento.data === dataAgendamento);
        if (bookingsForDate.length > 0) {
            if (horario === "19:00 às 20:20 e 20:50 às 22:00") {
                mostrarMensagem("Não é possível marcar ambos os horários, pois já há agendamentos para essa data.", "danger");
                return;
            }
            else if (horario === "19:00 às 20:20" && bookingsForDate.some(b => b.horario === "19:00 às 20:20" || b.horario === "19:00 às 20:20 e 20:50 às 22:00")) {
                mostrarMensagem("O horário 19:00 às 20:20 já está reservado para essa data.", "danger");
                return;
            } else if (horario === "20:50 às 22:00" && bookingsForDate.some(b => b.horario === "20:50 às 22:00" || b.horario === "19:00 às 20:20 e 20:50 às 22:00")) {
                mostrarMensagem("O horário 20:50 às 22:00 já está reservado para essa data.", "danger");
                return;
            }
        }

        const agendamentosPorProfessor = agendamentos.filter(
            agendamento => agendamento.professor === nomeProfessor && agendamento.data === dataAgendamento
        );

        if (agendamentosPorProfessor.length >= 3) {
            mostrarMensagem("Você atingiu o limite de 3 agendamentos para esse dia.", "danger");
            return;
        }

        // Verificação de senha mais segura
        const senhaInput = prompt("Digite a senha do administrador:");
        if (senhaInput === null) {
            return; // Usuário cancelou
        }

        if (senhaInput === senhaAdministrador) {
            const novoAgendamento = {
                laboratorio: labGlobal.nome,
                professor: nomeProfessor,
                data: dataAgendamento,
                horario
            };

            agendamentos.push(novoAgendamento);
            if (!salvarAgendamentos()) {
                return; // Não continua se falhar ao salvar
            }

            // Integração: Adiciona ao histórico e gera notificação
            adicionarAoHistorico(novoAgendamento);
            adicionarNotificacao(
                "Novo Agendamento",
                `Professor ${nomeProfessor} agendou o laboratório ${labGlobal.nome} para ${formatarData(dataAgendamento)} no horário ${horario}.`
            );

            mostrarMensagem(`Reserva confirmada!\nProfessor: ${nomeProfessor}\nData: ${formatarData(dataAgendamento)}\nHorário: ${horario}`, "success");
            atualizarStatus();
            showConfirmAgendamento();

            // Atualizar informações do laboratório
            atualizarInformacoesLaboratorio(labGlobal);
        } else {
            mostrarMensagem("Senha incorreta. A reserva não foi realizada.", "danger");
        }
    } catch (error) {
        console.error("Erro ao reservar horário:", error);
        mostrarMensagem("Ocorreu um erro inesperado. Tente novamente.", "danger");
    }
};

// Função para abrir modal de cancelamento
function abrirModalCancelamento() {
    const modalBody = document.getElementById("modalBody");
    modalBody.innerHTML = "";

    if (agendamentos.length === 0) {
        modalBody.innerHTML = '<p class="text-muted"><i class="bi bi-info-circle"></i> Nenhum agendamento para cancelar.</p>';
        return;
    }

    agendamentos.forEach((agendamento, index) => {
        const div = document.createElement("div");
        div.className = "form-check";
        div.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${index}" id="agendamento${index}">
        <label class="form-check-label" for="agendamento${index}">
            <i class="bi bi-calendar-event"></i> ${formatarData(agendamento.data)} - 
            <i class="bi bi-clock"></i> ${agendamento.horario} - 
            <i class="bi bi-person"></i> ${agendamento.professor}
        </label>
    `;
        modalBody.appendChild(div);
    });

    const modal = new bootstrap.Modal(document.getElementById("cancelModal"));
    modal.show();
}

// Função para cancelar agendamentos selecionados
async function cancelarAgendamentosSelecionados() {
    try {
        const senhaInput = prompt("Digite a senha do administrador para cancelar os agendamentos:");
        if (senhaInput === null) {
            return; // Usuário cancelou
        }

        if (senhaInput !== senhaAdministrador) {
            mostrarMensagem("Senha incorreta. Não foi possível cancelar os agendamentos.", "danger");
            return;
        }

        const checkboxes = document.querySelectorAll("#modalBody .form-check-input:checked");
        if (checkboxes.length === 0) {
            mostrarMensagem("Nenhum agendamento selecionado.", "warning");
            return;
        }

        const indices = Array.from(checkboxes)
            .map(cb => parseInt(cb.value))
            .sort((a, b) => b - a);

        indices.forEach(index => {
            const agendamentoCancelado = agendamentos[index];
            adicionarNotificacao(
                "Cancelamento de Agendamento",
                `Agendamento cancelado: ${formatarData(agendamentoCancelado.data)} - ${agendamentoCancelado.horario} - Professor ${agendamentoCancelado.professor}`
            );
            agendamentos.splice(index, 1);
        });

        if (!salvarAgendamentos()) {
            return; // Não continua se falhar ao salvar
        }

        mostrarMensagem("Agendamentos selecionados foram cancelados com sucesso.", "success");

        const modal = bootstrap.Modal.getInstance(document.getElementById("cancelModal"));
        modal.hide();
        atualizarStatus();

        // Atualizar informações do laboratório
        atualizarInformacoesLaboratorio(labGlobal);
    } catch (error) {
        console.error("Erro ao cancelar agendamentos:", error);
        mostrarMensagem("Ocorreu um erro ao cancelar os agendamentos.", "danger");
    }
};

// Função para mostrar confirmação de novo agendamento
function showConfirmAgendamento() {
    try {
        const confirmModalElement = document.getElementById("confirmAgendamentoModal");
        if (!confirmModalElement) {
            console.error("Modal de confirmação não encontrado");
            return;
        }

        // Verificar se o Bootstrap está disponível
        if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
            console.error("Bootstrap Modal não está disponível");
            alert("Agendamento realizado com sucesso!");
            return;
        }

        const confirmModal = new bootstrap.Modal(confirmModalElement);
        confirmModal.show();

        const btnSim = document.getElementById("btnSim");
        if (btnSim) {
            btnSim.addEventListener("click", function () {
                const dataInput = document.getElementById("dataAgendamento");
                if (dataInput) dataInput.value = "";
                confirmModal.hide();
            }, { once: true });
        } else {
            console.warn("Botão 'Sim' não encontrado no modal de confirmação");
        }
    } catch (error) {
        console.error("Erro ao mostrar modal de confirmação:", error);
        // Fallback simples em caso de erro
        alert("Agendamento realizado com sucesso!");
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log('DOM carregado, iniciando aplicação...');

        // Inicializar dados de exemplo se necessário
        try {
            inicializarDadosExemplo();
        } catch (error) {
            console.error("Erro ao inicializar dados de exemplo:", error);
        }

        // Carregar dados
        try {
            carregarDados();
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            mostrarMensagem("Ocorreu um erro ao carregar os dados dos laboratórios.", "danger");
        }

        // Adicionar efeito de ripple aos botões
        try {
            addRippleEffect();
        } catch (error) {
            console.error("Erro ao adicionar efeito ripple:", error);
        }

        // Adicionar evento para o botão de trocar laboratório
        const changeLabBtn = document.querySelector('.btn-change-lab');
        if (changeLabBtn) {
            changeLabBtn.addEventListener('click', () => {
                try {
                    showLabSelectionOverlay();
                } catch (error) {
                    console.error("Erro ao mostrar seleção de laboratórios:", error);
                    mostrarMensagem("Não foi possível mostrar a seleção de laboratórios.", "warning");
                }
            });
        } else {
            console.warn("Botão de troca de laboratório não encontrado");
        }

        // Verificar Bootstrap
        if (typeof bootstrap === 'undefined') {
            console.warn("Bootstrap não encontrado. Alguns recursos podem não funcionar corretamente.");
        }

    } catch (error) {
        console.error("Erro crítico na inicialização da aplicação:", error);
        // Tentar mostrar alguma mensagem para o usuário
        try {
            alert("Ocorreu um erro ao inicializar a aplicação. Por favor, recarregue a página.");
        } catch (e) {
            // Em caso de falha completa, pelo menos logamos o erro
        }
    }
});
