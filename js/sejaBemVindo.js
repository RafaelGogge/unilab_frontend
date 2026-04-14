/* 
    Autor: Rafael V. Gogge
    Copyright © 2025 Rafael V. Gogge
    Projeto: UniLab - Sistema de Gerenciamento de Laboratórios
*/
(function () {
    const SETTINGS_STORAGE_KEY = 'unilabUserSettings';

    // Prevenção de ferramentas de desenvolvedor com tratamento de erros
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
        console.error("Erro na proteção contra ferramentas de desenvolvedor:", error);
    }

    // Função para abrir o modal de configurações com tratamento de erros
    function openConfigModal() {
        try {
            const configModalElement = document.getElementById('configModal');
            if (!configModalElement) {
                console.error("Elemento 'configModal' não encontrado");
                return;
            }

            // Verificar se o Bootstrap está disponível
            if (typeof bootstrap === 'undefined' && typeof window.bootstrap === 'undefined') {
                console.error("Bootstrap não encontrado. O modal não pode ser aberto.");
                return;
            }

            const bootstrapRef = window.bootstrap || bootstrap;
            const configModal = new bootstrapRef.Modal(configModalElement);
            configModal.show();
        } catch (error) {
            console.error("Erro ao abrir modal de configurações:", error);
        }
    }

    window.openConfigModal = openConfigModal;

    function getDefaultSettings() {
        return {
            displayName: '',
            email: '',
            language: 'pt-BR',
            emailNotifications: true,
            systemAlerts: true,
            reminders: true,
            notificationSound: false,
            darkMode: true,
            highContrast: false,
            reduceMotion: false,
            fontSize: 'normal'
        };
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!raw) {
                return getDefaultSettings();
            }

            const parsed = JSON.parse(raw);
            return { ...getDefaultSettings(), ...parsed };
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return getDefaultSettings();
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return false;
        }
    }

    function applyVisualSettings(settings) {
        try {
            if (settings.darkMode) {
                document.body.classList.remove('light-mode');
            } else {
                document.body.classList.add('light-mode');
            }

            document.body.classList.toggle('high-contrast-mode', Boolean(settings.highContrast));
            document.body.classList.toggle('reduce-motion-mode', Boolean(settings.reduceMotion));

            const validSize = ['normal', 'large', 'x-large'].includes(settings.fontSize)
                ? settings.fontSize
                : 'normal';
            document.body.setAttribute('data-font-size', validSize);
        } catch (error) {
            console.error('Erro ao aplicar configurações visuais:', error);
        }
    }

    function fillSettingsForm(settings) {
        const mapping = {
            configDisplayName: settings.displayName,
            configEmail: settings.email,
            languageSelect: settings.language,
            notificationToggle: settings.emailNotifications,
            systemAlertToggle: settings.systemAlerts,
            reminderToggle: settings.reminders,
            soundToggle: settings.notificationSound,
            darkModeToggle: settings.darkMode,
            highContrastToggle: settings.highContrast,
            reduceMotionToggle: settings.reduceMotion,
            fontSizeSelect: settings.fontSize
        };

        Object.keys(mapping).forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;

            if (element.type === 'checkbox') {
                element.checked = Boolean(mapping[id]);
            } else {
                element.value = mapping[id];
            }
        });
    }

    function collectSettingsFromForm() {
        return {
            displayName: (document.getElementById('configDisplayName')?.value || '').trim(),
            email: (document.getElementById('configEmail')?.value || '').trim(),
            language: document.getElementById('languageSelect')?.value || 'pt-BR',
            emailNotifications: Boolean(document.getElementById('notificationToggle')?.checked),
            systemAlerts: Boolean(document.getElementById('systemAlertToggle')?.checked),
            reminders: Boolean(document.getElementById('reminderToggle')?.checked),
            notificationSound: Boolean(document.getElementById('soundToggle')?.checked),
            darkMode: Boolean(document.getElementById('darkModeToggle')?.checked),
            highContrast: Boolean(document.getElementById('highContrastToggle')?.checked),
            reduceMotion: Boolean(document.getElementById('reduceMotionToggle')?.checked),
            fontSize: document.getElementById('fontSizeSelect')?.value || 'normal'
        };
    }

    // Função para animar contadores com tratamento de erros
    function animateCounters() {
        try {
            const counters = document.querySelectorAll('.counter');
            if (!counters || counters.length === 0) {
                console.warn("Nenhum contador encontrado para animar");
                return;
            }

            counters.forEach(counter => {
                if (!counter || !counter.textContent) return;

                const targetText = counter.textContent.trim();
                if (!targetText) return;

                const target = parseInt(targetText);
                if (isNaN(target)) {
                    console.warn("Valor de contador inválido:", targetText);
                    return;
                }

                const duration = 2000; // 2 segundos
                const step = target / (duration / 30); // 30 é o intervalo do setInterval
                let current = 0;

                const updateCounter = () => {
                    if (current < target) {
                        current += step;
                        counter.textContent = Math.ceil(current);

                        if (current >= target) {
                            counter.textContent = target;
                            clearInterval(interval);
                        }
                    }
                };

                // Iniciar com zero
                counter.textContent = '0';

                // Atualizar a cada 30ms
                const interval = setInterval(updateCounter, 30);
            });
        } catch (error) {
            console.error("Erro ao animar contadores:", error);
        }
    }

    // Quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', function () {
        try {
            // Adicionar classe 'loaded' ao body para fade-in inicial
            setTimeout(() => {
                if (document.body) {
                    document.body.classList.add('loaded');
                    document.body.classList.add('opacity-100');
                }
            }, 100);

            // Seleção de elementos do DOM com verificação de existência
            const actionCards = document.querySelectorAll('.action-card');
            const fadeElements = document.querySelectorAll('.fade-up-element, .slide-in-left, .slide-in-right, .zoom-in-element');
            const notificationBell = document.querySelector('.notification-bell');
            const notificationModal = document.getElementById('notificationModal');
            const userDropdown = document.getElementById('userDropdown');
            const userNameElement = document.querySelector('.user-name');
            const logoutButton = document.querySelector('.logout-button');
            const notificationList = document.querySelector('.notification-list');
            const navbar = document.getElementById('navbar');
            const saveConfigBtn = document.getElementById('saveConfigBtn');
            const resetConfigBtn = document.getElementById('resetConfigBtn');
            const changePasswordBtn = document.getElementById('changePasswordBtn');
            const configModalElement = document.getElementById('configModal');
            const userName = localStorage.getItem('userName') || '';

            // Verificar elementos críticos
            if (!actionCards || actionCards.length === 0) {
                console.warn("Cards de ação não encontrados");
            }

            if (!logoutButton) {
                console.warn("Botão de logout não encontrado");
            }

            if (!navbar) {
                console.warn("Navbar não encontrado");
            }

            // Verificar e exibir mensagens de redirecionamento
            const redirectMessage = sessionStorage.getItem('redirectMessage');
            const redirectMessageType = sessionStorage.getItem('redirectMessageType') || 'info';

            if (redirectMessage) {
                showFeedback(redirectMessage, redirectMessageType);
                // Limpar após exibir
                sessionStorage.removeItem('redirectMessage');
                sessionStorage.removeItem('redirectMessageType');
            }

            // Função para mostrar feedback com animação
            function showFeedback(message, type = 'success') {
                try {
                    const feedback = document.createElement('div');
                    feedback.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
                    feedback.style.zIndex = '9999';
                    feedback.style.opacity = '0';
                    feedback.style.transform = 'translateY(-20px)';
                    feedback.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                    feedback.innerHTML = `
              ${message}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `;
                    document.body.appendChild(feedback);

                    // Animar entrada
                    setTimeout(() => {
                        feedback.style.opacity = '1';
                        feedback.style.transform = 'translateY(0)';
                    }, 10);

                    // Remover feedback após 5 segundos
                    setTimeout(() => {
                        feedback.style.opacity = '0';
                        feedback.style.transform = 'translateY(-20px)';

                        setTimeout(() => {
                            if (feedback.parentNode) {
                                feedback.parentNode.removeChild(feedback);
                            }
                        }, 300);
                    }, 5000);
                } catch (error) {
                    console.error("Erro ao mostrar feedback:", error);
                }
            }

            function initializeSettings() {
                const settings = loadSettings();
                if (!settings.displayName && userName) {
                    settings.displayName = userName;
                }

                fillSettingsForm(settings);
                applyVisualSettings(settings);
            }

            // Função para verificar autenticação
            function checkAuth() {
                try {
                    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                    const userRole = localStorage.getItem('userRole');
                    const userName = localStorage.getItem('userName');

                    if (!isAuthenticated) {
                        window.location.href = 'index.html';
                        return;
                    }

                    // Atualizar nome do usuário
                    if (userName && userNameElement) {
                        userNameElement.textContent = userName;
                    }

                    // Controlar visibilidade dos cards baseado no papel do usuário
                    const managementCards = document.querySelectorAll('[data-action="manage-professors"], [data-action="manage-labs"]');
                    if (managementCards && managementCards.length > 0) {
                        managementCards.forEach(card => {
                            if (userRole !== 'administrador' && card) {
                                card.style.display = 'none';
                            }
                        });
                    }
                } catch (error) {
                    console.error("Erro na verificação de autenticação:", error);
                    // Em caso de erro, redirecionar para login como precaução de segurança
                    window.location.href = 'index.html';
                }
            }

            // Adicionar event listeners para os cards de ação
            actionCards.forEach(card => {
                card.addEventListener('click', function () {
                    const action = this.getAttribute('data-action');
                    const userRole = localStorage.getItem('userRole');

                    // Verificar permissões para ações administrativas
                    if ((action === 'manage-professors' || action === 'manage-labs') && userRole !== 'administrador') {
                        showFeedback('Você não tem permissão para acessar esta funcionalidade.', 'danger');
                        return;
                    }

                    // Adicionar efeito de clique
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);

                    // Redirecionar baseado na ação
                    setTimeout(() => {
                        switch (action) {
                            case 'schedule':
                                window.location.href = 'agendamento_lab.html';
                                break;
                            case 'history':
                                window.location.href = 'historicoAgendamentos.html';
                                break;
                            case 'manage-professors':
                                window.location.href = 'administradorGerenciarProfessores.html';
                                break;
                            case 'manage-labs':
                                window.location.href = 'administradorGerenciarLaboratorios.html';
                                break;
                        }
                    }, 300);
                });

                // Suporte a teclado
                card.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });

            // Event Listener para o sino de notificações
            if (notificationBell) {
                notificationBell.addEventListener('click', function () {
                    const badge = this.querySelector('.notification-badge');
                    if (badge) {
                        badge.style.display = 'none';
                    }

                    simulateNotifications();
                });
            }

            // Event Listener para logout
            if (logoutButton) {
                logoutButton.addEventListener('click', function (e) {
                    e.preventDefault();

                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);

                    showFeedback('Logout realizado com sucesso. Redirecionando...', 'info');

                    setTimeout(() => {
                        localStorage.removeItem('isAuthenticated');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('rememberMe');
                        localStorage.removeItem('username');

                        window.location.href = 'index.html';
                    }, 1500);
                });
            }

            if (configModalElement) {
                configModalElement.addEventListener('show.bs.modal', () => {
                    fillSettingsForm(loadSettings());
                });
            }

            if (saveConfigBtn) {
                saveConfigBtn.addEventListener('click', () => {
                    const baseSettings = window.UnilabSettings?.loadSettings
                        ? window.UnilabSettings.loadSettings()
                        : loadSettings();

                    const newSettings = {
                        ...baseSettings,
                        ...collectSettingsFromForm()
                    };

                    if (newSettings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSettings.email)) {
                        showFeedback('Informe um email válido para salvar as configurações.', 'warning');
                        return;
                    }

                    const saved = window.UnilabSettings?.saveSettings
                        ? window.UnilabSettings.saveSettings(newSettings)
                        : saveSettings(newSettings);
                    if (!saved) {
                        showFeedback('Não foi possível salvar as configurações.', 'danger');
                        return;
                    }

                    if (newSettings.displayName) {
                        localStorage.setItem('userName', newSettings.displayName);
                        if (userNameElement) {
                            userNameElement.textContent = newSettings.displayName;
                        }
                    }

                    if (window.UnilabSettings?.applyVisualSettings) {
                        window.UnilabSettings.applyVisualSettings(newSettings);
                    } else {
                        applyVisualSettings(newSettings);
                    }
                    showFeedback('Configurações salvas com sucesso!', 'success');

                    const bootstrapRef = window.bootstrap || bootstrap;
                    const instance = bootstrapRef.Modal.getInstance(configModalElement);
                    if (instance) {
                        instance.hide();
                    }
                });
            }

            if (resetConfigBtn) {
                resetConfigBtn.addEventListener('click', () => {
                    const defaults = window.UnilabSettings?.getDefaultSettings
                        ? window.UnilabSettings.getDefaultSettings()
                        : getDefaultSettings();

                    defaults.displayName = localStorage.getItem('userName') || '';
                    fillSettingsForm(defaults);

                    if (window.UnilabSettings?.applyVisualSettings) {
                        window.UnilabSettings.applyVisualSettings(defaults);
                    } else {
                        applyVisualSettings(defaults);
                    }

                    if (window.UnilabSettings?.saveSettings) {
                        window.UnilabSettings.saveSettings(defaults);
                    } else {
                        saveSettings(defaults);
                    }

                    showFeedback('Configurações restauradas para o padrão.', 'info');
                });
            }

            if (changePasswordBtn) {
                changePasswordBtn.addEventListener('click', () => {
                    const newPassword = document.getElementById('newPassword')?.value || '';
                    const confirmPassword = document.getElementById('confirmPassword')?.value || '';

                    if (newPassword.length < 6) {
                        showFeedback('A nova senha deve ter pelo menos 6 caracteres.', 'warning');
                        return;
                    }

                    if (newPassword !== confirmPassword) {
                        showFeedback('A confirmação da senha não confere.', 'danger');
                        return;
                    }

                    showFeedback('Senha atualizada com sucesso!', 'success');
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                });
            }

            // Função para simular notificações
            function simulateNotifications() {
                const notifications = [
                    {
                        icon: 'bi-calendar-check',
                        title: 'Novo Agendamento',
                        description: 'Um novo agendamento foi realizado para o Laboratório de Informática.',
                        time: '5 minutos atrás'
                    },
                    {
                        icon: 'bi-exclamation-triangle',
                        title: 'Manutenção Programada',
                        description: 'O Laboratório de Química passará por manutenção amanhã.',
                        time: '1 hora atrás'
                    },
                    {
                        icon: 'bi-person-plus',
                        title: 'Novo Professor',
                        description: 'Um novo professor foi cadastrado no sistema.',
                        time: '2 horas atrás'
                    }
                ];

                // Limpar lista
                notificationList.innerHTML = '';

                // Adicionar notificações com animação
                notifications.forEach((notification, index) => {
                    const notificationItem = document.createElement('div');
                    notificationItem.className = 'notification-item';
                    notificationItem.style.opacity = '0';
                    notificationItem.style.transform = 'translateY(20px)';
                    notificationItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    notificationItem.style.transitionDelay = `${index * 0.1}s`;

                    notificationItem.innerHTML = `
              <div class="notification-icon">
                  <i class="bi ${notification.icon}"></i>
              </div>
              <div class="notification-content">
                  <h6>${notification.title}</h6>
                  <p>${notification.description}</p>
                  <small>${notification.time}</small>
              </div>
          `;

                    notificationList.appendChild(notificationItem);

                    // Animar entrada
                    setTimeout(() => {
                        notificationItem.style.opacity = '1';
                        notificationItem.style.transform = 'translateY(0)';
                    }, 10);
                });
            }

            // Adicionar animações scroll-triggered usando IntersectionObserver
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Adicionar delay baseado no atributo data-delay
                        const delay = entry.target.getAttribute('data-delay') || 0;

                        setTimeout(() => {
                            entry.target.classList.add('visible');

                            // Se for um contador, animar
                            if (entry.target.classList.contains('stats-section')) {
                                animateCounters();
                            }
                        }, delay);

                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observar todos os elementos com animações
            fadeElements.forEach(element => {
                observer.observe(element);
            });

            // Observar cards de ação
            actionCards.forEach(card => {
                observer.observe(card);
            });

            // Observar seção de estatísticas
            const statsSection = document.querySelector('.stats-section');
            if (statsSection) {
                observer.observe(statsSection);
            }

            initializeSettings();

            // Verificar autenticação ao carregar a página
            checkAuth();

            // Adicionar evento de scroll para mudar a navbar
            if (navbar) {
                window.addEventListener('scroll', () => {
                    try {
                        if (window.scrollY > 50) {
                            navbar.classList.add('scrolled');
                        } else {
                            navbar.classList.remove('scrolled');
                        }
                    } catch (error) {
                        console.error("Erro no evento de scroll:", error);
                    }
                });
            }

            // Adicionar suporte para teclado em elementos com role="button"
            document.querySelectorAll('[role="button"]').forEach(function (button) {
                if (button) {
                    button.addEventListener('keydown', function (event) {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            button.click();
                        }
                    });
                }
            });
        } catch (error) {
            console.error("Erro geral na inicialização:", error);
        }
    });
})(); // Fechamento adequado do IIFE
