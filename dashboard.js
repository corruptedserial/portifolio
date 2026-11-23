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

const nomeAdminEl = document.getElementById("nome-admin");
if (nomeAdminEl) {
    nomeAdminEl.textContent = usuarioNome || "Administrador";
}

// ======================================
// ELEMENTOS DO HTML
// ======================================

const formulario = document.getElementById("form-projeto");
const listaProjetos = document.getElementById("lista-projetos");
const mensagem = document.getElementById("mensagem-projeto");
const botaoCadastrar = document.getElementById("btn-cadastrar");
const listaLeads = document.getElementById("lista-leads");
const btnAtualizarLeads = document.getElementById("btn-atualizar-leads");

// Elementos da foto de perfil
const previewFotoPerfil = document.getElementById("foto-perfil-preview");
const btnEscolherFoto = document.getElementById("btn-escolher-foto");
const inputArquivoFoto = document.getElementById("input-arquivo-foto");
const inputUrlFotoPerfil = document.getElementById("url-foto-perfil");
const selectFormatoFoto = document.getElementById("formato-foto-perfil");
const selectMovimentoFoto = document.getElementById("movimento-foto-perfil");
const btnSalvarPerfil = document.getElementById("btn-salvar-perfil");
const statusPerfil = document.getElementById("status-perfil");

// ======================================
// MODAL DE EDIÇÃO DE PROJETO
// ======================================

let projetoEmEdicaoId = null;
let modalEdicao = null;
let formEdicao = null;
let editNomeInput = null;
let editDescricaoInput = null;
let editLinkInput = null;
let editFotoInput = null;
let btnSalvarEdicao = null;
let btnCancelarEdicao = null;
let statusEdicao = null;

function criarModalEdicao() {
    if (document.getElementById("modal-editar-projeto")) return;

    modalEdicao = document.createElement("div");
    modalEdicao.id = "modal-editar-projeto";
    modalEdicao.className = "modal-edicao-backdrop";
    modalEdicao.setAttribute("role", "dialog");
    modalEdicao.setAttribute("aria-modal", "true");
    modalEdicao.setAttribute("aria-labelledby", "titulo-modal-edicao");

    modalEdicao.innerHTML = `
        <div class="modal-edicao-box">
            <h2 id="titulo-modal-edicao">Editar projeto</h2>
            <form id="form-editar-projeto">
                <label for="edit-nome-projeto">Nome do projeto</label>
                <input type="text" id="edit-nome-projeto" required maxlength="100">

                <label for="edit-descricao-projeto">Descrição</label>
                <textarea id="edit-descricao-projeto" required maxlength="1000"></textarea>

                <label for="edit-link-projeto">Link do projeto</label>
                <input type="url" id="edit-link-projeto" placeholder="https://exemplo.com">

                <label for="edit-foto-projeto">Foto do projeto (URL)</label>
                <input type="url" id="edit-foto-projeto" placeholder="https://exemplo.com/imagem.jpg">

                <div class="modal-edicao-acoes">
                    <button type="button" class="btn-secundario" id="btn-cancelar-edicao">Cancelar</button>
                    <button type="submit" class="btn-secundario" id="btn-salvar-edicao" style="background:#2563eb;">Salvar alterações</button>
                </div>

                <p id="status-edicao" role="status" aria-live="polite" style="margin-top:12px;"></p>
            </form>
        </div>
    `;

    document.body.appendChild(modalEdicao);

    formEdicao = document.getElementById("form-editar-projeto");
    editNomeInput = document.getElementById("edit-nome-projeto");
    editDescricaoInput = document.getElementById("edit-descricao-projeto");
    editLinkInput = document.getElementById("edit-link-projeto");
    editFotoInput = document.getElementById("edit-foto-projeto");
    btnSalvarEdicao = document.getElementById("btn-salvar-edicao");
    btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
    statusEdicao = document.getElementById("status-edicao");

    btnCancelarEdicao.addEventListener("click", fecharModalEdicao);

    modalEdicao.addEventListener("click", (e) => {
        if (e.target === modalEdicao) {
            fecharModalEdicao();
        }
    });

    formEdicao.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!projetoEmEdicaoId) return;

        const nome = editNomeInput.value.trim();
        const descricao = editDescricaoInput.value.trim();
        const link = editLinkInput.value.trim();
        const foto = editFotoInput.value.trim();

        if (!nome || !descricao) {
            statusEdicao.textContent = "Preencha nome e descrição.";
            statusEdicao.style.color = "#dc2626";
            return;
        }

        btnSalvarEdicao.disabled = true;
        btnSalvarEdicao.textContent = "Salvando...";
        statusEdicao.textContent = "";

        try {
            const { error } = await supabaseClient
                .from("projetos")
                .update({
                    nome,
                    descricao,
                    link: link || null,
                    foto: foto || null
                })
                .eq("id", projetoEmEdicaoId)
                .eq("usuario_id", usuarioId);

            if (error) throw error;

            mensagem.textContent = "Projeto atualizado com sucesso!";
            mensagem.style.color = "#16a34a";

            fecharModalEdicao();
            await carregarProjetos();
        } catch (err) {
            console.error("Erro ao atualizar projeto:", err);
            statusEdicao.textContent = "Não foi possível salvar as alterações.";
            statusEdicao.style.color = "#dc2626";
        } finally {
            btnSalvarEdicao.disabled = false;
            btnSalvarEdicao.textContent = "Salvar alterações";
        }
    });
}

