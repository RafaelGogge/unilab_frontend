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
        console.error("Erro na inicialização da proteção contra teclas de desenvolvedor:", error);
    }

    document.addEventListener('DOMContentLoaded', function () {
        try {
            // Menu mobile - com verificação de elementos
            const menuToggle = document.querySelector('.menu-toggle');
            const sidebar = document.querySelector('.sidebar');

            if (menuToggle && sidebar) {
                menuToggle.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });

                // Fechar menu ao clicar fora - com verificação de elementos
                document.addEventListener('click', (e) => {
                    if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                });
            } else {
                console.warn("Elementos de menu não encontrados");
            }

            // Navegação suave - com tratamento de erros
            try {
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        if (!targetId) return;

                        const target = document.querySelector(targetId);
                        if (target) {
                            target.scrollIntoView({
                                behavior: 'smooth'
                            });
                            // Fecha o menu mobile após clicar
                            if (sidebar) sidebar.classList.remove('active');
                        }
                    });
                });
            } catch (error) {
                console.error("Erro na configuração da navegação suave:", error);
            }

            // Tema escuro - com verificação de elementos
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    document.body.classList.toggle('dark-theme');
                    const icon = themeToggle.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('bi-moon');
                        icon.classList.toggle('bi-sun');
                    }
                });
            }

            // Busca - com verificação de elementos e tratamento de erros
            const searchBar = document.querySelector('.search-bar');
            if (searchBar) {
                searchBar.addEventListener('input', (e) => {
                    try {
                        const searchTerm = e.target.value.toLowerCase();
                        const sections = document.querySelectorAll('section');

                        sections.forEach(section => {
                            const text = section.textContent.toLowerCase();
                            section.style.display = text.includes(searchTerm) ? 'block' : 'none';
                        });
                    } catch (error) {
                        console.error("Erro na funcionalidade de busca:", error);
                    }
                });
            }

            // Gerar menu de navegação - com verificação de elementos e tratamento de erros
            const nav = document.querySelector('.nav-menu');
            const headings = document.querySelectorAll('main h2');

            if (nav && headings.length > 0) {
                try {
                    headings.forEach(heading => {
                        if (!heading.textContent) return;

                        const id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        heading.id = id;

                        const link = document.createElement('a');
                        link.href = `#${id}`;
                        link.textContent = heading.textContent;
                        link.className = 'nav-link';

                        const li = document.createElement('li');
                        li.appendChild(link);
                        nav.appendChild(li);
                    });
                } catch (error) {
                    console.error("Erro ao gerar menu de navegação:", error);
                }
            }

            // Scroll spy - com verificação de suporte ao IntersectionObserver
            if ('IntersectionObserver' in window) {
                try {
                    const observeHeadings = () => {
                        const observer = new IntersectionObserver(
                            (entries) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        document.querySelectorAll('.nav-link').forEach(link => {
                                            if (!link || !link.getAttribute) return;

                                            link.classList.remove('active');
                                            const href = link.getAttribute('href');
                                            if (href && href.slice(1) === entry.target.id) {
                                                link.classList.add('active');
                                            }
                                        });
                                    }
                                });
                            },
                            { threshold: 0.5 }
                        );

                        document.querySelectorAll('h2').forEach(heading => {
                            if (heading) observer.observe(heading);
                        });
                    };

                    observeHeadings();
                } catch (error) {
                    console.error("Erro na funcionalidade de scroll spy:", error);
                }
            } else {
                console.warn("IntersectionObserver não suportado neste navegador");
            }
        } catch (error) {
            console.error("Erro geral na inicialização:", error);
        }
    });
})();
