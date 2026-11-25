// ======================================
// ANIMAÇÕES INTERATIVAS E EFEITOS VIVOS
// ======================================

(function iniciarVidaNaPagina() {
    const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Barra de progresso no topo + leve paralaxe nas luzes de fundo
    function configurarScrollEAmbiente() {
        if (!document.getElementById("barra-progresso-topo")) {
            const barra = document.createElement("div");
            barra.id = "barra-progresso-topo";
            barra.className = "barra-progresso";
            barra.setAttribute("aria-hidden", "true");
            document.body.prepend(barra);
        }

        const barra = document.getElementById("barra-progresso-topo");

        function aoRolar() {
            const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
            const progresso = alturaTotal > 0
                ? Math.min(100, Math.max(0, (window.scrollY / alturaTotal) * 100))
                : 0;

            if (barra) {
                barra.style.width = `${progresso}%`;
            }

            if (!reduzMovimento) {
                const deslocamentoY = Math.round(window.scrollY * -0.06);
                document.body.style.setProperty("--scroll-offset", `${deslocamentoY}px`);
            }
        }

        window.addEventListener("scroll", aoRolar, { passive: true });
        window.addEventListener("resize", aoRolar, { passive: true });
        aoRolar();
    }

    // 2. Revelação escalonada das seções conforme aparecem na tela
    function configurarRevelacao() {
        const blocos = document.querySelectorAll(
            ".atualidade, .sobre-mim, .formacao, .interesses, .objetivos, .contato-container"
        );
        if (!blocos.length) return;

        if (reduzMovimento || !("IntersectionObserver" in window)) {
            blocos.forEach((el) => el.classList.add("visivel"));
            return;
        }

        blocos.forEach((el, indice) => {
            el.classList.add("revelar-item");
            el.style.transitionDelay = `${Math.min(indice * 70, 280)}ms`;
        });

        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("visivel");
                        observador.unobserve(entrada.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -25px 0px" }
        );

        blocos.forEach((el) => observador.observe(el));
    }

    // 3. Inclinação 3D sutil e brilho reativo ao mover o mouse sobre os cards
    function configurarTiltELuz() {
        if (reduzMovimento) return;

        const cartoes = document.querySelectorAll(
            ".hero, .atualidade, .sobre-mim, .formacao, .interesses, .objetivos, .login-box, .contato-container"
        );

        cartoes.forEach((cartao) => {
            cartao.addEventListener("pointermove", (evento) => {
                const retangulo = cartao.getBoundingClientRect();
                const x = evento.clientX - retangulo.left;
                const y = evento.clientY - retangulo.top;

                const centroX = retangulo.width / 2;
                const centroY = retangulo.height / 2;

                const rotacaoX = ((y - centroY) / centroY) * -2.2;
                const rotacaoY = ((x - centroX) / centroX) * 2.2;

                cartao.style.transform = `perspective(1000px) rotateX(${rotacaoX.toFixed(2)}deg) rotateY(${rotacaoY.toFixed(2)}deg) translateY(-3px)`;
                cartao.style.background = `
                    radial-gradient(
                        380px circle at ${x}px ${y}px,
                        rgba(0, 240, 255, 0.13),
                        rgba(168, 85, 247, 0.06) 35%,
                        rgba(14, 20, 42, 0.84) 72%
                    )
                `;
            });

            cartao.addEventListener("pointerleave", () => {
                cartao.style.transform = "";
                cartao.style.background = "";
            });
        });
    }

    function iniciar() {
        configurarScrollEAmbiente();
        configurarRevelacao();
        configurarTiltELuz();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
// ======================================
// ANIMAÇÕES INTERATIVAS, GIF DE FUNDO E EFEITOS VIVOS
// ======================================

(function iniciarVidaNaPagina() {
    const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SUPABASE_URL = "https://zivdjnfypxjogmwmzfxl.supabase.co";
    const SUPABASE_KEY = "sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr";

    function removerGifFundo() {
        document.body.classList.remove("gif-ativo", "gif-no-body");
        document.body.style.backgroundImage = "";
        document.body.style.backgroundSize = "";
        document.body.style.backgroundPosition = "";
        document.body.style.backgroundAttachment = "";
        document.body.style.backgroundRepeat = "";

        const hero = document.querySelector(".hero");
        if (hero) {
            hero.style.backgroundImage = "";
            hero.style.backgroundSize = "";
            hero.style.backgroundPosition = "";
        }

        const intro = document.querySelector(".pagina-intro");
        if (intro) {
            intro.style.backgroundImage = "";
            intro.style.backgroundSize = "";
            intro.style.backgroundPosition = "";
        }
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

    async function configurarGifDoBanco() {
        const sdkCarregado = await esperarSupabase();
        if (!sdkCarregado || !window.supabase) return;

        try {
            const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            const { data, error } = await db
                .from("usuario")
                .select("gif_fundo, gif_ativo, gif_alvo")
                .order("id", { ascending: true })
                .limit(1);

            if (error) throw error;

            const registro = Array.isArray(data) ? data[0] : data;

            if (!registro || !registro.gif_ativo || !registro.gif_fundo) {
                removerGifFundo();
                return;
            }

            const url = registro.gif_fundo;
            const alvo = ["body", "hero", "intro"].includes(registro.gif_alvo)
                ? registro.gif_alvo
                : "body";

            removerGifFundo();
            document.body.classList.add("gif-ativo");

            if (alvo === "hero") {
                const hero = document.querySelector(".hero");
                if (hero) {
                    hero.style.backgroundImage = `linear-gradient(135deg, rgba(5, 7, 17, 0.58), rgba(14, 20, 42, 0.72)), url("${url}")`;
                    hero.style.backgroundSize = "cover";
                    hero.style.backgroundPosition = "center";
                }
            } else if (alvo === "intro") {
                const intro = document.querySelector(".pagina-intro");
                if (intro) {
                    intro.style.padding = "36px 24px";
                    intro.style.borderRadius = "22px";
                    intro.style.backgroundImage = `linear-gradient(135deg, rgba(5, 7, 17, 0.58), rgba(14, 20, 42, 0.72)), url("${url}")`;
                    intro.style.backgroundSize = "cover";
                    intro.style.backgroundPosition = "center";
                }
            } else {
                document.body.style.backgroundImage = `linear-gradient(rgba(5, 7, 17, 0.58), rgba(5, 7, 17, 0.72)), url("${url}")`;
                document.body.style.backgroundSize = "cover";
                document.body.style.backgroundPosition = "center";
                document.body.style.backgroundAttachment = window.innerWidth <= 820 ? "scroll" : "fixed";
                document.body.style.backgroundRepeat = "no-repeat";
            }
        } catch (err) {
            console.error("Erro ao aplicar GIF de fundo:", err);
        }
    }

    function configurarScrollEAmbiente() {
        if (!document.getElementById("barra-progresso-topo")) {
            const barra = document.createElement("div");
            barra.id = "barra-progresso-topo";
            barra.className = "barra-progresso";
            barra.setAttribute("aria-hidden", "true");
            document.body.prepend(barra);
        }

        const barra = document.getElementById("barra-progresso-topo");

        function aoRolar() {
            const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
            const progresso = alturaTotal > 0
                ? Math.min(100, Math.max(0, (window.scrollY / alturaTotal) * 100))
                : 0;

            if (barra) {
                barra.style.width = `${progresso}%`;
            }

            if (!reduzMovimento) {
                const deslocamentoY = Math.round(window.scrollY * -0.06);
                document.body.style.setProperty("--scroll-offset", `${deslocamentoY}px`);
            }
        }

        window.addEventListener("scroll", aoRolar, { passive: true });
        window.addEventListener("resize", aoRolar, { passive: true });
        aoRolar();
    }

    function configurarRevelacao() {
        const blocos = document.querySelectorAll(
            ".atualidade, .sobre-mim, .formacao, .interesses, .objetivos, .contato-container"
        );
        if (!blocos.length) return;

        if (reduzMovimento || !("IntersectionObserver" in window)) {
            blocos.forEach((el) => el.classList.add("visivel"));
            return;
        }

        blocos.forEach((el, indice) => {
            el.classList.add("revelar-item");
            el.style.transitionDelay = `${Math.min(indice * 70, 280)}ms`;
        });

        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("visivel");
                        observador.unobserve(entrada.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -25px 0px" }
        );

        blocos.forEach((el) => observador.observe(el));
    }

    function configurarTiltELuz() {
        if (reduzMovimento) return;

        const cartoes = document.querySelectorAll(
            ".hero, .atualidade, .sobre-mim, .formacao, .interesses, .objetivos, .login-box, .contato-container"
        );

        cartoes.forEach((cartao) => {
            cartao.addEventListener("pointermove", (evento) => {
                const retangulo = cartao.getBoundingClientRect();
                const x = evento.clientX - retangulo.left;
                const y = evento.clientY - retangulo.top;

                const centroX = retangulo.width / 2;
                const centroY = retangulo.height / 2;

                const rotacaoX = ((y - centroY) / centroY) * -2.2;
                const rotacaoY = ((x - centroX) / centroX) * 2.2;

                cartao.style.transform = `perspective(1000px) rotateX(${rotacaoX.toFixed(2)}deg) rotateY(${rotacaoY.toFixed(2)}deg) translateY(-3px)`;
                cartao.style.background = `
                    radial-gradient(
                        380px circle at ${x}px ${y}px,
                        rgba(0, 240, 255, 0.13),
                        rgba(168, 85, 247, 0.06) 35%,
                        rgba(14, 20, 42, 0.52) 72%
                    )
                `;
            });

            cartao.addEventListener("pointerleave", () => {
                cartao.style.transform = "";
                cartao.style.background = "";
            });
        });
    }

    function iniciar() {
        configurarGifDoBanco();
        configurarScrollEAmbiente();
        configurarRevelacao();
        configurarTiltELuz();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();