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
                transition: border-radius 0.2s ease, width 0.2s ease, height 0.2s ease;
            }

            .perfil-site-img.formato-quadrado {
                width: 140px;
                height: 140px;
                border-radius: 8px;
            }

            .perfil-site-img.formato-retangulo {
                width: 210px;
                height: 130px;
                border-radius: 8px;
            }

            .perfil-site-img.formato-circular {
                width: 140px;
                height: 140px;
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
                .select("foto_perfil, foto_formato, foto_movimento")
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

            img.className = `perfil-site-img formato-${formato} mov-${movimento}`;
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