/* 
    Autor: Rafael V. Gogge
    Copyright © 2025 Rafael V. Gogge
    Projeto: UniLab - Sistema de Gerenciamento de Laboratórios
*/

(function () {
    // Código revisado para prevenção de ferramentas de desenvolvedor
    // Isto pode estar causando erros em alguns navegadores ou conflitos com outras funcionalidades
    try {
        const keyActions = function(e) {
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
        };
        
        // Usar um event listener mais seguro
        document.addEventListener("keydown", keyActions);
    } catch (error) {
        console.error("Erro na inicialização da proteção:", error);
    }
    
    document.addEventListener("DOMContentLoaded", () => {
        // Seleção de elementos do DOM com verificação de existência
        const loginForm = document.getElementById("loginForm");
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const rememberMeCheckbox = document.getElementById("rememberMe");
        const passwordToggle = document.querySelector(".password-toggle");
        const feedback = document.getElementById("feedback");
        const recoveryForm = document.getElementById("recoveryForm");
        const recoveryEmail = document.getElementById("recoveryEmail");
        const sendRecoveryBtn = document.getElementById("sendRecovery");
        const loginBtn = document.querySelector(".btn-login");

        // Verificar se os elementos essenciais existem
        if (!loginForm || !usernameInput || !passwordInput || !feedback) {
            console.error("Elementos críticos do formulário não encontrados!");
            return; // Sair da função se elementos essenciais não existirem
        }

        // Estado do formulário
        let isSubmitting = false;

        // Função para mostrar feedback
        function showFeedback(message, type = "success") {
            if (!feedback) return;
            
            feedback.className = `alert alert-${type} alert-dismissible fade show`;
            feedback.innerHTML = `
              ${message}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            feedback.style.display = "block";

            // Adicionar animação de entrada
            feedback.style.animation = "none";
            feedback.offsetHeight; // Trigger reflow
            feedback.style.animation = "alertAppear 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

            // Remover alerta após 5 segundos
            setTimeout(() => {
                feedback.style.animation = "fadeOut 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards";
                setTimeout(() => {
                    feedback.style.display = "none";
                }, 500);
            }, 5000);
        }

        // Função para validar formulário com animações
        function validateForm() {
            let isValid = true;

            // Validar usuário
            if (!usernameInput.value.trim()) {
                usernameInput.classList.add("is-invalid");
                animateShake(usernameInput.parentElement);
                isValid = false;
            } else {
                usernameInput.classList.remove("is-invalid");
                usernameInput.classList.add("is-valid");
            }

            // Validar senha
            if (!passwordInput.value) {
                passwordInput.classList.add("is-invalid");
                animateShake(passwordInput.parentElement);
                isValid = false;
            } else {
                passwordInput.classList.remove("is-invalid");
                passwordInput.classList.add("is-valid");
            }

            return isValid;
        }

        // Função para animar elemento com efeito de shake
        function animateShake(element) {
            element.style.animation = "none";
            element.offsetHeight; // Trigger reflow
            element.style.animation = "shake 0.5s cubic-bezier(.36,.07,.19,.97) both";
            element.addEventListener(
                "animationend",
                () => {
                    element.style.animation = "";
                },
                { once: true },
            );
        }

        // Adicionar animação de shake
        if (!document.querySelector("#shakeKeyframes")) {
            const style = document.createElement("style");
            style.id = "shakeKeyframes";
            style.textContent = `
              @keyframes shake {
                  10%, 90% { transform: translate3d(-1px, 0, 0); }
                  20%, 80% { transform: translate3d(2px, 0, 0); }
                  30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
                  40%, 60% { transform: translate3d(3px, 0, 0); }
              }
              @keyframes fadeOut {
                  from { opacity: 1; transform: translateY(0); }
                  to { opacity: 0; transform: translateY(-10px); }
              }
          `;
            document.head.appendChild(style);
        }

        // Função para simular autenticação
        async function authenticate(username, password) {
            // Simular delay de rede
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Credenciais de teste
            if (username === "admin" && password === "admin") {
                // Salvar informações do usuário
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("userRole", "administrador");
                localStorage.setItem("userName", username);
                return { success: true, message: "Login realizado com sucesso!" };
            }

            return {
                success: false,
                message: "Usuário ou senha incorretos. Tente novamente.",
            };
        }

        // Função para mostrar estado de loading no botão
        function setButtonLoading(button, isLoading) {
            const btnText = button.querySelector(".btn-text");
            const btnLoader = button.querySelector(".btn-loader");

            if (isLoading) {
                btnText.classList.add("d-none");
                btnLoader.classList.remove("d-none");
                button.disabled = true;
            } else {
                btnText.classList.remove("d-none");
                btnLoader.classList.add("d-none");
                button.disabled = false;
            }
        }

        // Event Listeners

        // Adicionar efeito de foco nos inputs
        document.querySelectorAll(".form-control").forEach((input) => {
            input.addEventListener("focus", () => {
                input.parentElement.classList.add("input-focus");
            });

            input.addEventListener("blur", () => {
                input.parentElement.classList.remove("input-focus");
            });
        });

        // Toggle visibilidade da senha com animação
        passwordToggle.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);

            const icon = passwordToggle.querySelector("i");
            icon.style.transform = "translateY(-50%) scale(0)";

            setTimeout(() => {
                icon.className = type === "password" ? "bi bi-eye" : "bi bi-eye-slash";
                icon.style.transform = "translateY(-50%) scale(1)";
            }, 150);
        });

        // Envio do formulário de login
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                showFeedback("Por favor, preencha todos os campos obrigatórios.", "danger");
                return;
            }

            if (isSubmitting) return;
            isSubmitting = true;

            // Mostrar estado de loading
            setButtonLoading(loginBtn, true);

            try {
                const result = await authenticate(usernameInput.value, passwordInput.value);

                if (result.success) {
                    // Salvar usuário se "Lembrar-me" estiver marcado
                    if (rememberMeCheckbox.checked) {
                        localStorage.setItem("rememberedUsername", usernameInput.value);
                    } else {
                        localStorage.removeItem("rememberedUsername");
                    }

                    showFeedback(result.message, "success");

                    // Animar saída do card
                    document.querySelector(".login-card").style.animation =
                        "cardExit 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards";

                    // Adicionar animação de saída
                    if (!document.querySelector("#exitKeyframes")) {
                        const style = document.createElement("style");
                        style.id = "exitKeyframes";
                        style.textContent = `
                          @keyframes cardExit {
                              0% { transform: translateY(0) scale(1); opacity: 1; }
                              100% { transform: translateY(-30px) scale(0.9); opacity: 0; }
                          }
                      `;
                        document.head.appendChild(style);
                    }

                    // Redirecionar após 1.5 segundos
                    setTimeout(() => {
                        window.location.href = "sejaBemVindo.html";
                    }, 1500);
                } else {
                    showFeedback(result.message, "danger");
                    setButtonLoading(loginBtn, false);
                }
            } catch (error) {
                showFeedback("Ocorreu um erro ao tentar fazer login. Tente novamente.", "danger");
                setButtonLoading(loginBtn, false);
            } finally {
                isSubmitting = false;
            }
        });

        // Recuperação de senha
        sendRecoveryBtn.addEventListener("click", async () => {
            if (!recoveryEmail.value.trim()) {
                recoveryEmail.classList.add("is-invalid");
                animateShake(recoveryEmail.parentElement);
                return;
            }

            recoveryEmail.classList.remove("is-invalid");
            recoveryEmail.classList.add("is-valid");

            // Mostrar estado de loading
            setButtonLoading(sendRecoveryBtn, true);

            // Simular envio de e-mail
            setTimeout(() => {
                showFeedback("E-mail de recuperação enviado com sucesso!", "success");

                // Animar fechamento do modal
                const modalContent = document.querySelector(".modal-content");
                modalContent.style.animation = "modalExit 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards";

                // Adicionar animação de saída do modal
                if (!document.querySelector("#modalExitKeyframes")) {
                    const style = document.createElement("style");
                    style.id = "modalExitKeyframes";
                    style.textContent = `
                      @keyframes modalExit {
                          0% { transform: scale(1); opacity: 1; }
                          100% { transform: scale(0.9); opacity: 0; }
                      }
                  `;
                    document.head.appendChild(style);
                }

                setTimeout(() => {
                    const recoveryModal = document.getElementById("recoveryModal");
                    const modal = bootstrap.Modal.getInstance(recoveryModal);
                    modal.hide();
                    recoveryForm.reset();

                    // Restaurar botão
                    setButtonLoading(sendRecoveryBtn, false);

                    // Resetar animação do modal
                    setTimeout(() => {
                        modalContent.style.animation = "";
                    }, 300);
                }, 500);
            }, 1500);
        });

        // Carregar usuário salvo
        const rememberedUsername = localStorage.getItem("rememberedUsername");
        if (rememberedUsername) {
            usernameInput.value = rememberedUsername;
            rememberMeCheckbox.checked = true;
        }

        // Focar no primeiro campo vazio
        if (!usernameInput.value) {
            setTimeout(() => {
                usernameInput.focus();
            }, 1000); // Delay para permitir que as animações iniciais terminem
        } else if (!passwordInput.value) {
            setTimeout(() => {
                passwordInput.focus();
            }, 1000);
        }

        // Adicionar efeitos de hover nos botões
        document
            .querySelectorAll(".btn")
            .forEach((btn) => {
                btn.addEventListener("mouseenter", () => {
                    btn.style.transform = "translateY(-3px)";
                    btn.style.boxShadow = "0 5px 15px rgba(13, 110, 253, 0.4)";
                });

                btn.addEventListener("mouseleave", () => {
                    btn.style.transform = "";
                    btn.style.boxShadow = "";
                });
            });

            // Prevenir envio do formulário ao pressionar Enter
            ;[usernameInput, passwordInput].forEach((input) => {
                input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (e.target === usernameInput) {
                            passwordInput.focus();
                        } else {
                            loginForm.requestSubmit();
                        }
                    }
                });
            });

        // Adicionar efeito de partículas no background (opcional)
        function createParticles() {
            const particles = document.createElement("div");
            particles.className = "particles";
            document.body.appendChild(particles);

            for (let i = 0; i < 50; i++) {
                const particle = document.createElement("div");
                particle.className = "particle";
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.animationDelay = `${Math.random() * 5}s`;
                particle.style.animationDuration = `${5 + Math.random() * 10}s`;
                particle.style.opacity = Math.random() * 0.5;
                particle.style.width = particle.style.height = `${Math.random() * 10 + 1}px`;
                particles.appendChild(particle);
            }

            // Adicionar estilos para partículas
            if (!document.querySelector("#particleStyles")) {
                const style = document.createElement("style");
                style.id = "particleStyles";
                style.textContent = `
                  .particles {
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      z-index: -1;
                      overflow: hidden;
                  }
                  .particle {
                      position: absolute;
                      background: rgba(255, 255, 255, 0.5);
                      border-radius: 50%;
                      pointer-events: none;
                      animation: float 15s infinite linear;
                  }
                  @keyframes float {
                      0% {
                          transform: translateY(0) translateX(0) rotate(0);
                      }
                      100% {
                          transform: translateY(-100vh) translateX(100px) rotate(360deg);
                      }
                  }
              `;
                document.head.appendChild(style);
            }
        }

        // Iniciar efeito de partículas
        createParticles();
    });
})();
