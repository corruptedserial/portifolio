
const SUPABASE_URL = "https://zivdjnfypxjogmwmzfxl.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const formulario = document.getElementById("form-login");
const campoUsuario = document.getElementById("usuario");
const campoSenha = document.getElementById("senha");
const mensagem = document.getElementById("mensagem-login");

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = campoUsuario.value.trim();
    const senha = campoSenha.value;

    mensagem.textContent = "Verificando acesso...";

    try {
        const { data, error } = await supabaseClient
            .from("usuario")
            .select("id, nome")
            .eq("e-mail", email)
            .eq("senha", senha)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            mensagem.textContent = "E-mail ou senha incorretos.";
            mensagem.style.color = "#ef4444";
            return;
        }

        // Salva os dados do usuário
        sessionStorage.setItem("usuario_id", data.id);
        sessionStorage.setItem("usuario_nome", data.nome);

        mensagem.textContent = "Login realizado com sucesso!";
        mensagem.style.color = "#22c55e";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);

    } catch (error) {
        console.error("Erro:", error);

        mensagem.textContent = "Erro ao realizar login.";
        mensagem.style.color = "#ef4444";
    }
});
