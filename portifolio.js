
/* =====================================
   CONFIGURAÇÃO SUPABASE
===================================== */

const SUPABASE_URL = "https://zivdjnfypxjogmwmzfxl.supabase.co";

const SUPABASE_KEY = "sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =====================================
   ELEMENTOS HTML
===================================== */

const lista = document.getElementById("lista-projetos");
const contador = document.getElementById("contador-projetos");
const mensagem = document.getElementById("mensagem-projetos");


/* =====================================
   CARREGAR PROJETOS
===================================== */

async function carregarProjetos() {

    lista.innerHTML = "<p>Carregando projetos...</p>";
    mensagem.textContent = "";

    try {

        const { data, error } = await db
            .from("projetos")
            .select("id, nome, descricao, link, foto, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        console.log("Projetos recebidos:", data);

        // Verifica se existem projetos
        if (!data || data.length === 0) {

            lista.innerHTML = `
                <div class="estado-projetos">
                    <h3>Nenhum projeto encontrado</h3>
                    <p>Cadastre um projeto para ele aparecer aqui.</p>
                </div>
            `;

            contador.textContent = "0 projetos";
            return;
        }

        // Atualiza contador
        contador.textContent =
            `${data.length} ${data.length === 1 ? "projeto" : "projetos"}`;

        lista.innerHTML = "";

        // Cria os cards
        data.forEach(projeto => {

            const card = document.createElement("article");
            card.className = "projeto-card";

            // Imagem
            if (projeto.foto) {

                const imagem = document.createElement("img");

                imagem.src = projeto.foto;
                imagem.alt = `Imagem do projeto ${projeto.nome}`;
                imagem.className = "projeto-imagem";
                imagem.loading = "lazy";

                imagem.onerror = function () {
                    this.style.display = "none";
                };

                card.appendChild(imagem);
            }

            // Conteúdo
            const conteudo = document.createElement("div");
            conteudo.className = "projeto-conteudo";

            // Nome
            const titulo = document.createElement("h3");
            titulo.textContent = projeto.nome || "Projeto sem nome";

            // Descrição
            const descricao = document.createElement("p");
            descricao.textContent =
                projeto.descricao || "Sem descrição disponível.";

            conteudo.appendChild(titulo);
            conteudo.appendChild(descricao);

            // Link
            if (projeto.link) {

                const botao = document.createElement("a");

                try {

                    const url = new URL(projeto.link);

                    if (!["https:", "http:"].includes(url.protocol)) {
                        throw new Error("Link inválido");
                    }

                    botao.href = url.href;
                    botao.target = "_blank";
                    botao.rel = "noopener noreferrer";
                    botao.textContent = "Ver projeto";

                    botao.className = "projeto-link";

                } catch (erro) {

                    botao.textContent = "Link indisponível";
                    botao.className = "projeto-indisponivel";
                }

                conteudo.appendChild(botao);

            }

            card.appendChild(conteudo);
            lista.appendChild(card);

        });

        mensagem.textContent = "";

    } catch (error) {

        console.error("Erro ao carregar projetos:", error);

        lista.innerHTML = `
            <div class="estado-projetos">
                <h3>Não foi possível carregar os projetos.</h3>
                <p id="erro-detalhado"></p>
                <button id="recarregar-projetos">
                    Tentar novamente
                </button>
            </div>
        `;

        document.getElementById("erro-detalhado").textContent =
            error.message;

        contador.textContent = "";

        document
            .getElementById("recarregar-projetos")
            .addEventListener("click", carregarProjetos);
    }
}


/* =====================================
   INICIALIZAÇÃO
===================================== */

carregarProjetos();