function abrirModalEdicao(projeto) {
    criarModalEdicao();
    projetoEmEdicaoId = projeto.id;

    editNomeInput.value = projeto.nome || "";
    editDescricaoInput.value = projeto.descricao || "";
    editLinkInput.value = projeto.link || "";
    editFotoInput.value = projeto.foto || "";
    statusEdicao.textContent = "";

    modalEdicao.classList.add("aberto");
    editNomeInput.focus();
}

function fecharModalEdicao() {
    if (!modalEdicao) return;
    modalEdicao.classList.remove("aberto");
    projetoEmEdicaoId = null;
}

// ======================================
// FOTO DE PERFIL, FORMATO E MOVIMENTO (SUPABASE)
// ======================================

function aplicarEstiloFotoPerfil(src, formato, movimento) {
    if (!previewFotoPerfil) return;

    const formatoValido = ["quadrado", "retangulo", "circular"].includes(formato)
        ? formato
        : "circular";

    const movimentoValido = ["estatica", "cima-baixo", "girando"].includes(movimento)
        ? movimento
        : "estatica";

    previewFotoPerfil.className = `foto-perfil-img formato-${formatoValido} mov-${movimentoValido}`;

    if (src) {
        previewFotoPerfil.src = src;
        previewFotoPerfil.style.display = "block";
    } else {
        previewFotoPerfil.removeAttribute("src");
        previewFotoPerfil.style.display = "none";
    }
}

async function carregarConfigFotoPerfil() {
    try {
        const { data, error } = await supabaseClient
            .from("usuario")
            .select("foto_perfil, foto_formato, foto_movimento")
            .eq("id", usuarioId)
            .single();

        if (error) throw error;
        if (!data) return;

        const src = data.foto_perfil || "";
        const formato = data.foto_formato || "circular";
        const movimento = data.foto_movimento || "estatica";

        if (src && !src.startsWith("data:image/") && inputUrlFotoPerfil) {
            inputUrlFotoPerfil.value = src;
        }
        if (selectFormatoFoto) selectFormatoFoto.value = formato;
        if (selectMovimentoFoto) selectMovimentoFoto.value = movimento;

        aplicarEstiloFotoPerfil(src, formato, movimento);
    } catch (err) {
        console.error("Erro ao carregar foto de perfil do banco:", err);
    }
}

if (btnEscolherFoto && inputArquivoFoto) {
    btnEscolherFoto.addEventListener("click", () => {
        inputArquivoFoto.click();
    });

    inputArquivoFoto.addEventListener("change", () => {
        const arquivo = inputArquivoFoto.files && inputArquivoFoto.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = () => {
            const dataUrl = String(leitor.result || "");
            if (inputUrlFotoPerfil) inputUrlFotoPerfil.value = "";
            aplicarEstiloFotoPerfil(
                dataUrl,
                selectFormatoFoto ? selectFormatoFoto.value : "circular",
                selectMovimentoFoto ? selectMovimentoFoto.value : "estatica"
            );
        };
        leitor.readAsDataURL(arquivo);
    });
}

