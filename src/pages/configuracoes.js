import React, { useState, useRef, useEffect, useContext } from "react";
import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

export default function ConfiguracoesPage() {
  const [nomeSistema, setNomeSistema] = useState("");
  const [logoText, setLogoText] = useState("Logo do sistema");
  const [storagePercent, setStoragePercent] = useState(67);
  const [faviconText, setFaviconText] = useState("Ícone do site (512x512)");
  const [maxStorageGB, setMaxStorageGB] = useState(10);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { logout } = useContext(AuthContext);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // calcula cor entre azul (h=200) e vermelho (h=0)
  const progressColor = (() => {
    const pct = Math.max(0, Math.min(100, storagePercent));
    const hue = Math.round((1 - pct / 100) * 200); // 200->0
    return `hsl(${hue} 85% 50%)`;
  })();

  return (
    <div className="config-page">
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
            <li className="exit" style={{ cursor: "pointer" }} onClick={async () => { setOpen(false); try { await logout(); navigate('/'); } catch (e){} }}>Sair</li>
          </ul>
        </nav>
      </aside>

      <header className="header-row">
        <button className="icon-btn" aria-label="menu" onClick={() => setOpen(!open)}>
          <Menu size={18} />
        </button>
        <div className="brand" />
        <div className="spacer" />
        <button className="avatar" aria-label="perfil">
          <User size={16} />
        </button>
      </header>

      <main className="main">
        <div className="card">
          <h2 className="card-title">Configurações</h2>

          <div className="card-grid">
            <div className="card-main">
              <div className="form-row">
                <label className="label">Nome do sistema</label>
                <input
                  className="input"
                  value={nomeSistema}
                  onChange={(e) => setNomeSistema(e.target.value)}
                  placeholder="Nome do sistema"
                />
              </div>

              <div className="form-row">
                <label className="label">Logo</label>
                <div className="logo-row">
                  <button
                    className="btn logo-btn"
                    type="button"
                    onClick={() => logoInputRef.current && logoInputRef.current.click()}
                  >
                    {logoText}
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) setLogoText(f.name);
                    }}
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="label">Ícone do site (favicon)</label>
                <div className="logo-row">
                  <button
                    className="btn logo-btn"
                    type="button"
                    onClick={() => faviconInputRef.current && faviconInputRef.current.click()}
                  >
                    {faviconText}
                  </button>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    className="file-input"
                    accept="image/png,image/x-icon,image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) setFaviconText(f.name);
                    }}
                  />
                </div>
                <div className="help">O ícone deve ser quadrado e pelo menos 512x512 px (PNG ou ICO).</div>
              </div>
            </div>

            <div className="card-side">
              <div className="form-row">
                <label className="label">Armazenamentos:</label>
                <div className="storage-row">
                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${storagePercent}%`, background: `linear-gradient(90deg, #00bcd4, ${progressColor})` }}
                    />
                  </div>
                  <div className="percent">{storagePercent}%</div>
                </div>
              </div>

              <div className="form-row">
                <label className="label">Limite de armazenamento (GB)</label>
                <input
                  type="number"
                  className="input"
                  value={maxStorageGB}
                  min={1}
                  onChange={(e) => setMaxStorageGB(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-primary">Salvar</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export { ConfiguracoesPage };

const css = `
:root{ --bg:#1f2022; --panel:#2a2c2f; --stroke:#d9d9d9; --blue:#00bcd4 }
*{box-sizing:border-box}
html,body,#root{height:100%}
.config-page{min-height:100vh;background:var(--bg);color:#fff;display:flex;flex-direction:column}
.header-row{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:10px;padding:14px 22px}
.icon-btn{height:34px;width:34px;border-radius:8px;background:#2b2d30;border:1px solid #3a3c3f;color:#fff;display:grid;place-items:center}
.avatar{height:36px;width:36px;border-radius:50%;background:white;color:black;border:none;display:grid;place-items:center}
.spacer{width:100%}
.main{flex:1;display:flex;justify-content:center;padding:28px}
.card{width:min(900px,calc(100% - 80px));height:400px;border:1px solid var(--stroke);border-radius:8px;padding:28px;background:var(--panel);overflow:auto}
.card-title{font-size:18px;margin:0 0 16px 0}
.form-row{margin-bottom:12px}
.card-grid{display:grid;grid-template-columns:1fr 220px;gap:18px;align-items:start}
.card-main{}
.card-side{padding-left:12px}
.label{display:block;font-size:13px;color:#cfcfcf;margin-bottom:8px}
.input{height:32px;padding:6px 10px;border-radius:6px;border:1px solid #6f7175;background:#232324;color:#fff}
.logo-row{display:flex;align-items:center;gap:12px}
.logo-btn{padding:10px 18px;border-radius:8px;background:#3a3c3f;border:1px solid #bfbfbf;color:#fff}
.file-input{opacity:0;position:absolute;left:-9999px;width:1px;height:1px}
.help{font-size:12px;color:#bfbfbf;margin-top:6px}
.input[type="number"]{width:140px}
.storage-row{display:flex;align-items:center;gap:12px;justify-content:flex-end}
.progress{width:160px;height:14px;background:#2f3336;border-radius:999px;overflow:hidden;border:1px solid rgba(255,255,255,0.04)}
.progress-fill{height:100%;border-radius:999px;transition:width 600ms ease, background 800ms ease}
.percent{font-size:22px;color:var(--blue);font-weight:700}
.actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px}
.btn{height:36px;padding:0 14px;border-radius:6px;border:1px solid transparent;cursor:pointer}
.btn-primary{background:#0f57b3;color:#fff}
.btn-light{background:#d9d9d9;color:#000}
/* SIDEBAR */
.sidebar{position:fixed;top:0;left:-260px;width:240px;height:100%;background:linear-gradient(180deg, #0c0d0f, #0f1113);transition:all .35s cubic-bezier(.2,.9,.2,1);padding:28px 12px;z-index:50;box-shadow:0 8px 30px rgba(2,6,23,0.6);backdrop-filter: blur(6px)}
.sidebar.open{left:0;}
.sidebar nav ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.sidebar nav li{padding:12px 18px;cursor:pointer;border-radius:8px;transition:background .18s, transform .18s;font-size:15px}
.sidebar nav li:hover{background:var(--sidebar-hover);transform:translateX(6px)}
.sidebar nav li.exit{color:var(--exit);font-weight:700}`;
