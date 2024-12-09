const nomeUsuario = prompt("Qual o seu nome?");
const nome = { name: nomeUsuario };
const UUID = "47271488-4afa-4adb-904a-2ea78a05bc20";

const enviarNome = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/" + UUID, nome);
enviarNome.then(processarResposta).catch(processarErro);

function processarResposta(resposta) {
    console.log("Usuário entrou na sala:", resposta);
}
function processarErro(erro) {
    console.error("Erro ao entrar na sala:", erro.response.status, erro.response.data);
    alert("Erro ao entrar na sala. Por favor, tente outro nome.");
    location.reload();
}

function manterConexao() {
    axios.post(`https://mock-api.driven.com.br/api/v6/uol/status/${UUID}`, nome)
        .catch(erro => {
            console.error("Erro ao manter conexão:", erro);
            alert("Conexão perdida. Recarregando a página...");
            location.reload();
        });
}
setInterval(manterConexao, 5000);


function buscarMensagens() {
    const urlMensagens = `https://mock-api.driven.com.br/api/v6/uol/messages/${UUID}`;
    
    axios.get(urlMensagens)
        .then(processarMensagens)
        .catch(erro => console.error("Erro ao buscar mensagens:", erro));
}

function processarMensagens(resposta) {
    const mensagens = resposta.data;
    const chat = document.querySelector(".chat");

    chat.innerHTML = "";

    mensagens.forEach(mensagem => {
        if (
            mensagem.type === "private_message" && 
            mensagem.to !== nomeUsuario && 
            mensagem.from !== nomeUsuario
        ) {
            return;
        }

        const mensagemElemento = document.createElement("div");
        mensagemElemento.classList.add(`mensagem_${mensagem.type}`);
        
        if (mensagem.type === "status") {
            mensagemElemento.innerHTML = `<span>[${mensagem.time}]</span> <strong> ${mensagem.from} </strong>: ${mensagem.text}`;
        } else if (mensagem.type === "message") {
            mensagemElemento.innerHTML = `<span>[${mensagem.time}]</span> <strong> ${mensagem.from} </strong> para <strong> ${mensagem.to} </strong>: ${mensagem.text}`;
        } else if (mensagem.type === "private_message") {
            mensagemElemento.innerHTML = `<span>[${mensagem.time}]</span> <strong> ${mensagem.from} </strong> reservadamente para <strong> ${mensagem.to} </strong>: ${mensagem.text}`;
        }

        chat.appendChild(mensagemElemento);
    });

    chat.lastElementChild?.scrollIntoView();
}

setInterval(buscarMensagens, 3000);

const form = document.querySelector(".enviar_mensagens_form");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const mensagemInput = document.querySelector(".input_mensagem");
    const mensagemTexto = mensagemInput.value.trim();
    
    if (mensagemTexto === "") return;

    const mensagem = {
        from: nomeUsuario,
        to: destinatario || "Todos",
        text: mensagemTexto,
        type: visibilidade || "message"
    };

    axios.post(`https://mock-api.driven.com.br/api/v6/uol/messages/${UUID}`, mensagem)
        .then(() => {
            mensagemInput.value = "";
            buscarMensagens();
        })
        .catch(erro => {
            console.error("Erro ao enviar mensagem:", erro);
            alert("Você foi desconectado. Recarregando a página...");
            location.reload();
        });
});

let destinatario = "Todos";
let visibilidade = "message";


function atualizarParticipantes() {
    axios.get(`https://mock-api.driven.com.br/api/v6/uol/participants/${UUID}`)
        .then(resposta => {
            const participantes = resposta.data;
            const container = document.querySelector(".destinatarios");
            container.innerHTML = "";

            container.innerHTML = `
                <button class="botao" onclick="selecionarDestinatario('Todos')">
                    <span class="material-symbols-outlined">group</span>
                    <p>Todos</p>
                    <span class="check-icon">✔</span>
                </button>
            `;

            participantes.forEach(participante => {
                container.innerHTML += `
                    <button class="botao" onclick="selecionarDestinatario('${participante.name}')">
                        <span class="material-symbols-outlined">person</span>
                        <p>${participante.name}</p>
                        <span class="check-icon">✔</span>
                    </button>
                `;
            });

            atualizarSelecao(destinatario, ".destinatarios .botao");
        })
        .catch(erro => console.error("Erro ao buscar participantes:", erro));
}

function selecionarDestinatario(nome) {
    destinatario = nome;
    document.querySelector(".input_mensagem").placeholder = `Mensagem para ${destinatario}`;
    atualizarSelecao(destinatario, ".destinatarios .botao");
}

function selecionarVisibilidade(tipo) {
    visibilidade = tipo;
    atualizarSelecao(tipo === "message" ? "Público" : "Reservado", ".visibilidade .botao");
}

function atualizarSelecao(nome, seletor) {
    const botoes = document.querySelectorAll(seletor);
    botoes.forEach(botao => {
        botao.classList.remove("selecionado");
        const textoBotao = botao.querySelector("p").textContent.trim();
        if (textoBotao === nome) {
            botao.classList.add("selecionado");
        }
    });
}


setInterval(atualizarParticipantes, 5000);

function exibirMenu() {
    const menu = document.querySelector(".overlay");
    menu.classList.add("visivel");

    menu.addEventListener("click", function(event) {
        if (event.target === menu) {
            menu.classList.remove("visivel");
        }
    });
}
