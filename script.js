// ==========================================
// CONSTANTES E CONFIGURAÇÕES DO SISTEMA (T20)
// ==========================================
const mapaPericias = {
    'acrobacia': 'destreza', 'adestramento': 'carisma', 'atletismo': 'forca',
    'atuacao': 'carisma', 'cavalgar': 'destreza', 'conhecimento': 'inteligencia',
    'cura': 'sabedoria', 'diplomacia': 'carisma', 'enganacao': 'carisma',
    'fortitude': 'constituicao', 'furtividade': 'destreza', 'guerra': 'inteligencia',
    'iniciativa': 'destreza', 'intimidacao': 'carisma', 'intuicao': 'sabedoria',
    'investigacao': 'inteligencia', 'jogatina': 'carisma', 'luta': 'forca',
    'percepcao': 'sabedoria', 'pontaria': 'destreza', 'reflexos': 'destreza',
    'religiao': 'sabedoria', 'sobrevivencia': 'sabedoria', 'vontade': 'sabedoria'
};

const periciasSomenteTreinadas = [
    'adestramento', 'atuacao', 'conhecimento', 'guerra', 
    'jogatina', 'ladinagem', 'misticismo', 'nobreza', 
    'oficio', 'pilotagem', 'religiao'
];

// ==========================================
// ESTADO DO SISTEMA (PERSISTÊNCIA LOCAL)
// ==========================================
let listaFichas = JSON.parse(localStorage.getItem('listaFichas')) || [{ id: '1', nome: 'Personagem 1' }];
let fichaAtualId = localStorage.getItem('fichaAtualId') || '1';

// ==========================================
// FUNÇÕES AUXILIARES DE CRIPTOGRAFIA (BASE64)
// ==========================================
/**
 * Converte uma string UTF-8 para Base64 de forma segura (previne problemas com acentuação)
 */
function codificarParaBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

/**
 * Decodifica uma string Base64 de volta para UTF-8 de forma segura
 */
