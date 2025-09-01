import React, { useState, useEffect, useRef } from "react";
import { Menu, User, Mic, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SimplicioPage() {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="simplicio-v2">
      <style>{css}</style>

      {/* OVERLAY */}
      {open && <div className="overlay" />}

      {/* SIDEBAR */}
      <aside ref={sidebarRef} className={`sidebar ${open ? "open" : ""}`}>
        <nav>
          <ul>
            <li>Início</li>
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
            <li>Arquivos</li>
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
        <h1 className="brand">Simplicio</h1>
        <div className="spacer" />
        <button className="avatar" aria-label="perfil">
          <User size={16} />
        </button>
      </div>

      {/* SELECT abaixo do título */}
      <div className="mode-row">
        <select className="mode" defaultValue="ChatGPT">
          <option>ChatGPT</option>
        </select>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <main className="main">
        <section className="panel" />
      </main>

      {/* INPUT BAR */}
      <footer className="footer">
        <div className="inputbar">
          <div className="chip">
            <Plus size={14} />
          </div>
          <input className="input" placeholder="|" />
          <button className="chip" aria-label="microfone">
            <Mic size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
}

// ===== CSS =====
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

.mode-row{padding:0 22px}
.mode{appearance:none;background:#2b2d30;color:#fff;border:1px solid var(--stroke);border-radius:6px;height:28px;padding:0 8px;font-size:12px}

.main{display:flex;justify-content:center}
.panel{width:min(980px,calc(100% - 64px));height:54vh;min-height:240px;margin-top:20px;border-radius:8px;background:var(--panel);border:2px solid var(--stroke)}

.footer{display:flex;justify-content:center;padding:18px 0 26px}
.inputbar{width:min(980px,calc(100% - 64px));background:#3b3d40;border:2px solid var(--stroke);border-radius:8px;display:grid;grid-template-columns:34px 1fr 34px;align-items:center;gap:6px;padding:8px}
.chip{height:24px;width:24px;display:grid;place-items:center;border-radius:6px;background:#2b2d30;color:#fff;border:1px solid #595b5f}
.input{background:transparent;border:none;color:#fff;outline:none;font-size:14px}
`;
