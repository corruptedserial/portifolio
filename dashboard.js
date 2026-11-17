
// ======================================
// CONFIGURAÇÃO DO SUPABASE
// ======================================

const SUPABASE_URL = "https://zivdjnfypxjogmwmzfxl.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ======================================
// VERIFICAÇÃO DO ADMINISTRADOR
// ======================================

const usuarioId = Number(sessionStorage.getItem("usuario_id"));
const usuarioNome = sessionStorage.getItem("usuario_nome");

if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
    window.location.replace("login.html");
}

document.getElementById("nome-admin").textContent =
    usuarioNome || "Administrador";

// ======================================
// ELEMENTOS DO HTML
// ======================================

const formulario = document.getElementById("form-projeto");
const listaProjetos = document.getElementById("lista-projetos");
const mensagem = document.getElementById("mensagem-projeto");
const botaoCadastrar = document.getElementById("btn-cadastrar");

// ======================================
// CADASTRAR PROJETO
// ======================================

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome-projeto").value.trim();
    const descricao = document.getElementById("descricao-projeto").value.trim();
    const link = document.getElementById("link-projeto").value.trim();
    const foto = document.getElementById("foto-projeto").value.trim();

    if (!nome || !descricao) {
        mensagem.textContent = "Preencha os campos obrigatórios.";
        return;
    }

    botaoCadastrar.disabled = true;
    botaoCadastrar.textContent = "Cadastrando...";

    try {
        const { error } = await supabaseClient
            .from("projetos")
            .insert([
                {
                    usuario_id: usuarioId,
                    nome: nome,
                    descricao: descricao,
                    link: link || null,
                    foto: foto || null
                }
            ]);

        if (error) throw error;

        mensagem.textContent = "Projeto cadastrado com sucesso!";
        mensagem.style.color = "#16a34a";

        formulario.reset();

        await carregarProjetos();

    } catch (error) {
        console.error(error);

        mensagem.textContent = "Não foi possível cadastrar o projeto.";
        mensagem.style.color = "#dc2626";

    } finally {
        botaoCadastrar.disabled = false;
        botaoCadastrar.textContent = "Cadastrar projeto";
    }
});

// ======================================
// CARREGAR PROJETOS
// ======================================

async function carregarProjetos() {

    listaProjetos.replaceChildren();

    const carregando = document.createElement("p");
    carregando.textContent = "Carregando projetos...";
    listaProjetos.appendChild(carregando);

    try {
        const { data, error } = await supabaseClient
            .from("projetos")
            .select("*")
            .eq("usuario_id", usuarioId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        listaProjetos.replaceChildren();

        if (!data || data.length === 0) {
            const vazio = document.createElement("p");
            vazio.textContent = "Você ainda não cadastrou nenhum projeto.";
            listaProjetos.appendChild(vazio);
            return;
        }

        data.forEach((projeto) => {
            criarCardProjeto(projeto);
        });

    } catch (error) {
        console.error(error);

        listaProjetos.replaceChildren();

        const erro = document.createElement("p");
        erro.textContent = "Erro ao carregar os projetos.";
        listaProjetos.appendChild(erro);
    }
}

// ======================================
// CRIAR CARD DO PROJETO
// ======================================

function criarCardProjeto(projeto) {

    const card = document.createElement("article");
    card.className = "projeto-card";

    if (projeto.foto) {
        const imagem = document.createElement("img");

        imagem.src = projeto.foto;
        imagem.alt = "Imagem do projeto " + projeto.nome;
        imagem.loading = "lazy";

        imagem.addEventListener("error", () => {
            imagem.remove();
        });

        card.appendChild(imagem);
    }

    const info = document.createElement("div");
    info.className = "projeto-info";

    const titulo = document.createElement("h3");
    titulo.textContent = projeto.nome;

    const descricao = document.createElement("p");
    descricao.textContent = projeto.descricao;

    info.appendChild(titulo);
    info.appendChild(descricao);

    if (projeto.link) {
        const link = document.createElement("a");

        link.href = projeto.link;
        link.textContent = "Visualizar projeto";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        info.appendChild(link);
    }

    const excluir = document.createElement("button");

    excluir.type = "button";
    excluir.className = "excluir-btn";
    excluir.textContent = "Excluir";

    excluir.addEventListener("click", () => {
        excluirProjeto(projeto.id);
    });

    info.appendChild(excluir);
    card.appendChild(info);

    listaProjetos.appendChild(card);
}

// ======================================
// EXCLUIR PROJETO
// ======================================

async function excluirProjeto(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este projeto?"
    );

    if (!confirmar) return;

    try {
        const { error } = await supabaseClient
            .from("projetos")
            .delete()
            .eq("id", id)
            .eq("usuario_id", usuarioId);

        if (error) throw error;

        mensagem.textContent = "Projeto excluído com sucesso!";
        mensagem.style.color = "#16a34a";

        await carregarProjetos();

    } catch (error) {
        console.error(error);

        mensagem.textContent = "Erro ao excluir o projeto.";
        mensagem.style.color = "#dc2626";
    }
}

// ======================================
// SAIR DO DASHBOARD
// ======================================

document.getElementById("btn-sair").addEventListener("click", () => {

    sessionStorage.removeItem("usuario_id");
    sessionStorage.removeItem("usuario_nome");

    window.location.replace("login.html");
});

// ======================================
// INICIALIZAÇÃO
// ======================================

carregarProjetos();
