
import React, { useEffect, useState, useRef, useContext } from "react";
import { Menu, User } from "lucide-react";
// import duplicado removido
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import "../css/atendimentos.css";
import { AuthContext } from "../auth/AuthProvider";

export default function AtendimentosPage() {
  const [open, setOpen] = useState(false);
  const [atendimentos, setAtendimentos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [agenteInfo, setAgenteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

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

  // Formata datas para pt-BR. Se houver hora diferente de 00:00, inclui hora e minuto.
  const formatDateBR = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return value;
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
    if (hasTime) {
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Component: detecta se URL é imagem ou documento e exibe preview adequado
  function PreviewImageLink({ url, name, className }) {
    const [status, setStatus] = useState('unknown'); // 'unknown' | 'image' | 'doc' | 'link'

    useEffect(() => {
      if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
        setStatus('link');
        return;
      }

      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
      const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar', 'odt'];

      // extrai extensão (antes de query)
      const clean = url.split('?')[0].split('#')[0];
      const parts = clean.split('.');
      const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';

      if (imageExts.includes(ext)) {
        setStatus('image');
        return;
      }
      if (docExts.includes(ext)) {
        setStatus('doc');
        return;
      }

      // tentativa de carregar como imagem (para URLs sem extensão)
      let mounted = true;
      const img = new Image();
      const handleLoad = () => { if (mounted) setStatus('image'); };
      const handleError = () => { if (mounted) setStatus('link'); };
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      // iniciar carregamento
      img.src = url;
      // se após X ms ainda estiver desconhecido, assumir que não é imagem
      const timer = setTimeout(() => {
        if (mounted) {
          // usar função updater para evitar sobrescrever um status já definido
          setStatus(prev => (prev === 'unknown' ? 'link' : prev));
        }
      }, 2500);
      return () => {
        mounted = false;
        clearTimeout(timer);
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        // liberar referência para evitar possíveis leaks
        try { img.src = ''; } catch (e) {}
      };
    }, [url]);

    if (status === 'unknown') {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
          <span className="anexo-spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
          <span style={{ marginLeft: 8 }}>{name || url}</span>
        </a>
      );
    }

    if (status === 'image') {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
          <img src={url} alt={name || 'imagem'} className={`msg-img-thumb msg-img-attachment`} />
        </a>
      );
    }

    // status === 'doc' || status === 'link'
    // mostrar ícone de documento para arquivos, ou link puro
    const displayName = name || url.split('/').pop() || url;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`${className} attachment-with-icon`}>
        <span className="attachment-icon" aria-hidden>
          {/* simple document SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4C4 2.89543 4.89543 2 6 2Z" stroke="#bfbfbf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#bfbfbf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H16" stroke="#bfbfbf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 16H12" stroke="#bfbfbf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="attachment-name">{displayName}</span>
      </a>
    );
  }

  return (
  <div className="atendimentos-chat">
      {open && <div className="overlay" />}
      <aside ref={sidebarRef} className={`sidebar ${open ? "open" : ""}`}>
        <nav>
          <ul>
            <li onClick={() => { setOpen(false); navigate("/home"); }}>Início</li>
            <li onClick={() => { setOpen(false); navigate("/agentes"); }}>Agentes</li>
            <li style={{ fontWeight: 600 }}>Atendimentos</li>
            <li onClick={() => { setOpen(false); navigate("/anexos"); }}>Arquivos</li>
            <li>Histórico</li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => { setOpen(false); navigate("/configuracoes"); }}
            >
              Configurações
            </li>
            <li className="exit" style={{ cursor: "pointer" }} onClick={async () => { setOpen(false); try { await logout(); navigate('/'); } catch (e){} }}>Sair</li>
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
                      <span>Início: {formatDateBR(selected.inicio)}</span>
                      {selected.fim && <span>Fim: {formatDateBR(selected.fim)}</span>}
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
                              ) : (/^https?:\/\//i.test(texto.trim()) ? (
                                <PreviewImageLink url={texto.trim()} name={msg.titulo || null} />
                              ) : (
                                <ReactMarkdown>{texto}</ReactMarkdown>
                              ))}
                              {/* Anexos enviados junto com a mensagem (pode ser array de strings ou objetos) */}
                              {Array.isArray(msg.anexos) && msg.anexos.length > 0 && (
                                <div className="msg-attachments">
                                  {msg.anexos.map((att, i) => {
                                    // att pode ser string (url) ou objeto { url, tipo, nome }
                                    let url = null;
                                    let tipo = null;
                                    let nome = null;
                                    if (typeof att === 'string') {
                                      url = att;
                                    } else if (att && typeof att === 'object') {
                                      url = att.url || att.link || att.conteudo || null;
                                      tipo = att.tipo || att.type || null;
                                      nome = att.nome || att.filename || att.nome_arquivo || null;
                                    }
                                    const isAttImage = typeof url === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp)$/i.test(url.trim());
                                    if (!url) return null;
                                    // Use PreviewImageLink para detectar imagem e mostrar preview
                                    return (
                                      <PreviewImageLink key={i} url={url} name={nome || null} className={isAttImage ? 'attachment-link' : 'attachment-file'} />
                                    );
                                  })}
                                </div>
                              )}
                              <span className="msg-time">{formatDateBR(msg.horario || msg.data)}</span>
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

// CSS moved to src/css/atendimentos.css
