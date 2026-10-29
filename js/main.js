"use strict";

(() => {
    const GAME = {
        name: "Browser Rhythm Game",
        version: "0.1.0",
        phase: 1
    };

    const screens = Array.from(
        document.querySelectorAll(".screen")
    );

    const loadingScreen = document.getElementById("loading-screen");
    const loadingBar = document.getElementById("loading-bar");
    const loadingMessage = document.getElementById("loading-message");

    const errorBanner = document.getElementById("error-banner");
    const errorMessage = document.getElementById("error-message");
    const errorDismiss = document.getElementById("error-dismiss");

    let currentScreen = "loading-screen";

    /*
     * Report errors inside the game instead of relying on alerts.
     */
    function showError(message) {
        errorMessage.textContent = String(message);
        errorBanner.hidden = false;

        console.error("[Rhythm Game]", message);
    }

    function hideError() {
        errorBanner.hidden = true;
        errorMessage.textContent = "";
    }

    /*
     * Switch between screens.
     */
    function showScreen(screenId) {
        const target = document.getElementById(screenId);

        if (!target || !target.classList.contains("screen")) {
            showError(`Unable to open screen: ${screenId}`);
            return false;
        }

        screens.forEach((screen) => {
            screen.classList.toggle(
                "active",
                screen.id === screenId
            );
        });

        currentScreen = screenId;

        hideError();

        return true;
    }

    /*
     * Set up menu buttons using their data-screen attributes.
     */
    function initializeNavigation() {
        const navigationButtons = document.querySelectorAll(
            "[data-screen]"
        );

        navigationButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const destination = button.dataset.screen;

                if (!destination) {
                    showError(
                        "A menu button is missing its destination."
                    );
                    return;
                }

                showScreen(destination);
            });
        });
    }

    /*
     * Load and save initial settings safely.
     *
     * These values establish the settings system.
     * Their gameplay effects will be implemented in later phases.
     */
    const DEFAULT_SETTINGS = {
        masterVolume: 80,
        visualEffects: true,
        quality: "medium"
    };

    let settings = { ...DEFAULT_SETTINGS };

    function readSavedSettings() {
        try {
            const saved = localStorage.getItem(
                "browserRhythmGame.settings"
            );

            if (!saved) {
                return;
            }

            const parsed = JSON.parse(saved);

            if (!parsed || typeof parsed !== "object") {
                return;
            }

            if (
                Number.isFinite(parsed.masterVolume) &&
                parsed.masterVolume >= 0 &&
                parsed.masterVolume <= 100
            ) {
                settings.masterVolume = parsed.masterVolume;
            }

            if (typeof parsed.visualEffects === "boolean") {
                settings.visualEffects = parsed.visualEffects;
            }

            if (
                ["low", "medium", "high"].includes(parsed.quality)
            ) {
                settings.quality = parsed.quality;
            }
        } catch (error) {
            console.warn(
                "[Rhythm Game] Could not read saved settings.",
                error
            );
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem(
                "browserRhythmGame.settings",
                JSON.stringify(settings)
            );
        } catch (error) {
            console.warn(
                "[Rhythm Game] Settings could not be saved.",
                error
            );

            showError(
                "Settings could not be saved in this browser. " +
                "The game can still be used."
            );
        }
    }

    function initializeSettings() {
        const volumeInput = document.getElementById("master-volume");
        const volumeValue = document.getElementById("volume-value");

        const effectsInput = document.getElementById("visual-effects");
        const qualityInput = document.getElementById("quality-setting");

        readSavedSettings();

        volumeInput.value = String(settings.masterVolume);
        volumeValue.textContent = `${settings.masterVolume}%`;

        effectsInput.checked = settings.visualEffects;
        qualityInput.value = settings.quality;

        volumeInput.addEventListener("input", () => {
            settings.masterVolume = Number(volumeInput.value);

            volumeValue.textContent =
                `${settings.masterVolume}%`;

            saveSettings();
        });

        effectsInput.addEventListener("change", () => {
            settings.visualEffects = effectsInput.checked;
            saveSettings();
        });

        qualityInput.addEventListener("change", () => {
            settings.quality = qualityInput.value;
            saveSettings();
        });
    }

    /*
     * Phase 1 has no registered playable songs yet.
     *
     * Do not present an empty or fake song as playable.
     */
    function initializeSongMenu() {
        const songList = document.getElementById("song-list");
        const songMessage = document.getElementById("song-message");

        songList.replaceChildren();

        songMessage.textContent =
            "No playable songs are registered yet. " +
            "Song charts and audio will be added in a later phase.";
    }

    /*
     * Simulate a short initialization sequence.
     *
     * This checks that the required Phase 1 interface elements
     * exist. It does not claim that music or gameplay is loaded.
     */
    function initializeGame() {
        const requiredElements = [
            "game-container",
            "loading-screen",
            "main-menu",
            "mode-menu",
            "song-menu",
            "settings-menu",
            "credits-menu"
        ];

        const missingElements = requiredElements.filter(
            (id) => !document.getElementById(id)
        );

        if (missingElements.length > 0) {
            throw new Error(
                "Required interface elements are missing: " +
                missingElements.join(", ")
            );
        }

        initializeNavigation();
        initializeSettings();
        initializeSongMenu();

        errorDismiss.addEventListener("click", hideError);

        const loadingSteps = [
            {
                progress: 25,
                message: "Checking game interface..."
            },
            {
                progress: 50,
                message: "Preparing menu system..."
            },
            {
                progress: 75,
                message: "Loading settings..."
            },
            {
                progress: 100,
                message: "Ready!"
            }
        ];

        let step = 0;

        const timer = window.setInterval(() => {
            const currentStep = loadingSteps[step];

            loadingBar.style.width =
                `${currentStep.progress}%`;

            loadingMessage.textContent = currentStep.message;

            step += 1;

            if (step >= loadingSteps.length) {
                window.clearInterval(timer);

                window.setTimeout(() => {
                    showScreen("main-menu");
                }, 250);
            }
        }, 180);
    }

    /*
     * Catch unexpected JavaScript errors.
     */
    window.addEventListener("error", (event) => {
        if (event.message) {
            showError(
                `JavaScript error: ${event.message}`
            );
        }
    });

    window.addEventListener("unhandledrejection", (event) => {
        console.error(
            "[Rhythm Game] Unhandled promise rejection:",
            event.reason
        );

        showError(
            "An unexpected background operation failed. " +
            "Check the browser console for details."
        );
    });

    /*
     * Expose a small debugging interface.
     * Later phases will extend this with gameplay information.
     */
    window.RhythmGame = {
        version: GAME.version,

        getCurrentScreen() {
            return currentScreen;
        },

        showScreen,

        showError,

        getSettings() {
            return { ...settings };
        }
    };

    /*
     * Start the application after the HTML has loaded.
     */
    try {
        initializeGame();
    } catch (error) {
        console.error(
            "[Rhythm Game] Initialization failed:",
            error
        );

        loadingMessage.textContent =
            "The game could not initialize. Check the error message.";

        showError(error.message);
    }
})();
