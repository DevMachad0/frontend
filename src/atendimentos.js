
import React, { useEffect, useState, useRef } from "react";
import { Menu, User } from "lucide-react";
// import duplicado removido
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

export default function AtendimentosPage() {
  const [open, setOpen] = useState(false);
  const [atendimentos, setAtendimentos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [agenteInfo, setAgenteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    setLoading(true);
    fetch(`${apiUrl}/agente/listar_atendimentos`)
      .then((res) => res.json())
      .then((data) => {
        setAtendimentos(data.atendimentos || []);
        if (data.atendimentos && data.atendimentos.length > 0) {
          setSelected(data.atendimentos[0]);
        }
      })
      .finally(() => setTimeout(() => setLoading(false), 400));
  }, []);

  // Buscar informações do agente sempre que selected mudar
  useEffect(() => {
    if (selected && selected.agente_id) {
      const apiUrl = process.env.REACT_APP_API_URL;
      fetch(`${apiUrl}/agente/obter_agente/${selected.agente_id}`)
        .then((res) => res.json())
        .then((data) => {
          setAgenteInfo(data);
        })
        .catch(() => setAgenteInfo(null));
    } else {
      setAgenteInfo(null);
    }
  }, [selected]);

  // Estado para filtro de consulta
  const [filtro, setFiltro] = useState("");
  const [tipoConsulta, setTipoConsulta] = useState("cliente");

  return (
    <div className="atendimentos-chat">
      <style>{css}</style>
      {open && <div className="overlay" />}
      <aside ref={sidebarRef} className={`sidebar ${open ? "open" : ""}`}>
        <nav>
          <ul>
            <li onClick={() => { setOpen(false); navigate("/home"); }}>Início</li>
            <li onClick={() => { setOpen(false); navigate("/agentes"); }}>Agentes</li>
            <li style={{ fontWeight: 600 }}>Atendimentos</li>
            <li onClick={() => { setOpen(false); navigate("/anexos"); }}>Arquivos</li>
            <li>Histórico</li>
            <li>Configurações</li>
            <li className="exit">Sair</li>
          </ul>
        </nav>
      </aside>
      <div className="header-row">
        <button className="icon-btn" aria-label="menu" onClick={() => setOpen(!open)}>
          <Menu size={18} />
        </button>
        <h1 className="brand">Atendimentos</h1>
        <div className="spacer" />
        <button className="avatar" aria-label="perfil">
          <User size={16} />
        </button>
      </div>
      {/* Menu de consulta acima do main-chat */}
      <div className="consulta-menu">
        <select value={tipoConsulta} onChange={e => setTipoConsulta(e.target.value)}>
          <option value="cliente">Cliente</option>
          <option value="protocolo">Protocolo</option>
        </select>
        <input
          type="text"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder={tipoConsulta === "cliente" ? "Buscar por cliente..." : "Buscar por protocolo..."}
          className="consulta-input"
        />
        <button className="btn-consulta" onClick={() => {
          // Aqui você pode implementar a consulta filtrada
          // Exemplo: filtrar atendimentos pelo nome_usuario ou protocolo
          if (tipoConsulta === "cliente") {
            const resultado = atendimentos.filter(a => a.nome_usuario && a.nome_usuario.toLowerCase().includes(filtro.toLowerCase()));
            if (resultado.length > 0) setSelected(resultado[0]);
          } else {
            const resultado = atendimentos.filter(a => a.protocolo && a.protocolo.toLowerCase().includes(filtro.toLowerCase()));
            if (resultado.length > 0) setSelected(resultado[0]);
          }
        }}>Consultar</button>
      </div>
      {/* Container bis_skin_checked com limite de altura */}
      <div className="bis_skin_checked">
        <main className="main-chat">
          {loading ? (
            <div className="row bis_skin_checked">
              <span />
              <span colSpan={4} style={{ gridColumn: "span 4", color: "#00eaff", textAlign: "center" }}>
                <span className="anexo-spinner"></span> Carregando atendimentos...
              </span>
              <span />
            </div>
          ) : (
            <>
              <div className="chat-list">
                {atendimentos.length === 0 ? (
                  <div className="empty">Nenhum atendimento encontrado.</div>
                ) : (
                  atendimentos.map((a) => (
                    <button
                      key={a.protocolo}
                      className={`chat-list-item${selected && selected.protocolo === a.protocolo ? " selected" : ""}`}
                      onClick={() => setSelected(a)}
                    >
                      <div className="chat-list-protocolo">{a.protocolo}</div>
                      <div className="chat-list-nome">{a.nome_usuario}</div>
                    </button>
                  ))
                )}
              </div>
              <div className="chat-panel">
                {!selected ? (
                  <div className="empty">Selecione um atendimento</div>
                ) : (
                  <>
                    <div className="chat-panel-header">
                      <div>
                        <span className="chat-panel-nome">{selected.nome_usuario}</span>
                        <span className="chat-panel-protocolo">{selected.protocolo}</span>
                      </div>
                      <span className={`chat-panel-status status-${selected.status}`}>{selected.status}</span>
                    </div>
                    <div className="chat-panel-info">
                      <span>Email: {selected.email}</span>
                      <span>Contato: {selected.contato}</span>
                      <span>Agente: {agenteInfo ? agenteInfo.nome_agente : selected.agente_id}</span>
                      {agenteInfo && agenteInfo.dominios_permitidos && (
                        <span>Domínios permitidos: {Array.isArray(agenteInfo.dominios_permitidos) ? agenteInfo.dominios_permitidos.join(", ") : agenteInfo.dominios_permitidos}</span>
                      )}
                      <span>Início: {selected.inicio}</span>
                      {selected.fim && <span>Fim: {selected.fim}</span>}
                    </div>
                    <div className="chat-messages">
                      {Array.isArray(selected.mensagens) && selected.mensagens.length > 0 ? (
                        selected.mensagens.map((msg, idx) => {
                          const texto = msg.texto || msg.mensagem || "";
                          const isImage = /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp)$/i.test(texto.trim());
                          return (
                            <div className={`msg-bubble ${msg.remetente === selected.nome_usuario ? "user" : "agente"}`} key={idx}>
                              {isImage ? (
                                <a href={texto.trim()} target="_blank" rel="noopener noreferrer">
                                  <img src={texto.trim()} alt="imagem" className="msg-img-thumb" />
                                </a>
                              ) : (
                                <ReactMarkdown>{texto}</ReactMarkdown>
                              )}
                              <span className="msg-time">{msg.horario || msg.data || ""}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="msg-bubble empty">Sem mensagens</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const css = `
:root{
  --bg:#1f2022;
  --panel:#424447;
  --stroke:#d9d9d9;
  --sidebar:#2a2c2f;
  --sidebar-hover:#3a3c40;
  --exit:#b85151;
  --overlay:rgba(0,0,0,0.55);
  --chat-list-bg:#232325;
  --chat-list-border:#595b5f;
  --chat-panel-bg:#222325;
  --chat-user:#3b3d40;
  --chat-agente:#2a2c2f;
}
*{box-sizing:border-box}
html,body,#root{height:100%}
.atendimentos-chat{min-height:100vh;background:var(--bg);color:white;display:flex;flex-direction:column;position:relative;overflow-x:hidden}
.overlay{position:fixed;inset:0;background:var(--overlay);z-index:40}
.sidebar{position:fixed;top:0;left:-240px;width:220px;height:100%;background:var(--sidebar);transition:all .3s ease;padding:20px 0;z-index:50;}
.sidebar.open{left:0;}
.sidebar nav ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;}
.sidebar nav li{padding:10px 20px;cursor:pointer;transition:background .2s;font-size:15px;}
.sidebar nav li:hover{background:var(--sidebar-hover);}
.sidebar nav li.exit{color:var(--exit);font-weight:600;}
.header-row{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:10px;padding:14px 22px;z-index:30;position:relative}
.icon-btn{height:34px;width:34px;border-radius:8px;background:#2b2d30;border:1px solid #3a3c3f;color:#fff;display:grid;place-items:center}
.brand{font-size:18px;font-weight:700;margin:0}
.avatar{height:36px;width:36px;border-radius:50%;background:white;color:black;border:none;display:grid;place-items:center}
.spacer{width:100%}
.main-chat{display:flex;flex:1;min-height:0;}
.bis_skin_checked {
  overflow-y: auto;
  background: #232325;
  border-radius: 12px;
  margin: 18px;
  box-shadow: 0 2px 12px #0002;
}
.anexo-spinner {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 3px solid #00eaff;
  border-top: 3px solid #232323;
  border-radius: 50%;
  animation: anexo-spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}
@keyframes anexo-spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
.consulta-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px 0 24px;
}
.consulta-input {
  flex: 1;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #595b5f;
  background: #1b1c1e;
  color: #fff;
}
.btn-consulta {
  padding: 6px 16px;
  border-radius: 6px;
  background: #1762c4;
  color: #fff;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.chat-list{width:270px;background:var(--chat-list-bg);border-right:2px solid var(--chat-list-border);padding:18px 0;display:flex;flex-direction:column;gap:12px;overflow-y:auto;min-height:0;max-height: 400px;}
.chat-list-item{background:transparent;border:1px solid var(--chat-list-border);border-radius:8px;padding:10px 14px;display:flex;flex-direction:column;align-items:flex-start;cursor:pointer;transition:background .2s, border .2s;outline:none;color:#fff;font-size:15px; margin-left: 8px; margin-right: 8px;}
.chat-list-item.selected, .chat-list-item:focus{background:#353638;border-color:#00eaff;}
.chat-list-protocolo{font-weight:700;font-size:14px;}
.chat-list-nome{font-size:13px;color:#eaeaea;}
.chat-panel{flex:1;background:var(--chat-panel-bg);padding:0 0 0 0;display:flex;flex-direction:column;min-height:0;}
.chat-panel-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px 8px 24px;border-bottom:1px solid var(--chat-list-border);}
.chat-panel-nome{font-weight:600;font-size:17px;margin-right:18px;}
.chat-panel-protocolo{font-size:13px;color:#bfbfbf;}
.chat-panel-status{font-size:13px;padding:2px 10px;border-radius:6px;background:#3b3d40;color:#fff;}
.chat-panel-info{display:flex;flex-wrap:wrap;gap:18px;font-size:13px;padding:8px 24px 0 24px;color:#bfbfbf;}
.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 24px;
  overflow-y: auto;
  min-height: 0;
  background: rgba(60,62,65,0.12);
  border-radius: 12px;
  margin: 12px 18px;
  box-shadow: 0 2px 12px #0002;
  max-height: 300px; /* Limite de altura do chat */
}
.msg-bubble{max-width:70%;padding:10px 16px;border-radius:14px;font-size:15px;position:relative;margin-bottom:2px;word-break:break-word;}
.msg-bubble{max-width:70%;padding:12px 18px;border-radius:16px;font-size:15px;position:relative;margin-bottom:2px;word-break:break-word;box-shadow:0 1px 8px #0001;transition:background .2s;}
.msg-bubble.user{background:var(--chat-user);align-self:flex-end;}
.msg-bubble.user{background:linear-gradient(90deg,#3b3d40 80%,#1762c4 100%);align-self:flex-end;}
.msg-bubble.agente{background:linear-gradient(90deg,#2a2c2f 80%,#3b91ff 100%);align-self:flex-start;}
.msg-bubble.agente{background:var(--chat-agente);align-self:flex-start;}
.msg-text{display:block;}
.msg-text{display:block;white-space:pre-line;word-break:break-word;}
.msg-img-thumb{max-width:180px;max-height:120px;border-radius:8px;box-shadow:0 2px 8px #0003;margin-bottom:4px;display:block;}
.msg-time{font-size:11px;color:#ccc;float:right;margin-left:8px;}
.msg-time{font-size:11px;color:#bfbfbf;float:right;margin-left:8px;}
.empty{color:#ccc;text-align:center;padding:24px;}
`
