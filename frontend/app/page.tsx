"use client";

import { useEffect, useRef, useState } from "react";

const API = "http://localhost:8081/api";
const SITE_KEY = "6LdusAcuAAAAAJJnHmDSZhyd28H0M7qs0seBODmL";

type EstadoCuenta = {
  numeroRegistro: string;
  cliente: string;
  sector: string;
  lecturasRegistradas: number;
  lecturasSinPagar: number;
  montoPendiente: number;
  estado: string;
};

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opciones: Record<string, unknown>) => number;
      reset: (id?: number) => void;
    };
    onCargarRecaptcha?: () => void;
  }
}

const estilos = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap');

.aq *, .aq *::before, .aq *::after { box-sizing: border-box; }

.aq {
  --tinta: #0d2b2a;
  --agua: #0f6e78;
  --agua-hover: #0b545c;
  --papel: #f4f8f7;
  --linea: #c8d8d6;
  --bien: #19613f;
  --bien-fondo: #e4f0e9;
  --pendiente: #8a4b10;
  --pendiente-fondo: #f7ecdc;

  min-height: 100vh;
  background: var(--papel);
  color: var(--tinta);
  font-family: Archivo, system-ui, sans-serif;
  font-variation-settings: "wdth" 100;
}

.aq-barra {
  background: var(--agua);
  color: #fff;
  padding: 14px 20px;
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}
.aq-marca {
  font-size: 19px;
  font-weight: 800;
  font-variation-settings: "wdth" 118;
  letter-spacing: 0.04em;
}
.aq-oficina { font-size: 13.5px; font-weight: 500; opacity: 0.88; }

.aq-centro { max-width: 520px; margin: 0 auto; padding: 44px 20px 72px; }

.aq-titulo {
  font-size: clamp(30px, 8vw, 42px);
  line-height: 1.04;
  font-weight: 800;
  font-variation-settings: "wdth" 108;
  letter-spacing: -0.015em;
  margin: 0;
}
.aq-bajada {
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.55;
  max-width: 44ch;
  color: #44605e;
}

.aq-panel {
  margin-top: 32px;
  background: #fff;
  border: 1px solid var(--linea);
  border-radius: 4px;
  padding: 24px 22px;
}

