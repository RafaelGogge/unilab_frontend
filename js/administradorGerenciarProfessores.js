/* 
    Autor: Rafael V. Gogge
    Copyright © 2025 Rafael V. Gogge
    Projeto: UniLab - Sistema de Gerenciamento de Laboratórios
*/

(function () {
    const k = ["keydown", "ctrlKey", "shiftKey", "metaKey", "key", "toLowerCase", "preventDefault"];
    const b = ["f12", "u", "i", "j", "c", "r", "p", "s"];
    document.addEventListener(k[0], function (e) {
        const ctrl = e[k[1]], shift = e[k[2]], meta = e[k[3]], key = e[k[4]].toLowerCase();
        if (
            e[k[4]].toLowerCase() === b[0] ||
            (ctrl && b.includes(key)) ||
            (ctrl && shift && b.includes(key)) ||
            (meta && shift && b.includes(key))
        ) {
            e[k[6]]();
        }
    });
})();

// Variáveis e constantes globais
let professorModalInstance;
let professores = [];

// Constantes para uso no localStorage
const STORAGE_KEYS = {
    PROFESSORES: 'professores',
    AUTH: 'isAuthenticated',
    ROLE: 'userRole',
    NAME: 'userName',
    REMEMBER: 'rememberMe',
    USERNAME: 'username'
};

// Verificar autenticação quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    loadProfessores();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Formulário de filtros
    document.getElementById('filterForm').addEventListener('submit', function (e) {
        e.preventDefault();
        filterProfessores();
    });

    // Botão de novo professor (no cabeçalho)
    document.getElementById('novoProfessor').addEventListener('click', function () {
        openProfessorModal();
    });

    // Botão flutuante de novo professor
    document.getElementById('btnNovoProfessor').addEventListener('click', function () {
        openProfessorModal();
    });

    // Botão de salvar no modal
    document.getElementById('salvarProfessor').addEventListener('click', function () {
        saveProfessor();
    });

    // Botão de limpar filtros
    document.querySelector('button[type="reset"]').addEventListener('click', function () {
        clearFilters();
    });

    // Botão de logout
    document.querySelector('.logout-button').addEventListener('click', function (e) {
        e.preventDefault();
        logout();
    });
}

// Verificar autenticação
function checkAuth() {
    const isAuthenticated = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    const userRole = localStorage.getItem(STORAGE_KEYS.ROLE);

    if (!isAuthenticated || userRole !== 'administrador') {
        if (isAuthenticated && userRole !== 'administrador') {
            sessionStorage.setItem('redirectMessage', 'Você não tem permissão para acessar a página de gerenciamento de professores.');
            sessionStorage.setItem('redirectMessageType', 'danger');
        }
        window.location.href = 'sejaBemVindo.html';
        return;
    }

    const userName = localStorage.getItem(STORAGE_KEYS.NAME);
    const userNameElement = document.querySelector('.user-name');
    if (userName && userNameElement) {
        userNameElement.textContent = userName;
    }
}

// Inicializar a estrutura dos professores se necessário
function initializeProfessores() {
    localStorage.removeItem(STORAGE_KEYS.PROFESSORES);
    professores = [];
}

// Carregar professores
function loadProfessores() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PROFESSORES);
        professores = data ? JSON.parse(data) : [];
        updateStatistics(professores);
        displayProfessores(professores);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados de professores.', 'danger');
        professores = [];
        displayProfessores([]);
    }
}

// Atualizar estatísticas
function updateStatistics(profs) {
    const total = profs.length;
    const ativos = profs.filter(prof => prof.status === 'ativo').length;
    const inativos = profs.filter(prof => prof.status === 'inativo').length;

    // Contar departamentos únicos
    const departamentos = [...new Set(profs.map(prof => prof.departamento))];
    const totalDepartamentos = departamentos.length;

    document.getElementById('totalProfessores').textContent = total;
    document.getElementById('professoresAtivos').textContent = ativos;
    document.getElementById('professoresInativos').textContent = inativos;
    document.getElementById('totalDepartamentos').textContent = totalDepartamentos;
}

// Exibir professores na tabela
function displayProfessores(profs) {
    const tbody = document.getElementById('professoresTable');
    tbody.innerHTML = '';

    if (profs.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center">Nenhum professor encontrado</td>`;
        tbody.appendChild(tr);
        return;
    }

    profs.forEach(prof => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prof.nome || ''}</td>
            <td>${prof.email || ''}</td>
            <td>${prof.matricula || ''}</td>
            <td>${formatDepartamento(prof.departamento || 'outro')}</td>
            <td><span class="status-badge status-${prof.status || 'inativo'}">${formatStatus(prof.status || 'inativo')}</span></td>
            <td>
                <button class="btn-action" onclick="editProfessor('${prof.id}')" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-action" onclick="deleteProfessor('${prof.id}')" title="Excluir">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn-action" onclick="showPassword('${prof.id}')" title="Mostrar Senha">
                    <i class="bi bi-key"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtrar professores
function filterProfessores() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const departamento = document.getElementById('departamentoFilter').value;

    let filteredProfs = professores.filter(prof => {
        const matchesSearch = (prof.nome || '').toLowerCase().includes(searchTerm) ||
            (prof.email || '').toLowerCase().includes(searchTerm) ||
            (prof.matricula || '').toLowerCase().includes(searchTerm);
        const matchesStatus = !status || prof.status === status;
        const matchesDepartamento = !departamento || prof.departamento === departamento;

        return matchesSearch && matchesStatus && matchesDepartamento;
    });

    displayProfessores(filteredProfs);
}

