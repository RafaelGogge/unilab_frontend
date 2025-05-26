/* 
    Autor: Rafael V. Gogge
    Copyright © 2025 Rafael V. Gogge
    Projeto: UniLab - Sistema de Gerenciamento de Laboratórios
    Refatorado com animações avançadas
*/

// Função para abrir o modal de configurações
function openConfigModal() {
    const configModal = new bootstrap.Modal(document.getElementById('configModal'));
    configModal.show();
}

// Função para animar contadores
function animateCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
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
}

// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    // Adicionar classe 'loaded' ao body para fade-in inicial
    setTimeout(() => {
        document.body.classList.add('loaded');
        document.body.classList.add('opacity-100');
    }, 100);

    // Seleção de elementos do DOM
    const actionCards = document.querySelectorAll('.action-card');
    const fadeElements = document.querySelectorAll('.fade-up-element, .slide-in-left, .slide-in-right, .zoom-in-element');
    const notificationBell = document.querySelector('.notification-bell');
    const notificationModal = document.getElementById('notificationModal');
    const userDropdown = document.getElementById('userDropdown');
    const userNameElement = document.querySelector('.user-name');
    const logoutButton = document.querySelector('.logout-button');
    const notificationList = document.querySelector('.notification-list');
    const navbar = document.getElementById('navbar');

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
                feedback.remove();
            }, 300);
        }, 5000);
    }

    // Função para verificar autenticação
    function checkAuth() {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');

        if (!isAuthenticated) {
            window.location.href = 'index.html';
            return;
        }

        // Atualizar nome do usuário
        if (userName) {
            userNameElement.textContent = userName;
        }

        // Controlar visibilidade dos cards baseado no papel do usuário
        const managementCards = document.querySelectorAll('[data-action="manage-professors"], [data-action="manage-labs"]');
        managementCards.forEach(card => {
            if (userRole !== 'administrador') {
                card.style.display = 'none';
            }
        });
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
    notificationBell.addEventListener('click', function () {
        // Marcar notificações como lidas
        this.querySelector('.notification-badge').style.display = 'none';
        // Simular carregamento de notificações
        simulateNotifications();
    });

    // Event Listener para logout
    logoutButton.addEventListener('click', function (e) {
        e.preventDefault();

        // Efeito de clique
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);

        // Mostrar feedback
        showFeedback('Logout realizado com sucesso. Redirecionando...', 'info');

        // Limpar dados do usuário
        setTimeout(() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('username');

            // Redirecionar para página inicial
            window.location.href = 'index.html';
        }, 1500);
    });

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

    // Adicionar evento de scroll para mudar a navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Verificar autenticação ao carregar a página
    checkAuth();

    // Adicionar suporte para teclado em elementos com role="button"
    document.querySelectorAll('[role="button"]').forEach(function (button) {
        button.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });
});