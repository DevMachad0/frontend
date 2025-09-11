import React, { useState, useRef, useEffect, useMemo, useContext } from "react";
import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { useNotifications } from "../components/notifications/NotificationProvider";
import { useConfirm } from "../components/confirm/ConfirmProvider";

// =========================
// Página: Lista de Documentos
// =========================
function ListaAnexoPage() {
  const [docs, setDocs] = useState([]);
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [tipo, setTipo] = useState("imagem");
  const [nome, setNome] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedShortCode, setSelectedShortCode] = useState(null);
  const [search, setSearch] = useState("");
  const [fileSize, setFileSize] = useState("");
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { success, error: notifyError, info } = useNotifications();
  const confirm = useConfirm();

  const EXTENSOES_IMAGEM = ["jpg", "jpeg", "png", "gif", "bmp"];
  const EXTENSOES_DOCUMENTO = ["pdf", "doc", "docx", "xls", "xlsx", "txt"];

  useEffect(() => {
    async function fetchAnexos() {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      try {
        const res = await fetch(`${apiUrl}/anexos/listar`);
        const data = await res.json();
        if (Array.isArray(data.anexos)) {
          setDocs(data.anexos);
        } else {
          setDocs([]);
        }
      } catch {
        setDocs([]);
      }
      setTimeout(() => setLoading(false), 400);
    }
    fetchAnexos();
  }, []);

  // Filtra documentos por nome, tipo, tamanho ou short_code (busca automática)
  const filteredDocs = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => {
      const nome = (d.nome || d.nome_documento || "").toLowerCase();
      const tipoDoc = (d.tipo || d.tipo_documento || "").toLowerCase();
      const tamanho = (d.tamanho || d.tamanho_documento || "").toLowerCase();
      const short = (d.short_code || "").toLowerCase();
      return (
        nome.includes(q) ||
        tipoDoc.includes(q) ||
        tamanho.includes(q) ||
        short.includes(q)
      );
    });
  }, [docs, search]);

  // limpa seleção se o documento selecionado não estiver no conjunto filtrado
  useEffect(() => {
    if (!selectedShortCode) return;
    const found = filteredDocs.some((d) => d.short_code === selectedShortCode);
    if (!found) setSelectedShortCode(null);
  }, [filteredDocs, selectedShortCode]);

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

  async function handleAdicionar() {
    setShowPopup(true);
    setTipo("imagem");
    setNome("");
    setConteudo("");
    setFileSize("");
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (
      (tipo === "imagem" && !EXTENSOES_IMAGEM.includes(ext)) ||
      (tipo === "documento" && !EXTENSOES_DOCUMENTO.includes(ext))
    ) {
      notifyError("Extensão não permitida!");
      return;
    }
    setNome(file.name);
    const mb = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    setFileSize(mb);
    const reader = new FileReader();
    reader.onload = function(ev) {
      const base64 = ev.target.result.split(',')[1];
      setConteudo(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSalvar() {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    let tamanho = "";
    if (tipo === "imagem" || tipo === "documento") {
      tamanho = fileSize;
    } else if (tipo === "link") {
      tamanho = "";
    }
    try {
      const res = await fetch(`${apiUrl}/anexos/cadastrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, nome, conteudo, tamanho }),
      });
      const data = await res.json();
      if (res.ok) {
        success("Anexo cadastrado com sucesso! Short_code: " + data.short_code);
        setShowPopup(false);
        setNome("");
        setConteudo("");
        setTipo("imagem");
        setFileSize("");
        // Atualiza lista
        const resList = await fetch(`${apiUrl}/anexos/listar`);
        const dataList = await resList.json();
        setDocs(Array.isArray(dataList.anexos) ? dataList.anexos : []);
      } else {
        notifyError(data.error || "Erro ao cadastrar anexo.");
      }
    } catch {
      notifyError("Erro ao cadastrar anexo.");
    }
    setLoading(false);
  }

  async function handleExcluir() {
    if (!selectedShortCode) {
      info("Selecione um documento para excluir.");
      return;
    }
    const ok = await confirm({ message: "Tem certeza que deseja excluir este anexo?" });
    if (!ok) return;
    const apiUrl = process.env.REACT_APP_API_URL;
    try {
      const res = await fetch(`${apiUrl}/anexos/excluir/${selectedShortCode}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        success("Anexo excluído com sucesso!");
        // Atualiza lista
        const resList = await fetch(`${apiUrl}/anexos/listar`);
        const dataList = await resList.json();
        setDocs(Array.isArray(dataList.anexos) ? dataList.anexos : []);
        setSelectedShortCode(null);
      } else {
        notifyError(data.error || "Erro ao excluir anexo.");
      }
    } catch {
      notifyError("Erro ao excluir anexo.");
    }
  }

  // Função para baixar documento
  async function handleBaixar(short_code) {
    const apiUrl = process.env.REACT_APP_API_URL;
    try {
      const res = await fetch(`${apiUrl}/anexos/download/${short_code}`);
      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || "Erro ao baixar documento.");
        return;
      }
      if (data.tipo === "link") {
        window.open(data.conteudo, "_blank");
        return;
      }
      // Converte base64 para blob
      const base64 = data.conteudo;
      const nome = data.nome || "arquivo";
      const tipo = data.tipo || "";
      let mime = "application/octet-stream";
      if (tipo === "imagem") mime = "image/*";
      if (tipo === "documento") mime = "application/*";
      if (tipo === "link") mime = "text/plain";
      const blob = b64toBlob(base64, mime);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      notifyError("Erro ao baixar documento.");
    }
  }

  function handleCopyShortCode(short_code) {
    navigator.clipboard.writeText(short_code)
      .then(() => success("Short_code copiado!"))
      .catch(() => notifyError("Erro ao copiar Short_code."));
  }

  // Novo: visualizar online (abre em nova aba se for arquivo)
  function handleVisualizar(short_code, tipo) {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (tipo === "imagem" || tipo === "documento") {
      window.open(`${apiUrl}/anexos/file/${short_code}`, "_blank");
    } else if (tipo === "link") {
      // Para link, já abre direto no handleBaixar
      handleBaixar(short_code);
    }
  }

  function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  return (
    <div className="simplicio-v2">
      <style>{docsCss}</style>
      {open && <div className="overlay" />}
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
            <li className="exit" style={{ cursor: "pointer" }} onClick={async () => { setOpen(false); try { await logout(); navigate('/'); } catch (e){} }}>Sair</li>
          </ul>
        </nav>
      </aside>
      <div className="header-row">
        <button
          className="icon-btn"
          aria-label="menu"
          onClick={() => setOpen(!open)}
        >
          <Menu size={18} />
        </button>
        <h1 className="brand"></h1>
        <div className="spacer" />
        <button className="avatar" aria-label="perfil">
          <User size={16} />
        </button>
      </div>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="docs-card">
            <div className="docs-title">Lista de documentos</div>
            {/* Barra de pesquisa */}
            <div className="docs-search">
              <label className="label">Pesquisar por Documento</label>
              <div className="search-row">
                <input
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Digite nome, tipo, tamanho ou short_code"
                />
                <button className="btn btn-light btn-sm" onClick={handleAdicionar}>
                  Adicionar
                </button>
                <button className="btn btn-danger" onClick={handleExcluir}>
                  Excluir
                </button>
              </div>
            </div>
            {/* Lista de documentos */}
            <div className="docs-list">
              <div className="row head">
                <div className="col col-radio" />
                <div className="col col-name">Nome do Documento</div>
                <div className="col col-type">Tipo</div>
                <div className="col col-size">Tamanho</div>
                <div className="col col-actions">Ações</div>
              </div>
              <div className="rows-wrapper">
              {loading ? (
                <div className="row bis_skin_checked">
                  <span />
                  <span colSpan={4} style={{ gridColumn: "span 4", color: "#00eaff", textAlign: "center" }}>
                    <span className="anexo-spinner"></span> Carregando anexos...
                  </span>
                  <span />
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="row">
                  <div className="col" />
                  <div className="col" style={{ color: "#aaa" }}>
                    Nenhum documento encontrado{search ? ` para "${search}"` : "."}
                  </div>
                  <div className="col" />
                  <div className="col" />
                  <div className="col" />
                </div>
              ) : (
                filteredDocs.map((doc, idx) => (
                  <div key={idx} className="row">
                    <div className="col col-radio">
                      <input
                        type="radio"
                        name="doc"
                        checked={selectedShortCode === doc.short_code}
                        onChange={() => setSelectedShortCode(doc.short_code)}
                      />
                    </div>
                    <div className="col col-name">
                      {doc.nome || doc.nome_documento || ""}
                    </div>
                    <div className="col col-type">
                      {doc.tipo || doc.tipo_documento || ""}
                    </div>
                    <div className="col col-size">
                      {doc.tamanho || doc.tamanho_documento || ""}
                    </div>
                    <div className="col col-actions">
                      <button
                        className="pill pill-primary"
                        onClick={() => handleCopyShortCode(doc.short_code)}
                      >
                        Copiar Short_code
                      </button>
                      <button
                        className="pill pill-secondary"
                        onClick={() => handleBaixar(doc.short_code)}
                      >
                        Baixar
                      </button>
                      <button
                        className="pill pill-secondary"
                        style={{ background: "#00eaff", color: "#222" }}
                        onClick={() => handleVisualizar(doc.short_code, doc.tipo)}
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>
                ))
              )} 
              </div>
            </div>
          </div>
        </div>
        {/* POPUP ADICIONAR */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-card">
              <h3>Adicionar Documento</h3>
              <label className="label">Tipo</label>
              <select
                className="input"
                value={tipo}
                onChange={e => {
                  setTipo(e.target.value);
                  setNome("");
                  setConteudo("");
                  setFileSize("");
                }}
              >
                <option value="imagem">Imagem</option>
                <option value="documento">Documento</option>
                <option value="link">Link</option>
              </select>
              <label className="label" style={{ marginTop: 10 }}>
                Nome
              </label>
              <input
                className="input"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder={
                  tipo === "link"
                    ? "Nome do link"
                    : "Nome do arquivo (ex: arquivo.pdf)"
                }
                disabled={tipo !== "link"}
              />
              <label className="label" style={{ marginTop: 10 }}>
                {tipo === "link" ? "URL" : "Arquivo"}
              </label>
              {tipo === "link" ? (
                <input
                  className="input"
                  value={conteudo}
                  onChange={e => setConteudo(e.target.value)}
                  placeholder="https://..."
                />
              ) : (
                <input
                  type="file"
                  className="input"
                  accept={
                    tipo === "imagem"
                      ? EXTENSOES_IMAGEM.map(e => "." + e).join(",")
                      : EXTENSOES_DOCUMENTO.map(e => "." + e).join(",")
                  }
                  onChange={handleFileChange}
                />
              )}
              {/* Mostra tamanho se for imagem/documento */}
              {(tipo === "imagem" || tipo === "documento") && fileSize && (
                <div style={{ fontSize: 13, color: "#ccc", marginTop: 4 }}>
                  Tamanho: {fileSize}
                </div>
              )}
              <div className="popup-actions">
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => setShowPopup(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSalvar}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ListaAnexoPage;
export { ListaAnexoPage };

const docsCss = `
:root{
  --bg:#1f2022;
  --panel:#424447;
  --stroke:#d9d9d9;
  --sidebar:#2a2c2f;
  --sidebar-hover:#3a3c40;
  --exit:#b85151;
  --overlay:rgba(0,0,0,0.55);
}
*{box-sizing:border-box}
html,body,#root{height:100%}
.simplicio-v2{min-height:100vh;background:var(--bg);color:white;display:flex;flex-direction:column;position:relative;overflow-x:hidden}
.overlay{position:fixed;inset:0;background:var(--overlay);z-index:40}
/* SIDEBAR */
.sidebar{position:fixed;top:0;left:-260px;width:240px;height:100%;background:linear-gradient(180deg, #0c0d0f, #0f1113);transition:all .35s cubic-bezier(.2,.9,.2,1);padding:28px 12px;z-index:50;box-shadow:0 8px 30px rgba(2,6,23,0.6);backdrop-filter: blur(6px)}
.sidebar.open{left:0;}
.sidebar nav ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.sidebar nav li{padding:12px 18px;cursor:pointer;border-radius:8px;transition:background .18s, transform .18s;font-size:15px}
.sidebar nav li:hover{background:var(--sidebar-hover);transform:translateX(6px)}
.sidebar nav li.exit{color:var(--exit);font-weight:700}
.header-row{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:10px;padding:14px 22px;z-index:30;position:relative}
.icon-btn{height:34px;width:34px;border-radius:8px;background:#2b2d30;border:1px solid #3a3c3f;color:#fff;display:grid;place-items:center}
.brand{font-size:18px;font-weight:700;margin:0}
.avatar{height:36px;width:36px;border-radius:50%;background:white;color:black;border:none;display:grid;place-items:center}
.spacer{width:100%}
.flex-1{flex:1}
.mx-auto{margin-left:auto;margin-right:auto}
.max-w-6xl{max-width:1000px}
.px-4{padding-left:16px;padding-right:16px}
.py-6{padding-top:24px;padding-bottom:24px}
.docs-card{width:min(1000px,calc(100% - 48px));margin:0 auto;border:1px solid #bfbfbf;border-radius:8px;padding:18px;background:#2a2c2f}
.docs-title{font-weight:700;margin-bottom:10px}
.docs-search{background:#3b3d40;border-radius:6px;padding:10px;border:1px solid #6f7175}
.label{display:block;font-size:12px;margin-bottom:6px;color:#e6e6e6}
.search-row{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center}
.search-input{height:30px;border:1px solid #bfbfbf;background:#2b2d30;color:#fff;border-radius:6px;padding:0 10px}
.btn{height:30px;padding:0 12px;border-radius:6px;border:1px solid transparent;font-size:12px;font-weight:600;cursor:pointer}
.btn-sm{padding:0 8px;font-size:12px;border-radius:6px}
.btn-primary{background:#0f57b3;border-color:#0a5bc7;color:#fff}
.btn-danger{background:#c13f4a;border-color:#d34a55;color:#fff}
.btn-light{background:#d9d9d9;color:#000;font-weight:600}
.docs-list{margin-top:12px}
.row{display:grid;grid-template-columns:34px 2fr 1fr 1fr 1.6fr;gap:8px;align-items:center;background:#333538;border:1px solid #6f7175;border-radius:6px;padding:10px;margin:8px 0}
.row.head{background:#2b2d30;font-weight:700}
.col{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.col-actions{display:flex;justify-content:flex-end;gap:8px;flex-direction: column;}
.pill{height:28px;padding:0 10px;border-radius:6px;border:1px solid #b3d1ff;background:#1a6dd8;color:#fff;font-size:12px;cursor:pointer}
.pill-secondary{background:#3b91ff}
.pill-primary{background:#1a6dd8}
.col-radio input{accent-color:#e6e6e6}
.popup-overlay{
  position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:center;justify-content:center;
}
.popup-card{
  background:#232323;padding:28px 24px;border-radius:12px;min-width:320px;max-width:90vw;box-shadow:0 2px 32px #0008;display:flex;flex-direction:column;gap:6px;
}
.popup-card h3{margin-top:0;margin-bottom:12px;font-size:18px;font-weight:700;}
.popup-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;}
.bis_skin_checked {
  background: #2b2d30;
  border-color: #007bff;
  color: #00eaff;
  font-weight: 500;
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
/* Wrapper para as linhas dentro do docs-card - evita quebrar o container principal quando houver muitos documentos */
.rows-wrapper{max-height:260px;overflow:auto;display:flex;flex-direction:column;gap:8px;padding:6px 0}
.rows-wrapper::-webkit-scrollbar{width:10px}
.rows-wrapper::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#3a3c40,#2f3336);border-radius:8px;border:2px solid rgba(0,0,0,0.2)}
`;

