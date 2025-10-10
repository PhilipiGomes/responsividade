// Válvulas

// Controle das válvulas
let valvulaCount = 0;
let valvulas = []; // Lista local de válvulas

function renderValvulas() {
  const assets = document.getElementById("valvulasAssets");
  if (!assets) return;
  // Remove linhas antigas e válvulas antigas
  Array.from(assets.querySelectorAll(".valvulas-row")).forEach((r) =>
    r.remove()
  );
  Array.from(assets.querySelectorAll(".valvula-box")).forEach((b) =>
    b.remove()
  );

  // Cria os elementos das válvulas a partir da lista
  const boxes = valvulas.map((valvula) => {
    const box = document.createElement("div");
    box.className = "valvula-box";
    box.id = "valvula" + valvula.id;

    // Trunca o nome para 20 caracteres
    const nomeDisplay = valvula.nome.length > 10
      ? valvula.nome.substring(0, 10) + '...'
      : valvula.nome;

    box.innerHTML = `
      <div class="valvula-label" data-id="${valvula.id}" style="cursor:pointer;">${nomeDisplay}</div>
      <div class="status" id="statusValvula${valvula.id}">${valvula.ativada ? "Ativada" : "Desativada"}</div>
      <img class="mdi-valve-closed" id="imgValvula${valvula.id}Closed" src="/static/img/mdi--valve.svg" alt="valvulaFechada"/>
      <img class="mdi-valve-open" id="imgValvula${valvula.id}Open" src="/static/img/mdi--valve-open.svg" alt="valvulaAberta"/>
      <button class="toggle-btn ${valvula.ativada ? "ativada" : "desativada"}" id="btnValvula${valvula.id}">${valvula.ativada ? "Desativar" : "Ativar"}</button>
    `;
    return box;
  });

  // Cálculo dinâmico de válvulas por linha
  const valvulasExemplo = document.getElementById("valvulasExemplo");
  let containerWidth = 1080; // fallback padrão
  if (valvulasExemplo) {
    containerWidth =
      valvulasExemplo.clientWidth || valvulasExemplo.offsetWidth || 1080;
  }
  const boxWidth = 180 + 24; // largura da válvula + gap horizontal
  const perRow = Math.max(1, Math.floor((containerWidth + 24) / boxWidth));

  // Agrupa em linhas dinâmicas
  let rows = [];
  for (let i = 0; i < boxes.length; i += perRow) {
    const row = document.createElement("div");
    row.className = "valvulas-row";
    row.style.display = "flex";
    row.style.flexDirection = "row";
    row.style.gap = "24px";
    row.style.marginBottom = "24px";
    boxes.slice(i, i + perRow).forEach((b) => row.appendChild(b));
    rows.push(row);
  }

  // Insere as linhas
  rows.forEach((r) => {
    assets.appendChild(r);
  });

  // Setup eventos
  boxes.forEach((b, idx) => {
    const valvula = valvulas[idx];
    setupValvula(valvula.id);
    setupValvulaLabel(b.querySelector(".valvula-label"));
  });
}

function setupValvula(id) {
  const btn = document.getElementById("btnValvula" + id);
  const img_open = document.getElementById("imgValvula" + id + "Open");
  const img_closed = document.getElementById("imgValvula" + id + "Closed");
  const status = document.getElementById("statusValvula" + id);
  if (!btn || !img_open || !img_closed || !status) return;

  btn.onclick = null;

  // Busca a válvula na lista local
  const valvula = valvulas.find((v) => v.id === Number(id));
  if (!valvula) return;

  function updateUI() {
    if (valvula.ativada) {
      status.textContent = "Ativada";
      status.classList.add("ativada");
      status.classList.remove("desativada");
      btn.textContent = "Desativar";
      btn.classList.add("ativada");
      btn.classList.remove("desativada");
    } else {
      status.textContent = "Desativada";
      status.classList.remove("ativada");
      status.classList.add("desativada");
      btn.textContent = "Ativar";
      btn.classList.remove("ativada");
      btn.classList.add("desativada");
    }
  }

  updateUI();

  btn.onclick = function () {
    const container = btn.closest(".valvula-box");
    if (container) {
      if (!valvula.ativada) {
        container.classList.add("show-image");
      } else {
        container.classList.remove("show-image");
      }
    }
    valvula.ativada = !valvula.ativada;
    updateUI();
  };
}