if (inputUrlFotoPerfil) {
    inputUrlFotoPerfil.addEventListener("input", () => {
        aplicarEstiloFotoPerfil(
            inputUrlFotoPerfil.value.trim(),
            selectFormatoFoto ? selectFormatoFoto.value : "circular",
            selectMovimentoFoto ? selectMovimentoFoto.value : "estatica"
        );
    });
}

if (selectFormatoFoto) {
    selectFormatoFoto.addEventListener("change", () => {
        aplicarEstiloFotoPerfil(
            previewFotoPerfil ? previewFotoPerfil.getAttribute("src") || "" : "",
            selectFormatoFoto.value,
            selectMovimentoFoto ? selectMovimentoFoto.value : "estatica"
        );
    });
}

if (selectMovimentoFoto) {
    selectMovimentoFoto.addEventListener("change", () => {
        aplicarEstiloFotoPerfil(
            previewFotoPerfil ? previewFotoPerfil.getAttribute("src") || "" : "",
            selectFormatoFoto ? selectFormatoFoto.value : "circular",
            selectMovimentoFoto.value
        );
    });
}

if (btnSalvarPerfil) {
    btnSalvarPerfil.addEventListener("click", async () => {
        const srcAtual =
            (inputUrlFotoPerfil && inputUrlFotoPerfil.value.trim()) ||
            (previewFotoPerfil && previewFotoPerfil.getAttribute("src")) ||
            "";
        const formatoAtual = selectFormatoFoto ? selectFormatoFoto.value : "circular";
        const movimentoAtual = selectMovimentoFoto ? selectMovimentoFoto.value : "estatica";

        aplicarEstiloFotoPerfil(srcAtual, formatoAtual, movimentoAtual);

        btnSalvarPerfil.disabled = true;
        btnSalvarPerfil.textContent = "Salvando...";
        if (statusPerfil) statusPerfil.textContent = "";

        try {
            const { error } = await supabaseClient
                .from("usuario")
                .update({
                    foto_perfil: srcAtual || null,
                    foto_formato: formatoAtual,
                    foto_movimento: movimentoAtual
                })
                .eq("id", usuarioId);

            if (error) throw error;

            if (statusPerfil) {
                statusPerfil.textContent = "Foto de perfil salva no banco de dados!";
                statusPerfil.style.color = "#16a34a";
            }
        } catch (err) {
            console.error("Erro ao salvar foto de perfil no Supabase:", err);
            if (statusPerfil) {
                statusPerfil.textContent = `Erro ao salvar no banco: ${err.message || "tente novamente."}`;
                statusPerfil.style.color = "#dc2626";
            }
        } finally {
            btnSalvarPerfil.disabled = false;
            btnSalvarPerfil.textContent = "Salvar foto de perfil";
        }
    });
}

// ======================================
// CADASTRAR PROJETO
// ======================================

if (formulario) {
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
}

// ======================================
// CARREGAR PROJETOS
// ======================================

