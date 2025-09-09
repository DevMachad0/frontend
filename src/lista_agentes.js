import React, { useState, useEffect, useRef, useMemo } from "react";
import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ListaAgentesPage() {
  const [search, setSearch] = useState("");
  const [agentes, setAgentes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); // novo estado de loading
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Função para buscar agentes
  const fetchAgentes = () => {
    setLoading(true); // inicia loading
    const apiUrl = process.env.REACT_APP_API_URL;
    fetch(`${apiUrl}/agente/listar_agentes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAgentes(data);
        } else if (Array.isArray(data.agentes)) {
          setAgentes(data.agentes);
        } else {
          setAgentes([]);
        }
      })
      .catch(() => setAgentes([]))
      .finally(() => setLoading(false)); // encerra loading
  };

  useEffect(() => {
    fetchAgentes();
  }, []);

  // Filtra agentes por nome, modelo ou ia conforme o campo de busca
  const filteredAgentes = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return agentes;
    return agentes.filter((a) => {
      const nome = (a.nome_agente || "").toLowerCase();
      const modelo = (a.modelo || "").toLowerCase();
      const ia = (a.ia || "").toLowerCase();
      return nome.includes(q) || modelo.includes(q) || ia.includes(q);
    });
  }, [agentes, search]);

  // Se o agente selecionado não está mais na lista filtrada, limpa a seleção
  useEffect(() => {
    if (selectedId == null) return;
    const found = filteredAgentes.some((a) => a.id === selectedId);
    if (!found) setSelectedId(null);
  }, [filteredAgentes, selectedId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Função para excluir agente
  const handleExcluir = () => {
    if (!selectedId) {
      alert("Selecione um agente para excluir.");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este agente?")) {
      const apiUrl = process.env.REACT_APP_API_URL;
      fetch(`${apiUrl}/agente/excluir_agente/${selectedId}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao excluir");
          return res.json();
        })
        .then(() => {
          fetchAgentes();
          setSelectedId(null);
        })
        .catch(() => alert("Erro ao excluir agente."));
    }
  };

  // Formata data para pt-BR
  const formatDateBR = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="lista-agentes">
      <style>{cssSidebar}</style>
      <style>{css}</style>

      {/* OVERLAY */}
      {open && <div className="overlay" />}

      {/* SIDEBAR */}
      <aside ref={sidebarRef} className={`sidebar ${open ? "open" : ""}`}>
        <nav>
          <ul>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpen(false);
                navigate("/home");
              }}
            >
              Início
            </li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpen(false);
                navigate("/agentes");
              }}
            >
              Agentes
            </li>
                        <li
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpen(false);
                navigate("/atendimentos");
              }}
            >
              Atendimentos
            </li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpen(false);
                navigate("/anexos");
              }}
            >
              Arquivos
            </li>
            <li>Histórico</li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpen(false);
                navigate("/configuracoes");
              }}
            >
              Configurações
            </li>
            <li className="exit">Sair</li>
          </ul>
        </nav>
      </aside>

      {/* HEADER */}
      <div className="header-row">
        <button
          className="icon-btn"
          aria-label="menu"
          onClick={() => setOpen(!open)}
        >
          <Menu size={18} />
        </button>
        <div className="spacer" />
        <button className="avatar" aria-label="perfil">
          <User size={16} />
        </button>
      </div>

      <main className="main">
        <div className="card-container">
          <section className="card">
          <h2 className="title">Lista de agentes:</h2>

          {/* Barra de pesquisa */}
          <div className="search-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por agente:"
            />
            <button
              className="btn green"
              onClick={() => navigate("/add-agente")}
              type="button"
            >
              Adicionar
            </button>
            <button className="btn red" onClick={handleExcluir} type="button">
              Excluir
            </button>
          </div>

          {/* Tabela */}
          <div className="table">
              <div className="row head">
                <span></span>
                <span>Nome</span>
                <span>Modelo</span>
                <span>IA</span>
                <span>Data Criação</span>
                <span>Ações</span>
              </div>
            <div className="rows-wrapper">
            {loading ? (
              // Skeleton loading: mostra algumas linhas fictícias enquanto carrega
              [1, 2, 3].map((i) => (
                <div key={i} className="row bis_skin_checked">
                  <div className="skeleton-radio" />
                  <span className="skeleton-line" style={{ width: "70%" }} />
                  <span className="skeleton-line" style={{ width: "50%" }} />
                  <span className="skeleton-line" style={{ width: "45%" }} />
                  <span className="skeleton-line" style={{ width: "40%" }} />
                  <div style={{ width: 1 }} />
                </div>
              ))
            ) : filteredAgentes.length === 0 ? (
              <div className="row">
                <span />
                <span colSpan={4} style={{ gridColumn: "span 4", color: "#aaa" }}>
                  Nenhum agente encontrado{search ? ` para "${search}"` : "."}
                </span>
                <span />
              </div>
            ) : (
              filteredAgentes.map((agente) => (
                <div key={agente.id} className="row">
                  <input
                    type="radio"
                    name="agente"
                    checked={selectedId === agente.id}
                    onChange={() => setSelectedId(agente.id)}
                  />
                  <span>{agente.nome_agente}</span>
                  <span>{agente.modelo}</span>
                  <span>{agente.ia}</span>
                  <span>{formatDateBR(agente.data_criacao)}</span>
                  <div className="actions">
                    <button
                      className="btn blue small"
                      type="button"
                      onClick={() => {
                        const apiUrl = process.env.REACT_APP_API_URL;
                        const webhookUrl = `${apiUrl}${agente.url}`;
                        navigator.clipboard.writeText(webhookUrl)
                          .then(() => alert("URL Webhook copiada!"))
                          .catch(() => alert("Erro ao copiar URL Webhook."));
                      }}
                    >
                      URL
                    </button>
                    <button
                      className="btn blue small"
                      type="button"
                      onClick={() => navigate("/add-agente", { state: { agente } })}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ===== CSS extra para sidebar =====
const cssSidebar = `
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:40}
.sidebar{position:fixed;top:0;left:-240px;width:220px;height:100%;background:#2a2c2f;transition:all .3s ease;padding:20px 0;z-index:50;}
.sidebar.open{left:0;}
.sidebar nav ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;}
.sidebar nav li{padding:10px 20px;cursor:pointer;transition:background .2s;font-size:15px;}
.sidebar nav li:hover{background:#3a3c40;}
.sidebar nav li.exit{color:#b85151;font-weight:600;}
`;

// ===== CSS =====
const css = `
:root{
  --bg:#1f2022;
  --panel:#2c2d2f;
  --stroke:#d9d9d9;
  --blue:#0d6efd;
  --red:#dc3545;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
.lista-agentes{min-height:100vh;background:var(--bg);color:white;display:flex;flex-direction:column}
.header-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;padding:14px 22px}
.icon-btn{height:34px;width:34px;border-radius:8px;background:#2b2d30;border:1px solid #3a3c3f;color:#fff;display:grid;place-items:center}
.avatar{height:36px;width:36px;border-radius:50%;background:white;color:black;border:none;display:grid;place-items:center}
.spacer{width:100%}
.main{flex:1;display:flex;justify-content:center;align-items:flex-start;padding:20px}
.card-container{width:min(980px,calc(100% - 40px));overflow:auto}
.card{width:100%;background:var(--panel);border:1px solid var(--stroke);border-radius:8px;padding:12px;box-shadow:0 6px 18px rgba(0,0,0,0.45)}
.title{font-size:18px;margin-bottom:14px}
.search-row{display:flex;gap:10px;margin-bottom:14px}
.search-row input{flex:1;border:1px solid var(--stroke);border-radius:6px;padding:6px 8px;background:#1b1c1e;color:#fff;}
.btn{padding:6px 12px;border-radius:6px;font-size:13px;cursor:pointer;border:1px solid transparent}
.btn.blue{background:var(--blue);color:#fff;}
.btn.red{background:var(--red);color:#fff;}
.btn.small{padding:4px 10px;font-size:12px;margin-left:6px}
.table{display:flex;flex-direction:column;gap:8px}
.row{display:grid;grid-template-columns:40px 2fr 1fr 1fr 1fr 1fr;align-items:center;gap:12px;padding:10px 12px;border:1px solid #3a3c3f;border-radius:6px;background:#353638}
.row.head{position:sticky;top:0;background:linear-gradient(180deg,#3b3d40, #333538);z-index:10;color:#fff;font-weight:700}
.row span{display:block}
.row span:nth-child(2), .row span:nth-child(3), .row span:nth-child(4), .row span:nth-child(5){text-align:left}
.row input[type="radio"]{justify-self:center}
.actions{display:flex;justify-content:flex-end;gap:8px}
/* Estilo para a linha de loading */
/* Estilo para a linha de loading (skeleton) */
.bis_skin_checked {
  background: linear-gradient(90deg, rgba(59,93,129,0.06), rgba(59,93,129,0.02));
  border: 1px dashed rgba(15,111,255,0.12);
  color: #c9f7ff;
  box-shadow: inset 0 0 30px rgba(10,80,140,0.02);
}
.skeleton-line{display:inline-block;height:12px;border-radius:6px;background:linear-gradient(90deg,#303437 0%, #50555a 50%, #303437 100%);animation:skeleton-loading 1.2s linear infinite}
.skeleton-radio{width:16px;height:16px;border-radius:50%;background:#2f3336;border:1px solid #444;margin-right:6px}
@keyframes skeleton-loading{0%{background-position:0% 50%}100%{background-position:100% 50%}}
.anexo-spinner{display:inline-block;width:22px;height:22px;border:3px solid #00eaff;border-top:3px solid #232323;border-radius:50%;animation:anexo-spin 0.8s linear infinite;margin-right:8px;vertical-align:middle}
@keyframes anexo-spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
/* Wrapper para as linhas dentro do card - evita quebrar o container principal quando houver muitos agentes */
.rows-wrapper{max-height:260px;overflow:auto;display:flex;flex-direction:column;gap:8px;padding:6px 0}
.rows-wrapper::-webkit-scrollbar{width:10px}
.rows-wrapper::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#3a3c40,#2f3336);border-radius:8px;border:2px solid rgba(0,0,0,0.2)}
`;

// =========================
// Página: Lista de Agentes
// =========================
export function AgentsListPage() {
  const data = [
    { id: 1, nome: "Nome do agente", modelo: "Modelo", ia: "IA", data: "Data Criação" },
    { id: 2, nome: "Nome do agente", modelo: "Modelo", ia: "IA", data: "Data Criação" },
    { id: 3, nome: "Nome do agente", modelo: "Modelo", ia: "IA", data: "Data Criação" },
    { id: 4, nome: "Nome do agente", modelo: "Modelo", ia: "IA", data: "Data Criação" },
    { id: 5, nome: "Nome do agente", modelo: "Modelo", ia: "IA", data: "Data Criação" },
  ];

  return (
    <div className="agents-page">
      <div className="agents-card">
        <div className="agents-title">Lista de agentes:</div>

        {/* Barra de pesquisa */}
        <div className="agents-search">
          <label className="label">Pesquisar por agente:</label>
          <div className="search-row">
            <input className="search-input" />
            <div className="spacer" />
            <button className="btn btn-danger">Excluir</button>
          </div>
        </div>

        {/* Cabeçalho (usando a primeira linha como títulos, sem fundo especial no mock) */}
        <div className="agents-list">
          <div className="row head">
            <div className="col col-radio" />
            <div className="col col-name">Nome do agente</div>
            <div className="col col-model">Modelo</div>
            <div className="col col-ia">IA</div>
            <div className="col col-date">Data Criação</div>
            <div className="col col-actions" />
          </div>

          {data.map((item) => (
            <div key={item.id} className="row">
              <div className="col col-radio">
                <input type="radio" name="agent" />
              </div>
              <div className="col col-name">{item.nome}</div>
              <div className="col col-model">{item.modelo}</div>
              <div className="col col-ia">{item.ia}</div>
              <div className="col col-date">{item.data}</div>
              <div className="col col-actions">
                <button className="pill pill-primary">Copiar url</button>
                <button className="pill pill-secondary">Editar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{agentsCss}</style>
    </div>
  );
}

const agentsCss = `
.agents-page{min-height:100vh;background:var(--bg);color:#fff;padding:24px;}
.agents-card{width:min(1000px,calc(100% - 48px));margin:0 auto;border:1px solid #bfbfbf;border-radius:8px;padding:18px;background:#2a2c2f;}
.agents-title{font-weight:700;margin-bottom:10px}

.agents-search{background:#3b3d40;border-radius:6px;padding:10px;border:1px solid #6f7175}
.agents-search .label{display:block;font-size:12px;margin-bottom:6px;color:#e6e6e6}
.search-row{display:grid;grid-template-columns:1fr auto 1fr auto;gap:8px;align-items:center}
.search-input{height:30px;border:1px solid #bfbfbf;background:#2b2d30;color:#fff;border-radius:6px;padding:0 10px}
.btn{height:30px;padding:0 12px;border-radius:6px;border:1px solid transparent;font-size:12px;font-weight:600}
.btn-primary{background:#0f57b3;border-color:#0a5bc7;color:#fff}
.btn-danger{background:#c13f4a;border-color:#d34a55;color:#fff}

.agents-list{margin-top:12px}
.row{display:grid;grid-template-columns:34px 1.6fr 1fr 0.6fr 1fr 1fr;gap:8px;align-items:center;background:#333538;border:1px solid #6f7175;border-radius:6px;padding:10px;margin:8px 0}
.row.head{background:#33353880}
.col{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.col-actions{display:flex;justify-content:flex-end;gap:8px}
.pill{height:28px;padding:0 10px;border-radius:6px;border:1px solid #b3d1ff;background:#1a6dd8;color:#fff;font-size:12px}
.pill-secondary{background:#3b91ff}
.pill-primary{background:#1a6dd8}
.col-radio input{accent-color:#e6e6e6}
`;

