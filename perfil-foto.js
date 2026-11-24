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
                object-fit: cover;
                border: 3px solid #2563eb;
                background: #1e293b;
                max-width: 100%;
                transition: border-radius 0.2s ease, width 0.2s ease, height 0.2s ease;
            }

            .perfil-site-img.formato-quadrado {
                border-radius: 8px;
            }

            .perfil-site-img.formato-retangulo {
                border-radius: 8px;
            }

            .perfil-site-img.formato-circular {
                border-radius: 50%;
            }

            .perfil-site-img.mov-estatica {
                animation: none;
            }

            .perfil-site-img.mov-cima-baixo {
                animation: perfilMoverCimaBaixo 2.2s ease-in-out infinite;
            }

            .perfil-site-img.mov-girando {
                animation: perfilGirarFoto 6s linear infinite;
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

    async function renderizar() {
        const img = document.getElementById("foto-perfil-site");
        if (!img || !window.supabase) return;

        injetarEstilosPerfil();

        try {
            const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            const { data, error } = await db
                .from("usuario")
                .select("foto_perfil, foto_formato, foto_movimento, foto_tamanho")
                .order("id", { ascending: true })
                .limit(1)
                .single();

            if (error) throw error;

            if (!data || !data.foto_perfil) {
                img.style.display = "none";
                return;
            }

            const formato = ["quadrado", "retangulo", "circular"].includes(data.foto_formato)
                ? data.foto_formato
                : "circular";

            const movimento = ["estatica", "cima-baixo", "girando"].includes(data.foto_movimento)
                ? data.foto_movimento
                : "estatica";

            const numTamanho = Number(data.foto_tamanho);
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

            img.src = data.foto_perfil;
            img.style.display = "block";
            img.onerror = () => {
                img.style.display = "none";
            };
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