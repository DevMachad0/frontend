import React, { useState, useEffect, useRef } from "react";
import { Menu, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const PERMISSOES = ["Texto", "Áudio", "Imagem", "Documentos"];
const PERMISSOES_SAIDA = ["Texto", "Link", "Imagem", "Documentos"];

// =========================
// Página: Formulário de Agente com visual igual ao home
// =========================
export default function AgentFormPage() {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const agenteEdit = location.state?.agente;

  // Estados do formulário
  const [nome_agente, setNomeAgente] = useState(agenteEdit?.nome_agente || "");
  const [instrucoes, setInstrucoes] = useState(agenteEdit?.instrucoes || "");
  const [modelo, setModelo] = useState(agenteEdit?.modelo || "");
  const [ia, setIa] = useState(agenteEdit?.ia || "ChatGPT");
  const [chave_api, setChaveApi] = useState(agenteEdit?.chave_api || "");
  const [dominios_permitidos, setDominiosPermitidos] = useState(agenteEdit?.dominios_permitidos || "");
  // Permissões como array de nomes marcados
  const [permissoesEntradaMarcadas, setPermissoesEntradaMarcadas] = useState([]);
  const [permissoesSaidaMarcadas, setPermissoesSaidaMarcadas] = useState([]);
  const [anexos, setAnexos] = useState([]);

  // Atualiza os estados se mudar o agente (ex: navegação entre agentes)
  useEffect(() => {
    if (agenteEdit) {
      setNomeAgente(agenteEdit.nome_agente || "");
      setInstrucoes(agenteEdit.instrucoes || "");
      setModelo(agenteEdit.modelo || "");
      setIa(agenteEdit.ia || "ChatGPT");
      setChaveApi(agenteEdit.chave_api || "");
      setDominiosPermitidos(agenteEdit.dominios_permitidos || "");
      // Converter array de objetos para array de nomes marcados
      setPermissoesEntradaMarcadas(
        Array.isArray(agenteEdit.permissoes_entrada)
          ? agenteEdit.permissoes_entrada.filter(p => p.valor).map(p => p.nome)
          : []
      );
      setPermissoesSaidaMarcadas(
        Array.isArray(agenteEdit.permissoes_saida)
          ? agenteEdit.permissoes_saida.filter(p => p.valor).map(p => p.nome)
          : []
      );
    }
  }, [agenteEdit]);

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

  // Buscar anexos para exibir short_codes
  useEffect(() => {
    async function fetchAnexos() {
      const apiUrl = process.env.REACT_APP_API_URL;
      try {
        const res = await fetch(`${apiUrl}/anexo/listar`);
        const data = await res.json();
        if (Array.isArray(data.anexos)) {
          setAnexos(data.anexos);
        } else {
          setAnexos([]);
        }
      } catch {
        setAnexos([]);
      }
    }
    fetchAnexos();
  }, [agenteEdit]);

  // Função para lidar com checkboxes de permissões
  const handlePermissaoEntrada = (permissao) => {
    setPermissoesEntradaMarcadas((prev) =>
      prev.includes(permissao)
        ? prev.filter((p) => p !== permissao)
        : [...prev, permissao]
    );
  };
  const handlePermissaoSaida = (permissao) => {
    setPermissoesSaidaMarcadas((prev) =>
      prev.includes(permissao)
        ? prev.filter((p) => p !== permissao)
        : [...prev, permissao]
    );
  };

  // Função para gerar slug da URL
  function slugify(text) {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  // Função para submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = process.env.REACT_APP_API_URL;
    // Monta array de objetos { nome, valor: "true" ou "" }
    const permissoes_entrada = PERMISSOES.map(nome => ({
      nome,
      valor: permissoesEntradaMarcadas.includes(nome) ? "true" : ""
    }));
    const permissoes_saida = PERMISSOES_SAIDA.map(nome => ({
      nome,
      valor: permissoesSaidaMarcadas.includes(nome) ? "true" : ""
    }));

    const body = {
      nome_agente,
      instrucoes,
      modelo,
      ia,
      chave_api,
      dominios_permitidos,
      permissoes_entrada,
      permissoes_saida,
      url: "", // O backend vai gerar a URL
    };

    try {
      let res;
      if (agenteEdit && agenteEdit.id) {
        // Edição
        res = await fetch(`${apiUrl}/agente/editar_agente/${agenteEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // Novo
        res = await fetch(`${apiUrl}/agente/criar_agente`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error("Erro ao salvar agente");
      await res.json();
      alert(agenteEdit ? "Agente atualizado com sucesso!" : "Agente cadastrado com sucesso!");
      navigate("/agentes");
    } catch {
      alert("Erro ao salvar agente.");
    }
  };

  // Função para inserir short_code no texto de instruções
  function inserirShortCode(short_code) {
    const marcador = `<{${short_code}}>`;
    // Insere no cursor ou ao final
    const textarea = document.getElementById("instrucoes-textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const textoAtual = instrucoes;
      const novoTexto =
        textoAtual.substring(0, start) +
        marcador +
        textoAtual.substring(end);
      setInstrucoes(novoTexto);
      // Reposiciona o cursor após o marcador
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + marcador.length;
      }, 0);
    } else {
      setInstrucoes(instrucoes + marcador);
    }
  }

  return (
    <div className="simplicio-v2">
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
            <li>Atendimentos</li>
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
            <li>Configurações</li>
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
        <h1 className="brand"></h1>
        <div className="spacer" />
        <button className="avatar" aria-label="perfil">
          <User size={16} />
        </button>
      </div>

      {/* Título e painel central */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <section
            className="panel"
            style={{
              minHeight: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <form
              className="form-grid"
              style={{ width: "100%", maxWidth: 900 }}
              onSubmit={handleSubmit}
            >
              {/* Coluna Esquerda */}
              <div className="col">
                <label className="label">Nome do agente</label>
                <input
                  className="input"
                  value={nome_agente}
                  onChange={(e) => setNomeAgente(e.target.value)}
                />

                <label className="label mt">Instruções</label>
                <textarea
                  className="textarea"
                  id="instrucoes-textarea"
                  rows={6}
                  value={instrucoes}
                  onChange={(e) => setInstrucoes(e.target.value)}
                />
                {/* Container de short_codes dos anexos */}
                <div className="shortcode-container">
                  {anexos.length === 0 ? (
                    <span style={{ color: "#aaa", fontSize: 13 }}>Nenhum documento anexado.</span>
                  ) : (
                    <div className="shortcode-list">
                      {anexos.map((anexo, idx) => (
                        <button
                          key={anexo.short_code || idx}
                          type="button"
                          className="shortcode-pill"
                          title={anexo.nome}
                          onClick={() => inserirShortCode(anexo.short_code)}
                        >
                          <span className="shortcode-pill-text">{`<{${anexo.short_code}}>`}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="row mt-sm">
                  <div className="mini">
                    <label className="label">Modelo</label>
                    <input
                      className="input"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                    />
                  </div>
                  <div className="mini">
                    <label className="label">IA</label>
                    <select
                      className="select"
                      value={ia}
                      onChange={(e) => setIa(e.target.value)}
                    >
                      <option>ChatGPT</option>
                      <option>Gemini</option>
                    </select>
                  </div>
                </div>

                <label className="label mt">Chave API:</label>
                <input
                  className="input"
                  value={chave_api}
                  onChange={(e) => setChaveApi(e.target.value)}
                />
              </div>

              {/* Coluna Direita */}
              <div className="col">
                <label className="label">Permissões(entrada)</label>
                <div className="checkbox-group">
                  {PERMISSOES.map((nome) => (
                    <label key={nome}>
                      <input
                        type="checkbox"
                        checked={permissoesEntradaMarcadas.includes(nome)}
                        onChange={() => handlePermissaoEntrada(nome)}
                      />{" "}
                      {nome}
                    </label>
                  ))}
                </div>

                <label className="label mt">Permissões(Saída)</label>
                <div className="checkbox-group">
                  {PERMISSOES_SAIDA.map((nome) => (
                    <label key={nome}>
                      <input
                        type="checkbox"
                        checked={permissoesSaidaMarcadas.includes(nome)}
                        onChange={() => handlePermissaoSaida(nome)}
                      />{" "}
                      {nome}
                    </label>
                  ))}
                </div>

                <label className="label mt">Domínios permitidos:</label>
                <input
                  className="input"
                  value={dominios_permitidos}
                  onChange={(e) => setDominiosPermitidos(e.target.value)}
                />

                <div className="actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => navigate("/agentes")}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

// ===== CSS (igual ao home.js, com form extra) =====
const css = `
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

/* OVERLAY */
.overlay{position:fixed;inset:0;background:var(--overlay);z-index:40}

/* SIDEBAR */
.sidebar{position:fixed;top:0;left:-240px;width:220px;height:100%;background:var(--sidebar);transition:all .3s ease;padding:20px 0;z-index:50;}
.sidebar.open{left:0;}
.sidebar nav ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;}
.sidebar nav li{padding:10px 20px;cursor:pointer;transition:background .2s;font-size:15px;}
.sidebar nav li:hover{background:var(--sidebar-hover);}
.sidebar nav li.exit{color:var(--exit);font-weight:600;}

/* HEADER */
.header-row{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:10px;padding:14px 22px;z-index:30;position:relative}
.icon-btn{height:34px;width:34px;border-radius:8px;background:#2b2d30;border:1px solid #3a3c3f;color:#fff;display:grid;place-items:center}
.brand{font-size:18px;font-weight:700;margin:0}
.avatar{height:36px;width:36px;border-radius:50%;background:white;color:black;border:none;display:grid;place-items:center}
.spacer{width:100%}

/* PAINEL CENTRAL */
.panel{width:min(980px,calc(100% - 64px));min-height:340px;margin:0 auto;border-radius:8px;background:var(--panel);border:2px solid var(--stroke);padding:32px 24px;display:flex;align-items:center;justify-content:center}

/* FORMULÁRIO */
.form-grid{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.label{display:block;font-size:14px;margin:8px 0 4px;color:#eaeaea}
.input{width:100%;height:34px;border-radius:6px;border:1px solid #cfcfcf;background:#2b2d30;color:#fff;padding:0 10px}
.textarea{width:100%;border-radius:6px;border:1px solid #cfcfcf;background:#3e4043;color:#fff;padding:10px;resize:vertical}
.select{height:34px;border-radius:6px;border:1px solid #cfcfcf;background:#2b2d30;color:#fff;padding:0 8px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.mini .input{height:34px}
.mt{margin-top:14px}
.mt-sm{margin-top:8px}
.checkbox-group{display:flex;flex-direction:column;gap:6px;font-size:14px}
.checkbox-group label{display:flex;align-items:center;gap:6px}
.actions{display:flex;gap:10px;justify-content:flex-end;margin-top:24px}
.btn{height:36px;padding:0 18px;border-radius:8px;border:1px solid transparent;font-weight:700;font-size:13px;cursor:pointer}
.btn-danger{background:#c13f4a;color:#fff}
.btn-success{background:#1e9e57;color:#fff}

/* SHORT CODES (ANEXOS) */
.shortcode-container{
  margin-top:10px;
  margin-bottom:8px;
  padding-bottom:2px;
  overflow-x:auto;
  white-space:nowrap;
  display:block;
  border-bottom:1px solid #444;
}
.shortcode-list{
  display:flex;
  gap:8px;
  overflow-x:auto;
  padding-bottom:2px;
}
.shortcode-pill{
  background:#232325;
  color:#00eaff;
  border:none;
  border-radius:6px;
  padding:6px 14px;
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  transition:background .2s;
  outline:none;
}
.shortcode-pill:hover, .shortcode-pill:focus{
  background:#1762c4;
  color:#fff;
}
.shortcode-pill-text{
  font-family:monospace;
  font-weight:bold;
  background:rgba(0,234,255,0.08);
  padding:2px 0;
  border-radius:3px;
}
`;

// Exportação nomeada para compatibilidade
export { AgentFormPage };