function decodificarDeBase64(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// ==========================================
// SISTEMA DE CÁLCULO DE PERÍCIAS
// ==========================================
function atualizarPericias() {
    let nivelInput = document.getElementById('nivel');
    let nivel = nivelInput ? (parseInt(nivelInput.value) || 0) : 0;
    let metadeNivel = Math.floor(nivel / 2);

    let bonusDeTreinoValor = 2;
    if (nivel >= 15) bonusDeTreinoValor = 6;
    else if (nivel >= 7) bonusDeTreinoValor = 4;

    let valoresAtributos = {
        'forca': parseInt(document.getElementById('forca')?.value) || 0,
        'destreza': parseInt(document.getElementById('destreza')?.value) || 0,
        'constituicao': parseInt(document.getElementById('constituicao')?.value) || 0,
        'inteligencia': parseInt(document.getElementById('inteligencia')?.value) || 0,
        'sabedoria': parseInt(document.getElementById('sabedoria')?.value) || 0,
        'carisma': parseInt(document.getElementById('carisma')?.value) || 0
    };

    let linhasDePericia = document.querySelectorAll('.pericia');

    linhasDePericia.forEach(function(linha) {
        let inputBonus = linha.querySelector('input[type="number"]:not([readonly])');
        let inputTotal = linha.querySelector('input[readonly]');
        let checkboxTreino = inlineObterCheckbox(linha);

        if (!inputBonus || !inputTotal) return;

        let idPericia = inputBonus.id;
        let nomeAtributo = mapaPericias[idPericia];
        let valorDoAtributo = valoresAtributos[nomeAtributo] || 0;
        let bonusExtra = parseInt(inputBonus.value) || 0;

        let estaTreinado = checkboxTreino ? checkboxTreino.checked : false;
        let bonusTreinado = estaTreinado ? bonusDeTreinoValor : 0;
        let precisaTreino = periciasSomenteTreinadas.includes(idPericia);

        if (precisaTreino && !estaTreinado) {
            inputTotal.value = ''; 
        } else {
            inputTotal.value = metadeNivel + valorDoAtributo + bonusExtra + bonusTreinado;
        }
    });
}

// Helper rápido para pegar checkbox interno
function inlineObterCheckbox(linha) {
    return linha.querySelector('input[type="checkbox"]');
}

// ==========================================
// GERENCIAMENTO DA FICHA (SALVAR, CARREGAR, EXCLUIR)
// ==========================================
function salvarFicha() {
    let elementos = document.querySelectorAll('input, textarea');
    let dadosFicha = {};
    
    elementos.forEach(function(elemento) {
        if (elemento.id) {
            if (elemento.type === 'checkbox') {
                dadosFicha[elemento.id] = elemento.checked;
            } else {
                dadosFicha[elemento.id] = elemento.value;
            }
        }
    });
    
    localStorage.setItem(`ficha_${fichaAtualId}`, JSON.stringify(dadosFicha));

    // Atualizar nome do personagem na lista lateral/topo
    let campoNome = document.getElementById('nome');
    let nomePersonagem = campoNome ? (campoNome.value || 'Personagem Sem Nome') : 'Personagem Sem Nome';
    
    let fichaNoArray = listaFichas.find(f => f.id === fichaAtualId);
    if (fichaNoArray && fichaNoArray.nome !== nomePersonagem) {
        fichaNoArray.nome = nomePersonagem;
        localStorage.setItem('listaFichas', JSON.stringify(listaFichas));
        desenharListaFichas();
    }
}

function carregarFicha(id) {
    fichaAtualId = id;
    localStorage.setItem('fichaAtualId', id);
    
    let dadosSalvos = localStorage.getItem(`ficha_${id}`);
    let elementos = document.querySelectorAll('input, textarea');
    
    // Limpar campos antes de carregar
    elementos.forEach(el => {
        if (el.id) {
            if (el.type === 'checkbox') el.checked = false;
            else el.value = '';
        }
    });

    if (dadosSalvos) {
        let dados = JSON.parse(dadosSalvos);
        elementos.forEach(function(elemento) {
            if (elemento.id && dados[elemento.id] !== undefined) {
                if (elemento.type === 'checkbox') {
                    elemento.checked = dados[elemento.id];
                } else {
                    elemento.value = dados[elemento.id];
                }
            }
        });
    }
    
    atualizarPericias();
}

function desenharListaFichas() {
    let container = document.getElementById('lista-de-fichas');
    if (!container) return;
    container.innerHTML = ''; 
    
    listaFichas.forEach(function(ficha) {
        let agrupador = document.createElement('span');
        agrupador.style.marginRight = '12px';
        agrupador.style.display = 'inline-block';

        let botaoFicha = document.createElement('button');
        botaoFicha.innerText = ficha.nome;
        botaoFicha.className = 'botao-seletor-ficha';
        
        if (ficha.id === fichaAtualId) {
            botaoFicha.style.fontWeight = 'bold';
            botaoFicha.style.background = '#ddd'; 
        }
        
        botaoFicha.onclick = function() {
            carregarFicha(ficha.id);
            desenharListaFichas();
        };

        let botaoApagar = document.createElement('button');
        botaoApagar.innerText = '❌';
        botaoApagar.style.marginLeft = '4px';
        botaoApagar.style.cursor = 'pointer';
        botaoApagar.title = 'Apagar esta ficha permanentemente';
        
        botaoApagar.onclick = function(evento) {
            evento.stopPropagation(); 
            excluirFicha(ficha.id);
        };

        agrupador.appendChild(botaoFicha);
        agrupador.appendChild(botaoApagar);
        container.appendChild(agrupador);
    });
}

function criarNovaFicha() {
    let novoId = Date.now().toString(); 
    listaFichas.push({ id: novoId, nome: 'Novo Personagem' });
    
    localStorage.setItem('listaFichas', JSON.stringify(listaFichas));
    
    desenharListaFichas();
    carregarFicha(novoId);
}

function excluirFicha(id) {
    let fichaParaDeletar = listaFichas.find(f => f.id === id);
    if (!fichaParaDeletar) return;
    
    let confirmar = confirm(`Tem certeza que deseja apagar permanentemente a ficha de "${fichaParaDeletar.nome}"?`);
    
    if (confirmar) {
        localStorage.removeItem(`ficha_${id}`);
        listaFichas = listaFichas.filter(f => f.id !== id);
        
        if (listaFichas.length === 0) {
            let novoId = Date.now().toString();
            listaFichas.push({ id: novoId, nome: 'Personagem 1' });
            fichaAtualId = novoId;
        } else if (fichaAtualId === id) {
            fichaAtualId = listaFichas[0].id;
        }
      
        localStorage.setItem('listaFichas', JSON.stringify(listaFichas));
        localStorage.setItem('fichaAtualId', fichaAtualId);
    
        desenharListaFichas();
        carregarFicha(fichaAtualId);
    }
}

// ==========================================
// IMPORTAÇÃO E EXPORTAÇÃO VIA LINKS
// ==========================================
function gerarLinkCompartilhamento() {
    let dadosSalvos = localStorage.getItem(`ficha_${fichaAtualId}`);
    
    if (!dadosSalvos) {
        alert("Erro: Não foi possível encontrar os dados da ficha atual para exportar.");
        return;
    }

    let dadosCodificados = codificarParaBase64(dadosSalvos);
    let urlBase = window.location.origin + window.location.pathname;
    let linkCompleto = `${urlBase}?importar=${dadosCodificados}`;

    let inputTemporario = document.createElement("input");
    inputTemporario.value = linkCompleto;
    document.body.appendChild(inputTemporario);
    inputTemporario.select();
    document.execCommand("copy");
    document.body.removeChild(inputTemporario);

    alert("Link de partilha copiado com sucesso! Agora é só colar e enviar.");
}

function verificarEImportarFichaDoLink() {
    let parametrosUrl = new URLSearchParams(window.location.search);
    let dadosFichaCodificados = parametrosUrl.get('importar');

    if (!dadosFichaCodificados) {
        return;
    }

    try {
        let dadosJsonString = decodificarDeBase64(dadosFichaCodificados);
        let dadosFichaImportada = JSON.parse(dadosJsonString);

        let novoId = Date.now().toString();
        let nomeOriginal = dadosFichaImportada.nome || 'Personagem Importado';
        let novoNome = `${nomeOriginal} (Importado)`;
        
        dadosFichaImportada.nome = novoNome;
        if (dadosFichaImportada.id) {
            dadosFichaImportada.id = novoId;
        }

        // Adiciona à base de dados local
        localStorage.setItem(`ficha_${novoId}`, JSON.stringify(dadosFichaImportada));

        // Atualiza a lista geral
        listaFichas.push({ id: novoId, name: novoNome, nome: novoNome });
        localStorage.setItem('listaFichas', JSON.stringify(listaFichas));

        // Define como a atual ativa
        fichaAtualId = novoId;
        localStorage.setItem('fichaAtualId', novoId);

        alert(`Ficha de "${nomeOriginal}" importada com sucesso!`);

    } catch (erro) {
        console.error("Erro ao importar a ficha do link:", erro);
        alert("Ops! Ocorreu um erro ao processar o link. Certifique-se de que o link de partilha está completo.");
    } finally {
        // Limpa o parâmetro da URL do navegador sem recarregar a página
        let urlSemParametros = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, urlSemParametros);
    }
}

// ==========================================
// INICIALIZAÇÃO DO SISTEMA & ESCUTADORES
// ==========================================
// 1. Tenta importar do link antes de desenhar a interface
verificarEImportarFichaDoLink();

// 2. Renderiza a lista de personagens guardados e carrega o personagem ativo
desenharListaFichas();
carregarFicha(fichaAtualId);

// 3. Regista os escutadores para autosave
let todosOsCampos = document.querySelectorAll('input, textarea');
todosOsCampos.forEach(function(campo) {
    campo.addEventListener('input', function() {
        atualizarPericias();
        salvarFicha();
    });
    campo.addEventListener('change', function() {
        atualizarPericias();
        salvarFicha();
    }); 
});
