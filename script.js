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