import React, { useState, useEffect, useRef, useContext } from "react";
import { Menu, User, Mic, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

export default function SimplicioPage() {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  async function handleLogout() {
    setOpen(false);
    try {
      await logout();
      navigate('/');
    } catch (e) {
      // ignore
    }
  }

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

      {/* BG BLOBS (decoração animada) */}
      <div className="bg-blobs" aria-hidden>
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

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
            <li className="exit" style={{ cursor: "pointer" }} onClick={handleLogout}>Sair</li>
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
        <h1 className="brand">Agente</h1>
        <div className="spacer" />
        <button className="avatar" aria-label="perfil">
          <User size={16} />
          <span className="avatar-ring" />
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
        <section className="panel">
          <div className="welcome">
            <h2 className="welcome-title">Bem-vindo de volta</h2>
            <p className="welcome-sub">
              Seu painel está pronto — comece a interagir.
            </p>
            <div
              className="pulse-cta"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/atendimentos")}
            >
              Ver atendimentos
            </div>
          </div>
        </section>
      </main>

      {/* INPUT BAR */}
      <footer className="footer">
        <div className="inputbar">
          <div className="chip">
            <Plus size={14} />
          </div>
          <input className="input" placeholder="Escreva uma mensagem..." />
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
  --bg:#0f1221;
  --panel:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
  --stroke:rgba(255,255,255,0.08);
  --sidebar:#111217;
  --sidebar-hover:#1b1d22;
  --exit:#ff6b6b;
  --overlay:rgba(0,0,0,0.55);
  --accent:#6ee7b7;
  --accent-2:#7dd3fc;
}
*{box-sizing:border-box}
html,body,#root{height:100%}

.simplicio-v2{min-height:100vh;background:radial-gradient(ellipse at 10% 10%, rgba(125,211,252,0.06), transparent 10%), radial-gradient(ellipse at 90% 90%, rgba(110,231,183,0.04), transparent 12%), var(--bg);color:#e6eef8;display:flex;flex-direction:column;position:relative;overflow-x:hidden;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto}

/* BG BLOBS */
.bg-blobs{position:fixed;inset:0;pointer-events:none;z-index:0}
.bg-blobs .blob{position:absolute;border-radius:50%;filter:blur(36px);opacity:0.6;mix-blend-mode:screen;transform:translate3d(0,0,0)}
.bg-blobs .b1{width:360px;height:360px;background:linear-gradient(135deg,var(--accent),#a78bfa);left:-80px;top:-60px;animation:float1 9s ease-in-out infinite}
.bg-blobs .b2{width:260px;height:260px;background:linear-gradient(135deg,var(--accent-2),#60a5fa);right:-40px;top:20%;animation:float2 12s ease-in-out infinite}
.bg-blobs .b3{width:200px;height:200px;background:linear-gradient(135deg,#f472b6,#fb923c);left:20%;bottom:-60px;animation:float3 14s ease-in-out infinite}

@keyframes float1{0%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-30px) rotate(8deg)}100%{transform:translateY(0) rotate(0deg)}}
@keyframes float2{0%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(36px) rotate(-6deg)}100%{transform:translateY(0) rotate(0deg)}}
@keyframes float3{0%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(4deg)}100%{transform:translateY(0) rotate(0deg)}}

/* OVERLAY */
.overlay{position:fixed;inset:0;background:var(--overlay);z-index:40}

/* SIDEBAR */
.sidebar{position:fixed;top:0;left:-260px;width:240px;height:100%;background:linear-gradient(180deg, #0c0d0f, #0f1113);transition:all .35s cubic-bezier(.2,.9,.2,1);padding:28px 12px;z-index:50;box-shadow:0 8px 30px rgba(2,6,23,0.6);backdrop-filter: blur(6px)}
.sidebar.open{left:0;}
.sidebar nav ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.sidebar nav li{padding:12px 18px;cursor:pointer;border-radius:8px;transition:background .18s, transform .18s;font-size:15px}
.sidebar nav li:hover{background:var(--sidebar-hover);transform:translateX(6px)}
.sidebar nav li.exit{color:var(--exit);font-weight:700}

/* HEADER */
.header-row{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:10px;padding:18px 28px;z-index:30;position:relative}
.icon-btn{height:40px;width:40px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);color:#fff;display:grid;place-items:center;transition:transform .15s, background .15s}
.icon-btn:hover{transform:translateY(-2px);background:rgba(255,255,255,0.05)}
.brand{font-size:20px;font-weight:800;margin:0;letter-spacing:0.4px;color:linear-gradient(90deg,#fff,#cce7ff);animation:fadeInDown .6s both}
.avatar{height:42px;width:42px;border-radius:50%;background:linear-gradient(180deg,#fff,#dbeafe);color:#000;border:none;display:grid;place-items:center;position:relative}
.avatar-ring{position:absolute;inset:-6px;border-radius:50%;box-shadow:0 0 18px rgba(125,211,252,0.12);pointer-events:none}
.spacer{width:100%}

@keyframes fadeInDown{0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:none}}

.mode-row{padding:0 22px;margin-top:6px}
.mode{appearance:none;background:rgba(255,255,255,0.03);color:#e6eef8;border:1px solid var(--stroke);border-radius:8px;height:34px;padding:0 12px;font-size:13px}

.main{display:flex;justify-content:center;padding-bottom:12px}
.panel{width:min(980px,calc(100% - 64px));height:54vh;min-height:260px;margin-top:20px;border-radius:12px;background:var(--panel);border:1px solid var(--stroke);position:relative;z-index:10;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 40px rgba(2,6,23,0.6)}

/* Welcome card inside panel */
.welcome{padding:28px 36px;text-align:center;animation:cardIn .6s cubic-bezier(.2,.9,.2,1) both}
.welcome-title{font-size:22px;margin:0 0 6px 0;color:#fff}
.welcome-sub{margin:0 0 14px 0;color:rgba(230,238,248,0.8)}
.pulse-cta{display:inline-block;padding:10px 16px;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#04263b;font-weight:700;cursor:pointer;box-shadow:0 8px 30px rgba(110,231,183,0.12);transition:transform .18s, box-shadow .18s;animation:ctaPulse 2.8s infinite}
.pulse-cta:hover{transform:translateY(-4px);box-shadow:0 18px 50px rgba(110,231,183,0.18)}

@keyframes cardIn{0%{opacity:0;transform:translateY(10px) scale(.995)}100%{opacity:1;transform:none}}
@keyframes ctaPulse{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}

.footer{display:flex;justify-content:center;padding:22px 0 34px}
.inputbar{width:min(980px,calc(100% - 64px));background:rgba(255,255,255,0.02);border:1px solid var(--stroke);border-radius:12px;display:grid;grid-template-columns:46px 1fr 46px;align-items:center;gap:10px;padding:10px}
.chip{height:36px;width:36px;display:grid;place-items:center;border-radius:8px;background:rgba(255,255,255,0.03);color:#fff;border:1px solid rgba(255,255,255,0.02);cursor:pointer}
.input{background:transparent;border:none;color:#e6eef8;outline:none;font-size:15px}

/* small interactions */
.sidebar nav li{user-select:none}

/* reduced motion */
@media (prefers-reduced-motion: reduce){
  .bg-blobs .blob, .pulse-cta, .welcome{animation:none}
  .icon-btn:hover{transform:none}
}
`;