.aq-campo { display: block; }
.aq-etiqueta { display: block; font-size: 14.5px; font-weight: 600; margin-bottom: 7px; }
.aq-ayuda { font-size: 13px; color: #5d7876; margin: 7px 0 0; }

.aq-input {
  width: 100%;
  font-family: inherit;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  padding: 13px 14px;
  color: var(--tinta);
  background: #fff;
  border: 1.5px solid var(--linea);
  border-radius: 3px;
}
.aq-input::placeholder { color: #a8bcba; font-weight: 500; letter-spacing: 0.04em; }
.aq-input:focus { outline: 3px solid rgba(15, 110, 120, 0.35); outline-offset: 1px; border-color: var(--agua); }

.aq-captcha { margin-top: 22px; min-height: 78px; }
@media (max-width: 380px) {
  .aq-captcha > div { transform: scale(0.86); transform-origin: left top; }
  .aq-captcha { min-height: 68px; }
}

.aq-boton {
  margin-top: 22px;
  width: 100%;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  background: var(--agua);
  border: none;
  border-radius: 3px;
  padding: 15px 18px;
  cursor: pointer;
}
.aq-boton:hover { background: var(--agua-hover); }
.aq-boton:focus-visible { outline: 3px solid rgba(15, 110, 120, 0.45); outline-offset: 2px; }
.aq-boton:disabled { opacity: 0.55; cursor: default; }

.aq-aviso {
  margin-top: 22px;
  border-left: 4px solid var(--pendiente);
  background: var(--pendiente-fondo);
  color: #6f3c0c;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.5;
  border-radius: 0 3px 3px 0;
}

/* El resultado se presenta como la boleta de papel del fontanero. */
.aq-recibo-envoltura { margin-top: 32px; }
.aq-recibo {
  background: #fff;
  border: 1px solid var(--linea);
  border-bottom: none;
  padding: 26px 24px 30px;
}
.aq-dentado {
  height: 14px;
  background-image: radial-gradient(circle at 7px 0, var(--papel) 7px, #fff 7.5px);
  background-size: 14px 14px;
  background-repeat: repeat-x;
  border-left: 1px solid var(--linea);
  border-right: 1px solid var(--linea);
}

.aq-recibo-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid var(--tinta);
}
.aq-recibo-rotulo { font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; }
.aq-recibo-registro { font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }

.aq-titular { margin: 18px 0 2px; font-size: 25px; font-weight: 700; line-height: 1.15; }
.aq-sector { margin: 0; font-size: 15px; color: #52706e; }

.aq-detalle { margin: 22px 0 0; border-top: 1px dashed var(--linea); }
.aq-renglon {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px dashed var(--linea);
  font-size: 15px;
}
.aq-renglon dt { color: #52706e; }
.aq-renglon dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }

.aq-total { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-top: 20px; }
.aq-total-texto { font-size: 15px; font-weight: 600; }
.aq-total-monto {
  font-size: 36px;
  font-weight: 800;
  font-variation-settings: "wdth" 110;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.aq-sello {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
}
.aq-sello::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.aq-sello-bien { background: var(--bien-fondo); color: var(--bien); }
.aq-sello-pendiente { background: var(--pendiente-fondo); color: var(--pendiente); }

.aq-pie { margin-top: 44px; font-size: 13px; line-height: 1.6; color: #6b8482; }

@keyframes aq-emitir {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: none; }
}
.aq-recibo-envoltura { animation: aq-emitir 260ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .aq-recibo-envoltura { animation: none; }
}
`;

export default function ConsultaPublica() {
  const contenedorCaptcha = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  const [numeroRegistro, setNumeroRegistro] = useState("");
  const [tokenCaptcha, setTokenCaptcha] = useState("");
  const [resultado, setResultado] = useState<EstadoCuenta | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    function dibujarCaptcha() {
      if (!contenedorCaptcha.current || widgetId.current !== null) return;
      if (!window.grecaptcha?.render) return;

      widgetId.current = window.grecaptcha.render(contenedorCaptcha.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => setTokenCaptcha(token),
        "expired-callback": () => setTokenCaptcha(""),
      });
    }

    if (window.grecaptcha?.render) {
      dibujarCaptcha();
      return;
    }

    window.onCargarRecaptcha = dibujarCaptcha;

    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=onCargarRecaptcha&render=explicit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  function reiniciarCaptcha() {
    setTokenCaptcha("");
    if (widgetId.current !== null) {
      window.grecaptcha?.reset(widgetId.current);
    }
  }

  async function consultar(e: React.FormEvent) {
    e.preventDefault();

    if (!tokenCaptcha) {
      setError("Marque la casilla de verificación para continuar.");
      return;
    }

    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const res = await fetch(`${API}/consulta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroRegistro, tokenCaptcha }),
      });

      const datos = await res.json();

      if (res.ok) {
        setResultado(datos);
      } else {
        setError(datos.mensaje ?? "No se pudo completar la consulta.");
      }
    } catch {
      setError("No hay conexión con el servidor. Intente de nuevo en un momento.");
    } finally {
      // Google invalida el token al usarlo, así que se reinicia la casilla.
      reiniciarCaptcha();
      setCargando(false);
    }
  }

  const alDia = resultado?.estado === "Al día";

  return (
    <div className="aq">
      <style>{estilos}</style>

      <header className="aq-barra">
        <span className="aq-marca">AQUORA</span>
        <span className="aq-oficina">Oficina Comunitaria de Agua Potable</span>
      </header>

      <main className="aq-centro">
        <h1 className="aq-titulo">
          Consulte el estado
          <br />
          de su contador
        </h1>
        <p className="aq-bajada">
          Escriba el número de registro que aparece en su recibo. No necesita
          crear cuenta ni contraseña.
        </p>

        <form className="aq-panel" onSubmit={consultar}>
          <label className="aq-campo">
            <span className="aq-etiqueta">Número de registro</span>
            <input
              className="aq-input"
              type="text"
              value={numeroRegistro}
              onChange={(e) => setNumeroRegistro(e.target.value)}
              placeholder="CT-000"
              required
              autoComplete="off"
              inputMode="text"
            />
          </label>
          <p className="aq-ayuda">
            Lo encuentra arriba a la derecha de su último recibo.
          </p>

          <div className="aq-captcha" ref={contenedorCaptcha} />

          <button className="aq-boton" type="submit" disabled={cargando}>
            {cargando ? "Buscando…" : "Ver estado de cuenta"}
          </button>
        </form>

        {error && <p className="aq-aviso">{error}</p>}

        {resultado && (
          <div className="aq-recibo-envoltura">
            <div className="aq-recibo">
              <div className="aq-recibo-cabecera">
                <span className="aq-recibo-rotulo">ESTADO DE CUENTA</span>
                <span className="aq-recibo-registro">
                  {resultado.numeroRegistro}
                </span>
              </div>

              <p className="aq-titular">{resultado.cliente}</p>
              <p className="aq-sector">{resultado.sector}</p>

              <dl className="aq-detalle">
                <div className="aq-renglon">
                  <dt>Lecturas registradas</dt>
                  <dd>{resultado.lecturasRegistradas}</dd>
                </div>
                <div className="aq-renglon">
                  <dt>Lecturas sin pagar</dt>
                  <dd>{resultado.lecturasSinPagar}</dd>
                </div>
              </dl>

              <div className="aq-total">
                <span className="aq-total-texto">Total pendiente</span>
                <span className="aq-total-monto">
                  Q{resultado.montoPendiente.toFixed(2)}
                </span>
              </div>

              <span
                className={`aq-sello ${
                  alDia ? "aq-sello-bien" : "aq-sello-pendiente"
                }`}
              >
                {resultado.estado}
              </span>
            </div>
            <div className="aq-dentado" />
          </div>
        )}

        <p className="aq-pie">
          Esta consulta es solo informativa. Para reclamos o para registrar un
          pago, acérquese a la oficina en horario de atención.
        </p>
      </main>
    </div>
  );
}