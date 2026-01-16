import { defineStore } from "pinia";
import { ref } from "vue";
import { loginUser, registerUser } from "../api/auth";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore(
    "auth",
    () => {
        const isAuthenticated = ref(false);
        const user = ref(null);

        function register(payload) {
            user.value = {
                name: payload.name,
                email: payload.email,
                password: payload.password, // demo only (not real apps)
            };

            isAuthenticated.value = true;
            return true;
        }

        function login(email, password) {
            if (!user.value) return false;

            if (
                user.value.email === email &&
                user.value.password === password
            ) {
                isAuthenticated.value = true;
                return true;
            }

            return false;
        }

        function logout() {
            isAuthenticated.value = false;
            user.value = null;
        }

        function waitForGoogleScript() {
            return new Promise((resolve, reject) => {
                if (window.google?.accounts?.id) {
                    resolve();
                    return;
                }

                // More flexible script selector - matches any script with gsi/client
                const script = document.querySelector(
                    'script[src*="accounts.google.com/gsi/client"]'
                );

                if (!script) {
                    reject(new Error("Google script tag not found"));
                    return;
                }

                let attempts = 0;
                const maxAttempts = 50;

                const interval = setInterval(() => {
                    attempts++;
                    if (window.google?.accounts?.id) {
                        clearInterval(interval);
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        reject(new Error("Google script failed to load"));
                    }
                }, 100);
            });
        }

        // 🔹 Google callback
        function handleGoogleResponse(response) {
            try {
                const payload = JSON.parse(
                    atob(response.credential.split(".")[1])
                );

                user.value = {
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture,
                    provider: "google",
                };

                isAuthenticated.value = true;
                
                // Trigger a custom event so the component can handle redirect
                window.dispatchEvent(new CustomEvent('google-signin-success'));
                
                return true;
            } catch (error) {
                console.error("Google Sign-In failed:", error);
                alert("Failed to process Google Sign-In. Please try again.");
                return false;
            }
        }

        async function initGoogleLogin(clientId, buttonEl) {
            if (!buttonEl) {
                throw new Error("Google button element missing");
            }

            await waitForGoogleScript();

            // Get current origin for debugging
            const currentOrigin = window.location.origin;
            console.log("Current origin:", currentOrigin);
            console.log("Make sure this origin is added to Google Cloud Console authorized origins");

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse,
                // Add context to help with debugging
                context: "signin",
                ux_mode: "popup",
            });

            window.google.accounts.id.renderButton(buttonEl, {
                theme: "outline",
                size: "large",
                width: "100%",
                text: "signin_with",
                shape: "rectangular",
            });
        }

        return {
            isAuthenticated, user, register, login,
            initGoogleLogin, logout
        };
    },
    {
        persist: true,
    }
);