async function carregarProjetos() {
    if (!listaProjetos) return;

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

    const editar = document.createElement("button");
    editar.type = "button";
    editar.className = "editar-btn";
    editar.textContent = "Editar";
    editar.addEventListener("click", () => {
        abrirModalEdicao(projeto);
    });

    const excluir = document.createElement("button");

    excluir.type = "button";
    excluir.className = "excluir-btn";
    excluir.textContent = "Excluir";

    excluir.addEventListener("click", () => {
        excluirProjeto(projeto.id);
    });

    info.appendChild(editar);
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
// CARREGAR MENSAGENS (TABELA LEADS)
// ======================================

async function carregarLeads() {
    if (!listaLeads) return;

    listaLeads.replaceChildren();
    const carregando = document.createElement("p");
    carregando.textContent = "Carregando mensagens...";
    listaLeads.appendChild(carregando);

    try {
        const { data, error } = await supabaseClient
            .from("leads")
            .select("id, nome, email, telefone, mensagem, created_at")
            .order("created_at", { ascending: false });

        if (error) throw error;

        listaLeads.replaceChildren();

        if (!data || data.length === 0) {
            const vazio = document.createElement("p");
            vazio.textContent = "Nenhuma mensagem recebida até o momento.";
            listaLeads.appendChild(vazio);
            return;
        }

        data.forEach((lead) => {
            criarCardLead(lead);
        });

    } catch (error) {
        console.error("Erro ao carregar leads:", error);
        listaLeads.replaceChildren();
        const erro = document.createElement("p");
        erro.textContent = "Erro ao carregar as mensagens.";
        listaLeads.appendChild(erro);
    }
}

function criarCardLead(lead) {
    const card = document.createElement("article");
    card.className = "lead-card";

    const cabecalho = document.createElement("div");
    cabecalho.className = "lead-cabecalho";

    const nome = document.createElement("h3");
    nome.textContent = lead.nome || "Sem nome";

    const dataFormatada = lead.created_at
        ? new Date(lead.created_at).toLocaleString("pt-BR")
        : "";

    const dataEl = document.createElement("span");
    dataEl.textContent = dataFormatada;

    cabecalho.appendChild(nome);
    cabecalho.appendChild(dataEl);

    const meta = document.createElement("p");
    meta.className = "lead-meta";
    const partesMeta = [];
    if (lead.email) partesMeta.push(`E-mail: ${lead.email}`);
    if (lead.telefone) partesMeta.push(`Telefone: ${lead.telefone}`);
    meta.textContent = partesMeta.join(" | ");

    const texto = document.createElement("p");
    texto.className = "lead-texto";
    texto.textContent = lead.mensagem || "";

    const acoes = document.createElement("div");
    acoes.style.display = "flex";
    acoes.style.gap = "10px";
    acoes.style.flexWrap = "wrap";

    if (lead.email) {
        const responderEmail = document.createElement("a");
        const assunto = encodeURIComponent(`Resposta ao seu contato — ${lead.nome || "Portfólio"}`);
        const corpo = encodeURIComponent(
            `Olá ${lead.nome || ""},\n\nObrigado pela mensagem enviada pelo meu site!\n\n--- Sua mensagem ---\n${lead.mensagem || ""}\n\n`
        );

        responderEmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${assunto}&body=${corpo}`;
        responderEmail.target = "_blank";
        responderEmail.rel = "noopener noreferrer";
        responderEmail.textContent = "Responder por E-mail";
        responderEmail.className = "btn-secundario";
        responderEmail.style.textDecoration = "none";
        responderEmail.style.display = "inline-block";

        acoes.appendChild(responderEmail);
    }

    if (lead.telefone) {
        const apenasNumeros = String(lead.telefone).replace(/\D/g, "");
        if (apenasNumeros.length >= 10) {
            const numeroComDDI = apenasNumeros.startsWith("55") ? apenasNumeros : `55${apenasNumeros}`;
            const textoZap = encodeURIComponent(`Olá ${lead.nome || ""}, vi sua mensagem no meu site!`);

            const responderZap = document.createElement("a");
            responderZap.href = `https://wa.me/${numeroComDDI}?text=${textoZap}`;
            responderZap.target = "_blank";
            responderZap.rel = "noopener noreferrer";
            responderZap.textContent = "Responder no WhatsApp";
            responderZap.className = "btn-secundario";
            responderZap.style.textDecoration = "none";
            responderZap.style.display = "inline-block";

            acoes.appendChild(responderZap);
        }
    }

    const excluir = document.createElement("button");
    excluir.type = "button";
    excluir.className = "excluir-btn";
    excluir.textContent = "Excluir mensagem";
    excluir.addEventListener("click", () => excluirLead(lead.id));

    acoes.appendChild(excluir);

    card.appendChild(cabecalho);
    card.appendChild(meta);
    card.appendChild(texto);
    card.appendChild(acoes);

    listaLeads.appendChild(card);
}

async function excluirLead(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta mensagem?");
    if (!confirmar) return;

    try {
        const { error } = await supabaseClient
            .from("leads")
            .delete()
            .eq("id", id);

        if (error) throw error;

        await carregarLeads();
    } catch (error) {
        console.error("Erro ao excluir lead:", error);
        alert("Erro ao excluir a mensagem.");
    }
}

if (btnAtualizarLeads) {
    btnAtualizarLeads.addEventListener("click", carregarLeads);
}

// ======================================
// SAIR DO DASHBOARD
// ======================================

const btnSair = document.getElementById("btn-sair");
if (btnSair) {
    btnSair.addEventListener("click", () => {
        sessionStorage.removeItem("usuario_id");
        sessionStorage.removeItem("usuario_nome");
        window.location.replace("login.html");
    });
}

// ======================================
// INICIALIZAÇÃO
// ======================================

carregarConfigFotoPerfil();
carregarProjetos();
carregarLeads();