// Limpar filtros
function clearFilters() {
    document.getElementById('filterForm').reset();
    loadProfessores();
}

// Abrir modal de professor
function openProfessorModal(profId = null) {
    const modal = new bootstrap.Modal(document.getElementById('professorModal'));
    const form = document.getElementById('professorForm');
    const title = document.querySelector('#professorModal .modal-title');

    form.reset();
    if (profId) {
        title.innerHTML = '<i class="bi bi-person-gear"></i> Editar Professor';
        const prof = getProfessorById(profId);
        if (prof) {
            form.nome.value = prof.nome || '';
            form.email.value = prof.email || '';
            form.matricula.value = prof.matricula || '';
            form.departamento.value = prof.departamento || 'computacao';
            form.status.value = prof.status || 'ativo';
            form.dataset.profId = profId;
        }
    } else {
        title.innerHTML = '<i class="bi bi-person-plus"></i> Novo Professor';
        delete form.dataset.profId;
    }

    modal.show();
}

// Salvar professor
function saveProfessor() {
    const form = document.getElementById('professorForm');
    const profId = form.dataset.profId;
    const email = form.email.value.trim().toLowerCase();

    // Validar e-mail
    if (!validateEmail(email)) {
        showNotification('Por favor, insira um e-mail válido.', 'danger');
        return;
    }

    const prof = {
        id: profId || generateId(),
        nome: form.nome.value.trim().toUpperCase(),
        email: email,
        matricula: form.matricula.value.trim() || generateMatricula(),
        departamento: form.departamento.value,
        status: form.status.value,
        senha: profId ? getProfessorById(profId).senha : generatePassword()
    };

    if (!validateProfessor(prof)) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'danger');
        return;
    }

    // Verificar se o e-mail já existe (exceto para o próprio professor em edição)
    const emailExists = professores.some(p => p.email === prof.email && p.id !== prof.id);
    if (emailExists) {
        showNotification('Este e-mail já está sendo utilizado por outro professor.', 'warning');
        return;
    }

    if (profId) {
        professores = professores.map(p => p.id === profId ? prof : p);
    } else {
        professores.push(prof);
    }

    try {
        localStorage.setItem(STORAGE_KEYS.PROFESSORES, JSON.stringify(professores));

        const modalEl = document.getElementById('professorModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        loadProfessores();
        showNotification(`Professor ${profId ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showNotification('Erro ao salvar dados. Verifique o console para mais detalhes.', 'danger');
    }
}

// Editar professor
window.editProfessor = function (profId) {
    openProfessorModal(profId);
}

// Excluir professor
window.deleteProfessor = function (profId) {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
        professores = professores.filter(prof => prof.id !== profId);
        localStorage.setItem('professores', JSON.stringify(professores));
        loadProfessores();
        showNotification('Professor excluído com sucesso!', 'success');
    }
}

// Mostrar senha do professor
window.showPassword = function (profId) {
    const prof = getProfessorById(profId);
    if (prof) {
        alert(`Senha do professor ${prof.nome}: ${prof.senha}`);
    }
}

// Funções auxiliares
function getProfessorById(profId) {
    return professores.find(prof => prof.id === profId);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Gera uma senha aleatória com 10 caracteres
function generatePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
    let password = "";
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Gera uma matrícula aleatória
function generateMatricula() {
    const ano = new Date().getFullYear();
    const num = Math.floor(Math.random() * 900000) + 100000; // 6 dígitos
    return `${ano}${num}`;
}

// Validação de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validação completa do professor
function validateProfessor(prof) {
    return prof.nome &&
        prof.email &&
        validateEmail(prof.email) &&
        prof.matricula &&
        prof.departamento &&
        prof.status;
}

function formatStatus(status) {
    const statusMap = {
        'ativo': 'Ativo',
        'inativo': 'Inativo'
    };
    return statusMap[status] || status;
}

function formatDepartamento(departamento) {
    const deptoMap = {
        'computacao': 'Computação',
        'fisica': 'Física',
        'quimica': 'Química',
        'matematica': 'Matemática',
        'outro': 'Outro'
    };
    return deptoMap[departamento] || departamento;
}

// Sistema de notificações otimizado
function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.setAttribute('aria-atomic', 'true');

        // Estilos aplicados uma vez
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '5000'
        });

        document.body.appendChild(notification);
    }

    // Atualizar classe e conteúdo
    notification.className = `toast align-items-center text-white bg-${type} border-0`;
    notification.innerHTML = `
        <div class="d-flex">
            <div class="toast-body" id="notificationBody">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
        </div>
    `;

    try {
        const toast = new bootstrap.Toast(notification, { delay: 5000 });
        toast.show();
    } catch (e) {
        console.error('Erro ao mostrar notificação:', e);
        alert(message);
    }
}

// Logout seguro
function logout() {
    // Remover todos os itens relacionados à autenticação
    [
        STORAGE_KEYS.AUTH,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.NAME,
        STORAGE_KEYS.REMEMBER,
        STORAGE_KEYS.USERNAME
    ].forEach(key => localStorage.removeItem(key));

    // Redirecionar para a página de login
    window.location.href = 'index.html';
}
