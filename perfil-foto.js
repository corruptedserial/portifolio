// ======================================
// BUSCAR E APLICAR FOTO DE PERFIL DO SUPABASE
// ======================================

(function aplicarFotoPerfilGlobal() {
    const SUPABASE_URL = "https://zivdjnfypxjogmwmzfxl.supabase.co";
    const SUPABASE_KEY = "sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr";

    function injetarEstilosPerfil() {
        if (document.getElementById("estilo-perfil-global")) return;

        const style = document.createElement("style");
        style.id = "estilo-perfil-global";
        style.textContent = `
            .perfil-site-img {
                object-fit: cover !important;
                border: 3px solid #2563eb;
                background: #1e293b;
                max-width: 100%;
                margin: 0 auto;
                transition: border-radius 0.2s ease, width 0.2s ease, height 0.2s ease;
            }

            .perfil-site-img.formato-quadrado {
                border-radius: 12px !important;
            }

            .perfil-site-img.formato-retangulo {
                border-radius: 12px !important;
            }

            .perfil-site-img.formato-circular {
                border-radius: 50% !important;
            }

            .perfil-site-img.mov-estatica {
                animation: none !important;
            }

            .perfil-site-img.mov-cima-baixo {
                animation: perfilMoverCimaBaixo 2.2s ease-in-out infinite !important;
            }

            .perfil-site-img.mov-girando {
                animation: perfilGirarFoto 6s linear infinite !important;
            }

            @keyframes perfilMoverCimaBaixo {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }

            @keyframes perfilGirarFoto {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    function esperarSupabase(timeoutMs = 4000) {
        if (window.supabase) return Promise.resolve(true);

        return new Promise((resolve) => {
            const inicio = Date.now();
            const intervalo = setInterval(() => {
                if (window.supabase) {
                    clearInterval(intervalo);
                    resolve(true);
                } else if (Date.now() - inicio >= timeoutMs) {
                    clearInterval(intervalo);
                    resolve(false);
                }
            }, 50);
        });
    }

    async function renderizar() {
        const img = document.getElementById("foto-perfil-site");
        if (!img) return;

        // Evita exibir ícone de imagem quebrada antes do carregamento
        img.style.display = "none";

        const sdkCarregado = await esperarSupabase();
        if (!sdkCarregado || !window.supabase) {
            console.error("SDK do Supabase não foi carregado antes de perfil-foto.js.");
            return;
        }

        injetarEstilosPerfil();

        try {
            const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            const { data, error } = await db
                .from("usuario")
                .select("*")
                .order("id", { ascending: true })
                .limit(1);

            if (error) throw error;

            const registro = Array.isArray(data) ? data[0] : data;

            if (!registro || !registro.foto_perfil) {
                console.warn("Nenhuma foto_perfil salva na tabela usuario.");
                img.style.display = "none";
                return;
            }

            const formato = ["quadrado", "retangulo", "circular"].includes(registro.foto_formato)
                ? registro.foto_formato
                : "circular";

            const movimento = ["estatica", "cima-baixo", "girando"].includes(registro.foto_movimento)
                ? registro.foto_movimento
                : "estatica";

            const numTamanho = Number(registro.foto_tamanho);
            const tamanhoPx = Number.isFinite(numTamanho) && numTamanho >= 100
                ? Math.min(450, Math.round(numTamanho))
                : 220;

            img.className = `perfil-site-img formato-${formato} mov-${movimento}`;

            if (formato === "retangulo") {
                img.style.width = `${Math.round(tamanhoPx * 1.5)}px`;
                img.style.height = `${tamanhoPx}px`;
            } else {
                img.style.width = `${tamanhoPx}px`;
                img.style.height = `${tamanhoPx}px`;
            }

            img.onload = () => {
                img.style.display = "block";
            };

            img.onerror = () => {
                console.error("A URL/imagem de foto_perfil falhou ao carregar:", registro.foto_perfil);
                img.style.display = "none";
            };

            img.src = registro.foto_perfil;
        } catch (err) {
            console.error("Erro ao carregar foto de perfil:", err);
            img.style.display = "none";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderizar);
    } else {
        renderizar();
    }
})();