function setupValvulaLabel(label) {
  if (!label) return;
  label.onclick = function (e) {
    const valvulaId = label.getAttribute("data-id");
    showValvulaActionsModal(valvulaId);
    e.stopPropagation();
  };
}

// Adicionar válvula dinamicamente
const adicionarValvula = document.getElementById("adicionarValvula");
const valvulasAssets = document.getElementById("valvulasAssets");
if (adicionarValvula && valvulasAssets) {
  adicionarValvula.onclick = function () {
    showAddValvulaModal((nome, serial) => {
      valvulaCount++;
      valvulas.push({
        id: valvulaCount,
        nome,
        serial,
        ativada: false,
      });
      renderValvulas();
    });
  };
}

// Modal de confirmação customizada
function showConfirmModal(msg, onConfirm, onCancel) {
  let modal = document.getElementById("confirmModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "confirmModal";
    modal.innerHTML = `
      <div class="custom-modal-content">
        <div class="custom-modal-title">Confirmação</div>
        <div class="custom-modal-msg"></div>
        <div class="custom-modal-actions">
          <button class="custom-modal-btn custom-modal-btn-yes">Sim</button>
          <button class="custom-modal-btn custom-modal-btn-no">Não</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.querySelector(".custom-modal-msg").textContent = msg;
  modal.style.display = "flex";
  modal.querySelector(".custom-modal-btn-yes").onclick = () => {
    modal.style.display = "none";
    onConfirm();
  };
  modal.querySelector(".custom-modal-btn-no").onclick = () => {
    modal.style.display = "none";
    if (onCancel) onCancel();
  };

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      if (onCancel) onCancel();
    }
  };
}

// Modal para adicionar válvula
function showAddValvulaModal(onAdd) {
  let modal = document.getElementById("addValvulaModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "addValvulaModal";
    modal.innerHTML = `
      <div class="custom-modal-content">
        <div class="custom-modal-title">Adicionar Válvula</div>
        <div style="width:100%;margin-bottom:16px;">
          <label>Nome</label>
          <input id="addValvulaNome" type="text" maxlength="50">
          <label>Localização</label>
          <input id="addValvulaSerial" type="text" maxlength="50">
        </div>
        <div class="custom-modal-actions">
          <button class="custom-modal-btn custom-modal-btn-yes" id="addValvulaConfirm">Adicionar</button>
          <button class="custom-modal-btn custom-modal-btn-no" id="addValvulaCancel">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
  const nomeInput = modal.querySelector("#addValvulaNome");
  const serialInput = modal.querySelector("#addValvulaSerial");
  nomeInput.value = "";
  serialInput.value = "";
  nomeInput.focus();

  modal.querySelector("#addValvulaConfirm").onclick = () => {
    const nome = nomeInput.value.trim();
    const serial = serialInput.value.trim();

    // Validação
    if (!nome || !serial) {
      alert("Por favor, preencha todos os campos!");
      nomeInput.focus();
      return;
    }

    if (nome.length > 50 || serial.length > 50) {
      alert("Nome e localização devem ter no máximo 50 caracteres!");
      return;
    }

    modal.style.display = "none";
    onAdd(nome, serial);
  };
  modal.querySelector("#addValvulaCancel").onclick = () => {
    modal.style.display = "none";
  };

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}

// Modal para editar válvula
function showEditValvulaModal(valvulaId) {
  let modal = document.getElementById("editValvulaModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "editValvulaModal";
    modal.innerHTML = `
      <div class="custom-modal-content">
        <div class="custom-modal-title">Editar Válvula</div>
        <div style="width:100%;margin-bottom:16px;">
          <label>Nome</label>
          <input id="editValvulaNome" type="text" maxlength="50">
          <label>Localização</label>
          <input id="editValvulaSerial" type="text" maxlength="50">
        </div>
        <div class="custom-modal-actions">
          <button class="custom-modal-btn custom-modal-btn-yes" id="editValvulaConfirm">Salvar</button>
          <button class="custom-modal-btn custom-modal-btn-no" id="editValvulaCancel">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const valvula = valvulas.find((v) => v.id === Number(valvulaId));
  if (!valvula) return;

  modal.style.display = "flex";
  const nomeInput = modal.querySelector("#editValvulaNome");
  const serialInput = modal.querySelector("#editValvulaSerial");
  nomeInput.value = valvula.nome;
  serialInput.value = valvula.serial;
  nomeInput.focus();

  modal.querySelector("#editValvulaConfirm").onclick = () => {
    const nome = nomeInput.value.trim();
    const serial = serialInput.value.trim();

    // Validação
    if (!nome || !serial) {
      alert("Por favor, preencha todos os campos!");
      nomeInput.focus();
      return;
    }

    if (nome.length > 50 || serial.length > 50) {
      alert("Nome e localização devem ter no máximo 50 caracteres!");
      return;
    }

    valvula.nome = nome;
    valvula.serial = serial;
    modal.style.display = "none";
    renderValvulas();
  };

  modal.querySelector("#editValvulaCancel").onclick = () => {
    modal.style.display = "none";
    // Volta para a modal de informações
    showValvulaActionsModal(valvulaId);
  };

  // Fechar ao clicar fora - volta para modal de informações
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      showValvulaActionsModal(valvulaId);
    }
  };
}

// Nova modal de ações da válvula (ao clicar no nome)
function showValvulaActionsModal(valvulaId) {
  let modal = document.getElementById("valvulaActionsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "valvulaActionsModal";
    modal.innerHTML = `
      <div class="custom-modal-content">
        <div class="custom-modal-title">Informações da Válvula</div>
        <div class="valvula-info" id="valvulaInfoContent">
        </div>
        <div class="custom-modal-actions">
          <button class="custom-modal-btn custom-modal-btn-yes" id="valvulaEditBtn">Editar</button>
          <button class="custom-modal-btn custom-modal-btn-delete" id="valvulaDeleteBtn">Excluir</button>
          <button class="custom-modal-btn custom-modal-btn-no" id="valvulaCloseBtn">Fechar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const valvula = valvulas.find((v) => v.id === Number(valvulaId));
  if (!valvula) return;

  const infoContent = modal.querySelector("#valvulaInfoContent");
  infoContent.innerHTML = `
    <div class="valvula-info-item">
      <span class="valvula-info-label">Nome:</span>
      <span class="valvula-info-value">${valvula.nome}</span>
    </div>
    <div class="valvula-info-item">
      <span class="valvula-info-label">Localização:</span>
      <span class="valvula-info-value">${valvula.serial}</span>
    </div>
    <div class="valvula-info-item">
      <span class="valvula-info-label">Status:</span>
      <span class="valvula-info-value">${valvula.ativada ? "Ativada" : "Desativada"}</span>
    </div>
  `;

  modal.style.display = "flex";

  modal.querySelector("#valvulaEditBtn").onclick = () => {
    modal.style.display = "none";
    showEditValvulaModal(valvulaId);
  };

  modal.querySelector("#valvulaDeleteBtn").onclick = () => {
    modal.style.display = "none";
    showConfirmModal(
      "Deseja realmente excluir esta válvula?",
      () => {
        valvulas = valvulas.filter((v) => v.id !== Number(valvulaId));
        renderValvulas();
      },
      () => {
        // Callback de cancelamento - volta para modal de informações
        showValvulaActionsModal(valvulaId);
      }
    );
  };

  modal.querySelector("#valvulaCloseBtn").onclick = () => {
    modal.style.display = "none";
  };

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}

// Inicialização: se houver válvulas no HTML, adiciona à lista local
document.querySelectorAll(".valvula-box").forEach((box) => {
  const label = box.querySelector(".valvula-label");
  if (label) {
    const text = label.textContent || "";
    const match = text.match(/^(.*)\s+\((.*)\)$/);
    let nome = "",
      serial = "";
    if (match) {
      nome = match[1];
      serial = match[2];
    } else {
      nome = text;
      serial = "";
    }
    valvulaCount++;
    valvulas.push({
      id: valvulaCount,
      nome,
      serial,
      ativada: false,
    });
  }
});
renderValvulas();

// Estação Meteorológica
const estacaoContainer = document.getElementById("estacaoContainer");
const estacaoExemplo = document.getElementById("estacaoExemplo");

// Mock para últimas 24h (hora a hora)
const weatherCardsData = {
  "24h": [
    {
      title: "00h",
      temp: 19,
      min: 16,
      max: 27,
      umidade: 80,
      vento: 8,
      chuva: 0,
    },
    {
      title: "03h",
      temp: 18,
      min: 16,
      max: 27,
      umidade: 82,
      vento: 7,
      chuva: 0,
    },
    {
      title: "06h",
      temp: 17,
      min: 16,
      max: 27,
      umidade: 85,
      vento: 6,
      chuva: 0,
    },
    {
      title: "09h",
      temp: 20,
      min: 16,
      max: 27,
      umidade: 70,
      vento: 10,
      chuva: 0,
    },
    {
      title: "12h",
      temp: 24,
      min: 16,
      max: 27,
      umidade: 60,
      vento: 12,
      chuva: 0,
    },
    {
      title: "15h",
      temp: 27,
      min: 16,
      max: 27,
      umidade: 55,
      vento: 14,
      chuva: 0,
    },
    {
      title: "18h",
      temp: 25,
      min: 16,
      max: 27,
      umidade: 65,
      vento: 11,
      chuva: 0,
    },
    {
      title: "21h",
      temp: 22,
      min: 16,
      max: 27,
      umidade: 75,
      vento: 9,
      chuva: 0,
    },
  ],
  semana: [
    {
      title: "Seg",
      temp: 27,
      min: 16,
      max: 27,
      desc: "Ensolarado",
      umidade: 60,
      vento: 10,
      chuva: 0,
    },
    {
      title: "Ter",
      temp: 22,
      min: 16,
      max: 27,
      desc: "Nublado",
      umidade: 65,
      vento: 12,
      chuva: 2,
    },
    {
      title: "Qua",
      temp: 28,
      min: 16,
      max: 27,
      desc: "Sol",
      umidade: 58,
      vento: 11,
      chuva: 0,
    },
    {
      title: "Qui",
      temp: 19,
      min: 16,
      max: 27,
      desc: "Chuva",
      umidade: 80,
      vento: 8,
      chuva: 10,
    },
    {
      title: "Sex",
      temp: 24,
      min: 16,
      max: 27,
      desc: "Nublado",
      umidade: 70,
      vento: 9,
      chuva: 1,
    },
    {
      title: "Sáb",
      temp: 25,
      min: 16,
      max: 27,
      desc: "Sol",
      umidade: 62,
      vento: 10,
      chuva: 0,
    },
    {
      title: "Dom",
      temp: 26,
      min: 16,
      max: 27,
      desc: "Ensolarado",
      umidade: 60,
      vento: 8,
      chuva: 0,
    },
  ],
  mes: [
    {
      title: "01/06",
      temp: 25,
      min: 15,
      max: 28,
      desc: "Sol",
      umidade: 60,
      vento: 10,
      chuva: 0,
    },
    {
      title: "05/06",
      temp: 23,
      min: 14,
      max: 27,
      desc: "Nublado",
      umidade: 65,
      vento: 12,
      chuva: 2,
    },
    {
      title: "10/06",
      temp: 21,
      min: 13,
      max: 26,
      desc: "Chuva",
      umidade: 80,
      vento: 8,
      chuva: 10,
    },
    {
      title: "15/06",
      temp: 27,
      min: 16,
      max: 29,
      desc: "Ensolarado",
      umidade: 58,
      vento: 11,
      chuva: 0,
    },
    {
      title: "20/06",
      temp: 28,
      min: 17,
      max: 30,
      desc: "Sol",
      umidade: 62,
      vento: 10,
      chuva: 0,
    },
    {
      title: "25/06",
      temp: 22,
      min: 15,
      max: 27,
      desc: "Nublado",
      umidade: 70,
      vento: 9,
      chuva: 1,
    },
    {
      title: "30/06",
      temp: 26,
      min: 16,
      max: 28,
      desc: "Sol",
      umidade: 60,
      vento: 8,
      chuva: 0,
    },
  ],
};

// Clima atual fixo (mock)
const climaAtual = {
  temp: 27,
  min: 16,
  max: 27,
  umidade: 74,
  vento: 12,
  chuva: 57,
};

function updateWeatherMain() {
  document.getElementById("weatherTemp").textContent = climaAtual.temp;
  document.getElementById("weatherMin").textContent = climaAtual.min;
  document.getElementById("weatherMax").textContent = climaAtual.max;
  document.getElementById("weatherHumidity").textContent =
    climaAtual.umidade + "%";
  document.getElementById("weatherWind").textContent =
    climaAtual.vento + "km/h";
  document.getElementById("weatherRain").textContent = climaAtual.chuva + "%";
}

// Função auxiliar para retornar os dados das abas umidade, vento, chuva
function getCardsByTab(period, tab) {
  const data = weatherCardsData[period] || [];
  if (tab === "umidade") {
    return data.map((d) => {
      let label = "";
      if (d.umidade < 30) {
        label = "Muito baixa";
      } else if (d.umidade < 60) {
        label = "Baixa";
      } else if (d.umidade < 80) {
        label = "Moderada";
      } else {
        label = "Alta";
      }
      return {
        title: d.title,
        value: d.umidade + "%",
        label: label,
      };
    });
  }
  if (tab === "vento") {
    return data.map((d) => {
      let label = "";
      if (d.vento < 5) {
        label = "Calmo";
      } else if (d.vento < 15) {
        label = "Moderado";
      } else {
        label = "Forte";
      }
      return {
        title: d.title,
        value: d.vento + " km/h",
        label: label,
      };
    });
  }
  if (tab === "chuva") {
    return data.map((d) => {
      let label = "";
      if (d.chuva === 0) {
        label = "Sem chuva";
      } else if (d.chuva < 5) {
        label = "Pouca chuva";
      } else if (d.chuva < 20) {
        label = "Chuva moderada";
      } else {
        label = "Chuva intensa";
      }
      return {
        title: d.title,
        value: d.chuva + "mm",
        label: label,
      };
    });
  }
  return [];
}

function renderWeatherCards(period, tab) {
  const cards = document.getElementById("weatherCards");
  if (!cards) return;
  cards.innerHTML = "";
  if (tab === "visao") {
    if (period === "24h") {
      (weatherCardsData["24h"] || []).forEach((item) => {
        const card = document.createElement("div");
        card.className = "weather-card";
        card.innerHTML = `
          <div class="weather-card-title">${item.title}</div>
          <div class="weather-card-temp">${item.temp}°C</div>
          <div class="weather-card-minmax">min ${item.min}°C<br>max ${item.max}°C</div>
        `;
        cards.appendChild(card);
      });
    } else {
      (weatherCardsData[period] || []).forEach((item) => {
        const card = document.createElement("div");
        card.className = "weather-card";
        card.innerHTML = `
          <div class="weather-card-title">${item.title}</div>
          <div class="weather-card-temp">${item.temp}°C</div>
          <div class="weather-card-minmax">min ${item.min}°C<br>max ${item.max}°C</div>
        `;
        cards.appendChild(card);
      });
    }
  } else {
    const data = getCardsByTab(period, tab);
    data.forEach((item) => {
      const div = document.createElement("div");
      div.className = "weather-card";
      div.innerHTML = `
        <div class="weather-card-title">${item.title}</div>
        <div class="weather-card-temp">${item.value}</div>
        <div class="weather-card-desc">${item.label}</div>
      `;
      cards.appendChild(div);
    });
  }
  cards.style.display = cards.children.length > 0 ? "flex" : "";
}

let currentTab = "visao";
let currentPeriod = "24h";

function updateWeatherCards() {
  renderWeatherCards(currentPeriod, currentTab);
  updateWeatherMain();
}

// Dropdown de período
const weatherPeriod = document.getElementById("weatherPeriod");
if (weatherPeriod) {
  weatherPeriod.addEventListener("change", function (e) {
    currentPeriod = weatherPeriod.value;
    updateWeatherCards();
  });
  currentPeriod = weatherPeriod.value;
}

// Abas
document.querySelectorAll(".weather-tab").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    document
      .querySelectorAll(".weather-tab")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTab = btn.getAttribute("data-tab");
    updateWeatherCards();
    e.stopPropagation();
  });
});

// Inicializa
updateWeatherCards();
renderValvulas();

// Menu do usuário
const accountIcon = document.querySelector('.codicon-account');
let userMenu = null;

if (accountIcon) {
  accountIcon.addEventListener('click', function (e) {
    e.stopPropagation();

    // Se o menu já existe, remove
    if (userMenu && userMenu.style.display === 'block') {
      userMenu.style.display = 'none';
      return;
    }

    // Cria o menu se não existir
    if (!userMenu) {
      userMenu = document.createElement('div');
      userMenu.className = 'user-menu';
      userMenu.innerHTML = `
        <div class="user-menu-item" id="voltarInicio">
          ← Voltar para a página inicial
        </div>
      `;
      document.body.appendChild(userMenu);

      // Adiciona evento de clique no item
      document.getElementById('voltarInicio').addEventListener('click', function () {
        window.location.href = '/';
      });
    }

    // Mostra o menu
    userMenu.style.display = 'block';
  });

  // Fecha o menu ao clicar fora
  document.addEventListener('click', function (e) {
    if (userMenu && !userMenu.contains(e.target) && e.target !== accountIcon) {
      userMenu.style.display = 'none';
    }
  });
}