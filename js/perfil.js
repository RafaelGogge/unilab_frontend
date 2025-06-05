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

    document.addEventListener('DOMContentLoaded', function () {
        // Verificar disponibilidade do Bootstrap
        if (typeof bootstrap === 'undefined' && typeof window.bootstrap === 'undefined') {
            console.warn("Bootstrap não encontrado. Algumas funcionalidades podem não funcionar corretamente.");
        }

        // Referência segura ao Bootstrap
        const bootstrapRef = window.bootstrap || bootstrap || {};

        // Elementos do DOM com verificação de existência
        const profileForm = document.getElementById('profileForm');
        const avatarModal = document.getElementById('avatarModal');
        const saveAvatarBtn = document.getElementById('saveAvatarBtn');
        const avatarItems = document.querySelectorAll('.avatar-item');
        const currentAvatarImg = document.getElementById('currentAvatarImg');
        const headerAvatarImg = document.getElementById('headerAvatarImg');

        // Verificar elementos críticos
        if (!profileForm) {
            console.error("Formulário de perfil não encontrado!");
            return; // Sair da função se o formulário não existir
        }

        // Variável para armazenar o avatar selecionado
        let selectedAvatar = null;

        // Inicialização segura dos previewAvatars
        const previewAvatars = {
            default: document.getElementById('previewAvatar'),
            bio: document.getElementById('previewAvatarBio'),
            fis: document.getElementById('previewAvatarFis'),
            quim: document.getElementById('previewAvatarQuim')
        };

        // Função para carregar os dados do perfil com tratamento de erros
        function loadProfileData() {
            try {
                // Aqui você faria uma chamada à API para carregar os dados do usuário
                // Por enquanto, vamos simular com dados estáticos
                const userData = {
                    name: 'Rafael Gogge',
                    email: 'rafaelgogge@souunisales.com.br',
                    matricula: '123456',
                    departamento: 'computacao',
                    status: 'ativo',
                    avatar: 'imagens/avatares/computacao/computacao-1.png'
                };

                // Preenche os campos do formulário com verificação de existência
                const userNameInput = document.getElementById('userName');
                const userEmailInput = document.getElementById('userEmail');
                const userMatriculaInput = document.getElementById('userMatricula');
                const userDepartamentoInput = document.getElementById('userDepartamento');
                const userStatusInput = document.getElementById('userStatus');

                if (userNameInput) userNameInput.value = userData.name;
                if (userEmailInput) userEmailInput.value = userData.email;
                if (userMatriculaInput) userMatriculaInput.value = userData.matricula;
                if (userDepartamentoInput) userDepartamentoInput.value = userData.departamento;
                if (userStatusInput) userStatusInput.value = userData.status;

                // Atualiza as imagens de avatar com verificação
                if (currentAvatarImg) currentAvatarImg.src = userData.avatar;
                if (headerAvatarImg) headerAvatarImg.src = userData.avatar;
            } catch (error) {
                console.error("Erro ao carregar dados do perfil:", error);
                showNotification("Ocorreu um erro ao carregar seus dados.", "danger");
            }
        }

        // Função para salvar os dados do perfil com tratamento de erros
        function saveProfileData(event) {
            event.preventDefault();

            try {
                // Validação do formulário com feedback visual
                let isValid = true;
                const requiredFields = document.querySelectorAll('[required]');

                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        field.classList.add('is-invalid');
                        isValid = false;
                    } else {
                        field.classList.remove('is-invalid');
                        field.classList.add('is-valid');
                    }
                });

                if (!isValid) {
                    showNotification('Por favor, preencha todos os campos obrigatórios.', 'warning');
                    return;
                }

                // Coleta dados com verificação
                const userName = document.getElementById('userName');
                const userEmail = document.getElementById('userEmail');
                const userMatricula = document.getElementById('userMatricula');
                const userDepartamento = document.getElementById('userDepartamento');
                const userStatus = document.getElementById('userStatus');

                const formData = {
                    name: userName ? userName.value : '',
                    email: userEmail ? userEmail.value : '',
                    matricula: userMatricula ? userMatricula.value : '',
                    departamento: userDepartamento ? userDepartamento.value : '',
                    status: userStatus ? userStatus.value : ''
                };

                // Aqui você faria uma chamada à API para salvar os dados
                console.log('Dados a serem salvos:', formData);

                // Simula sucesso no salvamento
                showNotification('Perfil atualizado com sucesso!', 'success');

                // Adiciona animação de sucesso aos campos
                requiredFields.forEach(field => {
                    field.classList.add('is-valid');
                    setTimeout(() => {
                        field.classList.remove('is-valid');
                    }, 3000);
                });
            } catch (error) {
                console.error("Erro ao salvar dados do perfil:", error);
                showNotification("Ocorreu um erro ao salvar seus dados.", "danger");
            }
        }

        // Função para selecionar um avatar com preview instantâneo
        function selectAvatar(event) {
            try {
                if (!event || !event.currentTarget) return;

                const avatarItem = event.currentTarget;
                const avatarImage = avatarItem.querySelector('img');
                if (!avatarImage) return;

                const tabPane = avatarItem.closest('.tab-pane');
                if (!tabPane) return;

                const tabId = tabPane.id;

                // Remove a seleção anterior
                document.querySelectorAll('.avatar-item.selected').forEach(item => {
                    item.classList.remove('selected');
                });

                // Adiciona a seleção ao avatar clicado com efeito visual
                avatarItem.classList.add('selected');

                // Efeito sonoro leve (se permitido pelo navegador)
                try {
                    const audio = new Audio('sons/click.mp3');
                    audio.volume = 0.2;
                    audio.play().catch(e => {
                        // Silenciosamente ignorar erros de áudio
                        // Muitos navegadores bloqueiam áudio automático
                    });
                } catch (e) {
                    // Ignorar erros de áudio
                }

                // Anima o preview
                const previewKey = tabId === 'computacao' ? 'default' : tabId.charAt(0).toUpperCase() + tabId.slice(1, 3).toLowerCase();
                const previewImg = previewAvatars[previewKey];

                if (previewImg) {
                    // Efeito de fade out
                    previewImg.style.opacity = '0';

                    // Após fade out, muda a imagem e faz fade in
                    setTimeout(() => {
                        previewImg.src = avatarImage.src;
                        previewImg.style.opacity = '1';
                    }, 300);
                }

                selectedAvatar = avatarImage.src;

                // Efeito de pulsação no botão de salvar
                if (saveAvatarBtn) {
                    saveAvatarBtn.classList.add('btn-pulse');
                }
            } catch (error) {
                console.error("Erro ao selecionar avatar:", error);
            }
        }

        // Função para salvar o avatar selecionado
        function saveSelectedAvatar() {
            try {
                if (selectedAvatar && currentAvatarImg && headerAvatarImg) {
                    currentAvatarImg.src = selectedAvatar;
                    headerAvatarImg.src = selectedAvatar;

                    // Animação de transição suave
                    currentAvatarImg.classList.add('scale-in-center');
                    headerAvatarImg.classList.add('scale-in-center');

                    setTimeout(() => {
                        currentAvatarImg.classList.remove('scale-in-center');
                        headerAvatarImg.classList.remove('scale-in-center');
                    }, 500);

                    // Aqui você faria uma chamada à API para salvar o avatar
                    showNotification('Avatar atualizado com sucesso!', 'success');

                    // Fecha o modal com verificação segura do Bootstrap
                    if (avatarModal && bootstrapRef.Modal) {
                        const modal = bootstrapRef.Modal.getInstance(avatarModal);
                        if (modal) modal.hide();
                    }

                    // Remove o efeito de pulsação
                    if (saveAvatarBtn) {
                        saveAvatarBtn.classList.remove('btn-pulse');
                    }

                    // Mostra mensagem de agradecimento
                    showThankYouMessage();
                }
            } catch (error) {
                console.error("Erro ao salvar avatar selecionado:", error);
                showNotification("Ocorreu um erro ao atualizar seu avatar.", "danger");
            }
        }

        // Função unificada para mostrar mensagem de agradecimento
        function showThankYouMessage() {
            try {
                const speechBubble = document.querySelector('.avatar-speech-bubble');
                if (!speechBubble) return;

                // Número aleatório entre 1 e 12
                const randomNum = Math.floor(Math.random() * 12) + 1;

                // Remove todas as classes de mensagem anteriores
                for (let i = 1; i <= 12; i++) {
                    speechBubble.classList.remove(`message-${i}`);
                }

                // Adiciona uma mensagem aleatória
                speechBubble.classList.add(`message-${randomNum}`);

                // Mostra o balão
                speechBubble.classList.add('show');

                // Esconde após 5 segundos
                setTimeout(() => {
                    speechBubble.classList.remove('show');
                }, 5000);
            } catch (error) {
                console.error("Erro ao mostrar mensagem de agradecimento:", error);
            }
        }

        // Função para mostrar notificações
        function showNotification(message, type = 'success') {
            try {
                // Implementação de notificação toast
                const toastContainer = document.createElement('div');
                toastContainer.className = `toast-container position-fixed bottom-0 end-0 p-3`;

                const toast = document.createElement('div');
                toast.className = `toast bg-${type} text-white`;
                toast.setAttribute('role', 'alert');
                toast.setAttribute('aria-live', 'assertive');
                toast.setAttribute('aria-atomic', 'true');

                toast.innerHTML = `
                    <div class="toast-header bg-${type} text-white">
                        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                        <strong class="me-auto">UniLab</strong>
                        <small>Agora</small>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                `;

                toastContainer.appendChild(toast);
                document.body.appendChild(toastContainer);

                // Verificar se o Bootstrap está disponível
                if (bootstrapRef.Toast) {
                    const bsToast = new bootstrapRef.Toast(toast);
                    bsToast.show();
                } else {
                    // Fallback se o Bootstrap não estiver disponível
                    toast.style.display = 'block';
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 5000);
                }

                // Remover após fechar
                toast.addEventListener('hidden.bs.toast', function () {
                    if (document.body.contains(toastContainer)) {
                        document.body.removeChild(toastContainer);
                    }
                });
            } catch (error) {
                console.error("Erro ao mostrar notificação:", error);
                // Fallback para alert em caso de erro na notificação
                alert(`${type.toUpperCase()}: ${message}`);
            }
        }

        // Função para resetar o formulário
        window.resetForm = function () {
            try {
                if (profileForm) {
                    profileForm.reset();
                    document.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
                        field.classList.remove('is-valid', 'is-invalid');
                    });
                    loadProfileData();
                    showNotification('Formulário resetado!', 'info');
                }
            } catch (error) {
                console.error("Erro ao resetar formulário:", error);
                showNotification("Ocorreu um erro ao resetar o formulário.", "warning");
            }
        };

        // Event Listeners com verificação de existência
        if (profileForm) {
            profileForm.addEventListener('submit', saveProfileData);
        }

        if (saveAvatarBtn) {
            saveAvatarBtn.addEventListener('click', saveSelectedAvatar);
        }

        if (avatarItems && avatarItems.length > 0) {
            avatarItems.forEach(item => {
                item.addEventListener('click', selectAvatar);
            });
        }

        // Reset da seleção quando o modal é fechado
        if (avatarModal) {
            avatarModal.addEventListener('hidden.bs.modal', function () {
                try {
                    document.querySelectorAll('.avatar-item.selected').forEach(item => {
                        item.classList.remove('selected');
                    });
                    selectedAvatar = null;
                    if (saveAvatarBtn) saveAvatarBtn.classList.remove('btn-pulse');
                } catch (error) {
                    console.error("Erro ao resetar seleção do modal:", error);
                }
            });
        }

        // Carrega os dados iniciais
        loadProfileData();

        // Animação de entrada da página
        if (document.body) {
            document.body.classList.remove('opacity-0');
        }

        // Adiciona efeito de flutuação aos cards estatísticos
        document.querySelectorAll('.stat-card').forEach(card => {
            if (card) card.classList.add('float-effect');
        });

        // Inicializa tooltips com verificação do Bootstrap
        if (bootstrapRef.Tooltip) {
            document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => {
                try {
                    new bootstrapRef.Tooltip(tooltipTriggerEl);
                } catch (error) {
                    console.warn("Erro ao inicializar tooltip:", error);
                }
            });
        }

        // Ajusta o layout baseado no tamanho da tela
        adjustLayoutForScreenSize();
    });

    // Função para alternar o modo escuro
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        // Salva a preferência do usuário
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    // Verifica se o modo escuro estava ativo
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Função para exportar os dados do usuário
    window.exportUserData = function () {
        // Coleta os dados do usuário
        const userData = {
            nome: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            matricula: document.getElementById('userMatricula').value,
            departamento: document.getElementById('userDepartamento').value,
            status: document.getElementById('userStatus').value,
            avatar: currentAvatarImg.src,
            estatisticas: {
                agendamentos: 12,
                horasReservadas: 36,
                labsUtilizados: 5
            },
            ultimaAtualizacao: '15 de maio de 2025'
        };

        // Converte para JSON
        const dataStr = JSON.stringify(userData, null, 2);

        // Cria um objeto Blob
        const blob = new Blob([dataStr], { type: 'application/json' });

        // Cria um link temporário
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meus_dados_unilab.json';

        // Simula um clique no link
        document.body.appendChild(a);
        a.click();

        // Limpa
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Dados exportados com sucesso!', 'success');
        }, 100);
    };

    // Adicionando funções para melhorar a responsividade

    // Ajustar layout baseado no tamanho da tela
    function adjustLayoutForScreenSize() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;

        // Ajusta tamanho das grades de avatar para diferentes tamanhos de tela
        const avatarGrids = document.querySelectorAll('.avatar-selection-grid');
        avatarGrids.forEach(grid => {
            if (isMobile) {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(60px, 1fr))';
            } else if (isTablet) {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(75px, 1fr))';
            } else {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
            }
        });

        // Ajusta o preview do avatar para diferentes tamanhos de tela
        const previewSelections = document.querySelectorAll('.current-selection');
        previewSelections.forEach(preview => {
            if (isMobile) {
                preview.style.width = '120px';
                preview.style.height = '120px';
            } else if (isTablet) {
                preview.style.width = '150px';
                preview.style.height = '150px';
            } else {
                preview.style.width = '180px';
                preview.style.height = '180px';
            }
        });
    }

    // Adiciona o listener para o redimensionamento da janela
    window.addEventListener('resize', adjustLayoutForScreenSize);

    // Inicializa o ajuste de layout quando a página carrega
    document.addEventListener('DOMContentLoaded', function () {
        // Melhora a experiência em dispositivos móveis para o modal
        const avatarModal = document.getElementById('avatarModal');
        if (avatarModal) {
            avatarModal.addEventListener('shown.bs.modal', function () {
                adjustLayoutForScreenSize();

                // Scroll suave para as abas em dispositivos móveis
                const tabsContainer = document.getElementById('avatarTabs');
                if (tabsContainer) {
                    tabsContainer.addEventListener('scroll', function (e) {
                        e.stopPropagation();
                    });

                    // Centralizar aba ativa no scroll horizontal
                    const activeTab = tabsContainer.querySelector('.nav-link.active');
                    if (activeTab && window.innerWidth < 768) {
                        const tabCenter = activeTab.offsetLeft + (activeTab.offsetWidth / 2);
                        const containerCenter = tabsContainer.offsetWidth / 2;
                        tabsContainer.scrollLeft = tabCenter - containerCenter;
                    }
                }
            });
        }
    });
})();
