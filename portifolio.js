
// ==========================================
// CONFIGURAÇÃO SUPABASE
// ==========================================

const SUPABASE_URL = "https://zivdjnfypxjogmwmzfxl.supabase.co";

const SUPABASE_KEY = "sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const lista = document.getElementById("lista-projetos");
const mensagem = document.getElementById("mensagem-projetos");
const contador = document.getElementById("contador-projetos");


// ==========================================
// CARREGAR PROJETOS
// ==========================================

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

        if (!data || data.length === 0) {

            lista.innerHTML = `
                <div class="estado-projetos">
                    <h3>Nenhum projeto encontrado</h3>
                    <p>Os projetos aparecerão aqui quando forem cadastrados.</p>
                </div>
            `;

            contador.textContent = "0 projetos";

            return;
        }

        contador.textContent =
            `${data.length} ${data.length === 1 ? "projeto" : "projetos"}`;

        lista.innerHTML = "";

        data.forEach(projeto => {

            // CARTÃO
            const card = document.createElement("article");
            card.className = "projeto-card";


            // IMAGEM
            const imagem = document.createElement("img");

            imagem.className = "projeto-imagem";

            imagem.alt = projeto.nome || "Imagem do projeto";

            imagem.loading = "lazy";

            if (projeto.foto && projeto.foto.trim() !== "") {

                imagem.src = projeto.foto;

                imagem.onerror = () => {
                    imagem.style.display = "none";
                };

            } else {

                imagem.style.display = "none";

            }


            // CONTEÚDO
            const conteudo = document.createElement("div");

            conteudo.className = "projeto-conteudo";


            // NOME
            const titulo = document.createElement("h3");

            titulo.textContent = projeto.nome || "Projeto sem nome";


            // DESCRIÇÃO
            const descricao = document.createElement("p");

            descricao.textContent =
                projeto.descricao || "Nenhuma descrição disponível.";


            // BOTÃO
            const botao = document.createElement("a");

            botao.className = "projeto-link";

            if (projeto.link && projeto.link.trim() !== "") {

                try {

                    const url = new URL(projeto.link);

                    if (!["http:", "https:"].includes(url.protocol)) {
                        throw new Error("Link inválido");
                    }

                    botao.href = url.href;
                    botao.target = "_blank";
                    botao.rel = "noopener noreferrer";
                    botao.textContent = "Ver projeto";

                } catch {

                    botao.textContent = "Link indisponível";
                    botao.classList.add("projeto-indisponivel");

                }

            } else {

                botao.textContent = "Link indisponível";
                botao.classList.add("projeto-indisponivel");

            }


            // MONTAGEM
            conteudo.appendChild(titulo);
            conteudo.appendChild(descricao);
            conteudo.appendChild(botao);

            card.appendChild(imagem);
            card.appendChild(conteudo);

            lista.appendChild(card);

        });

    } catch (error) {

        console.error("Erro Supabase:", error);

        lista.innerHTML = `
            <div class="estado-projetos">
                <h3>Erro ao carregar projetos</h3>
                <p>${error.message}</p>
                <button id="recarregar-projetos" type="button">
                    Tentar novamente
                </button>
            </div>
        `;

        contador.textContent = "";

        document
            .getElementById("recarregar-projetos")
            .addEventListener("click", carregarProjetos);

    }

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarProjetos();
