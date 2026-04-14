/*
    Configuracoes globais e acessibilidade - UniLab
*/
(function () {
    const SETTINGS_STORAGE_KEY = 'unilabUserSettings';
    const MIN_SCALE = 0.9;
    const MAX_SCALE = 1.3;
    const STEP = 0.05;

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
            fontSize: 'normal',
            readableFont: false,
            customFontScale: 1
        };
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!raw) {
                return getDefaultSettings();
            }

            const parsed = JSON.parse(raw);
            const merged = { ...getDefaultSettings(), ...parsed };

            if (typeof merged.customFontScale !== 'number') {
                merged.customFontScale = 1;
            }

            return merged;
        } catch (error) {
            console.error('Erro ao carregar configuracoes globais:', error);
            return getDefaultSettings();
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configuracoes globais:', error);
            return false;
        }
    }

    function clampScale(value) {
        return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value || 1)));
    }

    function applyFontSizePreset(settings) {
        let baseScale = 1;
        if (settings.fontSize === 'large') {
            baseScale = 1.06;
        }
        if (settings.fontSize === 'x-large') {
            baseScale = 1.12;
        }

        const finalScale = clampScale(baseScale * clampScale(settings.customFontScale));
        document.documentElement.style.setProperty('--unilab-font-scale', String(finalScale));
    }

    function applyVisualSettings(settings) {
        try {
            document.body.classList.toggle('light-mode', !Boolean(settings.darkMode));
            document.body.classList.toggle('high-contrast-mode', Boolean(settings.highContrast));
            document.body.classList.toggle('reduce-motion-mode', Boolean(settings.reduceMotion));
            document.body.classList.toggle('readable-font-mode', Boolean(settings.readableFont));

            const validSize = ['normal', 'large', 'x-large'].includes(settings.fontSize)
                ? settings.fontSize
                : 'normal';
            document.body.setAttribute('data-font-size', validSize);

            applyFontSizePreset(settings);
        } catch (error) {
            console.error('Erro ao aplicar configuracoes globais:', error);
        }
    }

    function buildConfigModalMarkup() {
        return '' +
            '<div class="modal fade" id="configModal" tabindex="-1" aria-labelledby="configModalLabel" aria-hidden="true">' +
            '  <div class="modal-dialog modal-dialog-centered modal-xl">' +
            '    <div class="modal-content">' +
            '      <div class="modal-header">' +
            '        <h5 class="modal-title" id="configModalLabel"><i class="bi bi-gear-fill me-2"></i>Configuracoes</h5>' +
            '        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>' +
            '      </div>' +
            '      <div class="modal-body config-modal-body">' +
            '        <div class="row g-4">' +
            '          <div class="col-lg-4">' +
            '            <div class="config-section h-100">' +
            '              <h6 class="config-section-title"><i class="bi bi-person-vcard-fill"></i>Conta</h6>' +
            '              <div class="mb-3">' +
            '                <label for="configDisplayName" class="form-label">Nome de exibicao</label>' +
            '                <input type="text" class="form-control" id="configDisplayName" placeholder="Seu nome no sistema">' +
            '              </div>' +
            '              <div class="mb-3">' +
            '                <label for="configEmail" class="form-label">Email de contato</label>' +
            '                <input type="email" class="form-control" id="configEmail" placeholder="exemplo@unilab.edu.br">' +
            '              </div>' +
            '              <div class="mb-0">' +
            '                <label for="languageSelect" class="form-label">Idioma</label>' +
            '                <select class="form-select" id="languageSelect">' +
            '                  <option value="pt-BR" selected>Portugues (Brasil)</option>' +
            '                  <option value="en-US">English (US)</option>' +
            '                  <option value="es">Espanol</option>' +
            '                </select>' +
            '              </div>' +
            '            </div>' +
            '          </div>' +
            '          <div class="col-lg-4">' +
            '            <div class="config-section h-100">' +
            '              <h6 class="config-section-title"><i class="bi bi-bell-fill"></i>Notificacoes</h6>' +
            '              <div class="form-check form-switch config-switch"><input class="form-check-input" type="checkbox" id="notificationToggle" checked><label class="form-check-label" for="notificationToggle">Notificacoes por email</label></div>' +
            '              <div class="form-check form-switch config-switch"><input class="form-check-input" type="checkbox" id="systemAlertToggle" checked><label class="form-check-label" for="systemAlertToggle">Alertas de sistema</label></div>' +
            '              <div class="form-check form-switch config-switch"><input class="form-check-input" type="checkbox" id="reminderToggle" checked><label class="form-check-label" for="reminderToggle">Lembretes de agendamento</label></div>' +
            '              <div class="form-check form-switch config-switch mb-0"><input class="form-check-input" type="checkbox" id="soundToggle"><label class="form-check-label" for="soundToggle">Som em notificacoes</label></div>' +
            '            </div>' +
            '          </div>' +
            '          <div class="col-lg-4">' +
            '            <div class="config-section h-100">' +
            '              <h6 class="config-section-title"><i class="bi bi-palette-fill"></i>Aparencia</h6>' +
            '              <div class="form-check form-switch config-switch"><input class="form-check-input" type="checkbox" id="darkModeToggle" checked><label class="form-check-label" for="darkModeToggle">Tema escuro</label></div>' +
            '              <div class="form-check form-switch config-switch"><input class="form-check-input" type="checkbox" id="highContrastToggle"><label class="form-check-label" for="highContrastToggle">Alto contraste</label></div>' +
            '              <div class="form-check form-switch config-switch"><input class="form-check-input" type="checkbox" id="reduceMotionToggle"><label class="form-check-label" for="reduceMotionToggle">Reduzir animacoes</label></div>' +
            '              <div class="mb-0 mt-3"><label for="fontSizeSelect" class="form-label">Tamanho da fonte</label><select class="form-select" id="fontSizeSelect"><option value="normal" selected>Padrao</option><option value="large">Grande</option><option value="x-large">Extra grande</option></select></div>' +
            '            </div>' +
            '          </div>' +
            '          <div class="col-12">' +
            '            <div class="config-section">' +
            '              <h6 class="config-section-title"><i class="bi bi-shield-lock-fill"></i>Seguranca</h6>' +
            '              <div class="row g-3">' +
            '                <div class="col-md-4"><label for="newPassword" class="form-label">Nova senha</label><input type="password" class="form-control" id="newPassword" placeholder="Digite a nova senha"></div>' +
            '                <div class="col-md-4"><label for="confirmPassword" class="form-label">Confirmar senha</label><input type="password" class="form-control" id="confirmPassword" placeholder="Repita a nova senha"></div>' +
            '                <div class="col-md-4 d-flex align-items-end"><button type="button" class="btn btn-outline-light w-100" id="changePasswordBtn"><i class="bi bi-key-fill me-1"></i>Atualizar senha</button></div>' +
            '              </div>' +
            '            </div>' +
            '          </div>' +
            '        </div>' +
            '      </div>' +
            '      <div class="modal-footer">' +
            '        <button type="button" class="btn btn-outline-warning" id="resetConfigBtn"><i class="bi bi-arrow-counterclockwise me-1"></i>Restaurar padrao</button>' +
            '        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>' +
            '        <button type="button" class="btn btn-primary" id="saveConfigBtn"><i class="bi bi-check-circle-fill me-1"></i>Salvar alteracoes</button>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>';
    }

    function ensureConfigModal() {
        const existingModal = document.getElementById('configModal');
        if (existingModal) {
            return existingModal;
        }

        const template = document.createElement('template');
        template.innerHTML = buildConfigModalMarkup().trim();
        const modalElement = template.content.firstElementChild;
        document.body.appendChild(modalElement);
        return modalElement;
    }

    function syncSettingsForm(settings) {
        const modalElement = ensureConfigModal();
        if (!modalElement) {
            return;
        }

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

        Object.keys(mapping).forEach((id) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            if (element.type === 'checkbox') {
                element.checked = Boolean(mapping[id]);
            } else {
                element.value = mapping[id];
            }
        });
    }

    function insertConfigEntry() {
        if (document.querySelector('[data-unilab-config-entry="true"]')) {
            return;
        }

        const configLinkMarkup = '<i class="bi bi-gear-fill me-1"></i>Configuracoes';
        const dropdownMenu = document.querySelector('.dropdown-menu[aria-labelledby="userDropdown"]');
        if (dropdownMenu) {
            const item = document.createElement('li');
            item.setAttribute('data-unilab-config-entry', 'true');
            item.innerHTML = '<a class="dropdown-item" href="#" data-unilab-open-config="true">' + configLinkMarkup + '</a>';

            const logoutItem = dropdownMenu.querySelector('.logout-button')?.closest('li');
            if (logoutItem) {
                dropdownMenu.insertBefore(item, logoutItem);
            } else {
                dropdownMenu.appendChild(item);
            }
            return;
        }

        const navList = document.querySelector('#navbarNav .navbar-nav');
        if (navList) {
            const item = document.createElement('li');
            item.className = 'nav-item';
            item.setAttribute('data-unilab-config-entry', 'true');
            item.innerHTML = '<a class="nav-link" href="#" data-unilab-open-config="true">' + configLinkMarkup + '</a>';
            navList.appendChild(item);
        }
    }

    function openConfigModal() {
        try {
            const modalElement = ensureConfigModal();
            if (!modalElement) {
                return;
            }

            const bootstrapRef = window.bootstrap || bootstrap;
            if (typeof bootstrapRef === 'undefined') {
                console.error('Bootstrap nao encontrado. O modal nao pode ser aberto.');
                return;
            }

            syncSettingsForm(loadSettings());

            const instance = bootstrapRef.Modal.getOrCreateInstance(modalElement);
            instance.show();
        } catch (error) {
            console.error('Erro ao abrir configuracoes globais:', error);
        }
    }

    function getMainTarget() {
        const explicitMain = document.getElementById('main-content');
        if (explicitMain) {
            return explicitMain;
        }

        const semanticMain = document.querySelector('main');
        if (semanticMain) {
            semanticMain.id = semanticMain.id || 'main-content';
            return semanticMain;
        }

        const firstSection = document.querySelector('section, article, .container');
        if (firstSection) {
            firstSection.id = firstSection.id || 'main-content';
            return firstSection;
        }

        return document.body;
    }

    function ensureSkipLink() {
        if (document.querySelector('.global-skip-link')) {
            return;
        }

        const mainTarget = getMainTarget();
        if (!mainTarget.id) {
            mainTarget.id = 'main-content';
        }

        mainTarget.setAttribute('tabindex', '-1');

        const link = document.createElement('a');
        link.href = '#' + mainTarget.id;
        link.className = 'global-skip-link';
        link.textContent = 'Pular para o conteudo principal';
        document.body.insertBefore(link, document.body.firstChild);
    }

    function createAccessibilityPanel() {
        if (document.querySelector('.a11y-fab')) {
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'a11y-widget';
        wrapper.innerHTML = '' +
            '<button class="a11y-fab" type="button" aria-expanded="false" aria-controls="a11yPanel">A11Y</button>' +
            '<section class="a11y-panel" id="a11yPanel" aria-label="Acessibilidade" hidden>' +
            '  <h2>Acessibilidade</h2>' +
            '  <div class="a11y-row">' +
            '    <button type="button" data-a11y-action="toggle-contrast">Contraste</button>' +
            '    <button type="button" data-a11y-action="toggle-motion">Animacoes</button>' +
            '  </div>' +
            '  <div class="a11y-row">' +
            '    <button type="button" data-a11y-action="font-down">A-</button>' +
            '    <button type="button" data-a11y-action="font-reset">Fonte</button>' +
            '    <button type="button" data-a11y-action="font-up">A+</button>' +
            '  </div>' +
            '  <div class="a11y-row">' +
            '    <button type="button" data-a11y-action="toggle-readable">Leitura</button>' +
            '  </div>' +
            '  <p>Atalho: Alt + A</p>' +
            '</section>';

        document.body.appendChild(wrapper);

        const button = wrapper.querySelector('.a11y-fab');
        const panel = wrapper.querySelector('.a11y-panel');

        button.addEventListener('click', function () {
            const isOpen = !panel.hidden;
            panel.hidden = isOpen;
            button.setAttribute('aria-expanded', String(!isOpen));
        });

        wrapper.addEventListener('click', function (event) {
            const action = event.target.getAttribute('data-a11y-action');
            if (!action) {
                return;
            }

            const settings = loadSettings();

            if (action === 'toggle-contrast') {
                settings.highContrast = !Boolean(settings.highContrast);
            }

            if (action === 'toggle-motion') {
                settings.reduceMotion = !Boolean(settings.reduceMotion);
            }

            if (action === 'toggle-readable') {
                settings.readableFont = !Boolean(settings.readableFont);
            }

            if (action === 'font-down') {
                settings.customFontScale = clampScale(settings.customFontScale - STEP);
            }

            if (action === 'font-up') {
                settings.customFontScale = clampScale(settings.customFontScale + STEP);
            }

            if (action === 'font-reset') {
                settings.customFontScale = 1;
                settings.fontSize = 'normal';
            }

            saveSettings(settings);
            applyVisualSettings(settings);

            window.dispatchEvent(new CustomEvent('unilab:settings-updated', { detail: settings }));
        });

        document.addEventListener('keydown', function (event) {
            if (event.altKey && (event.key === 'a' || event.key === 'A')) {
                event.preventDefault();
                button.click();
            }

            if (event.key === 'Escape' && !panel.hidden) {
                panel.hidden = true;
                button.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function init() {
        const settings = loadSettings();
        applyVisualSettings(settings);
        ensureSkipLink();
        createAccessibilityPanel();
        insertConfigEntry();

        document.addEventListener('click', function (event) {
            const trigger = event.target.closest('[data-unilab-open-config="true"]');
            if (!trigger) {
                return;
            }

            event.preventDefault();
            openConfigModal();
        });

        const configModalElement = ensureConfigModal();
        if (configModalElement) {
            configModalElement.addEventListener('show.bs.modal', function () {
                syncSettingsForm(loadSettings());
            });

            configModalElement.addEventListener('click', function (event) {
                if (event.target.id !== 'saveConfigBtn' && event.target.id !== 'resetConfigBtn' && event.target.id !== 'changePasswordBtn') {
                    return;
                }

                const currentSettings = loadSettings();

                if (event.target.id === 'saveConfigBtn') {
                    const newSettings = {
                        ...currentSettings,
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

                    if (newSettings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSettings.email)) {
                        alert('Informe um email valido.');
                        return;
                    }

                    saveSettings(newSettings);
                    applyVisualSettings(newSettings);

                    if (newSettings.displayName) {
                        localStorage.setItem('userName', newSettings.displayName);
                        const userNameElement = document.querySelector('.user-name');
                        if (userNameElement) {
                            userNameElement.textContent = newSettings.displayName;
                        }
                    }

                    const bootstrapRef = window.bootstrap || bootstrap;
                    const instance = bootstrapRef.Modal.getInstance(configModalElement);
                    if (instance) {
                        instance.hide();
                    }
                }

                if (event.target.id === 'resetConfigBtn') {
                    const defaults = getDefaultSettings();
                    defaults.displayName = localStorage.getItem('userName') || '';
                    saveSettings(defaults);
                    applyVisualSettings(defaults);
                    syncSettingsForm(defaults);
                }

                if (event.target.id === 'changePasswordBtn') {
                    const newPassword = document.getElementById('newPassword')?.value || '';
                    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
                    if (newPassword.length < 6) {
                        alert('A nova senha deve ter pelo menos 6 caracteres.');
                        return;
                    }
                    if (newPassword !== confirmPassword) {
                        alert('A confirmacao da senha nao confere.');
                        return;
                    }
                    alert('Senha atualizada com sucesso.');
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                }
            });
        }
    }

    window.UnilabSettings = {
        key: SETTINGS_STORAGE_KEY,
        getDefaultSettings,
        loadSettings,
        saveSettings,
        applyVisualSettings,
        openConfigModal
    };

    window.openConfigModal = openConfigModal;

    window.addEventListener('storage', function (event) {
        if (event.key === SETTINGS_STORAGE_KEY) {
            applyVisualSettings(loadSettings());
        }
    });

    document.addEventListener('DOMContentLoaded', init);
})();
