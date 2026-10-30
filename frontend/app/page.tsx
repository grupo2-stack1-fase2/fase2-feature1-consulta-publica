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
  --tinta: #0b2b2d;
  --agua: #0f6e78;
  --agua-hover: #0b545c;
  --agua-honda: #0a3c42;
  --papel: #f1f6f5;
  --linea: #ccdbd9;
  --suave: #55736f;
  --bien: #19613f;
  --bien-fondo: #e4f0e9;
  --pendiente: #8a4b10;
  --pendiente-fondo: #f7ecdc;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--papel);
  color: var(--tinta);
  font-family: Archivo, system-ui, sans-serif;
  font-variation-settings: "wdth" 100;
}

.aq-ancho { width: 100%; max-width: 1060px; margin: 0 auto; padding: 0 24px; }

/* ---------- Cabecera ---------- */
.aq-cabecera { background: var(--agua-honda); color: #fff; }
.aq-cabecera-fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 16px 0;
}
.aq-identidad { display: flex; align-items: center; gap: 13px; }
.aq-logo {
  width: 38px; height: 38px;
  border-radius: 7px;
  background: #fff;
  color: var(--agua-honda);
  display: grid; place-items: center;
  font-size: 19px; font-weight: 800;
  font-variation-settings: "wdth" 120;
}
.aq-marca { font-size: 19px; font-weight: 800; letter-spacing: 0.05em; line-height: 1.1; }
.aq-oficina { font-size: 12.5px; opacity: 0.82; line-height: 1.3; }
.aq-horario { font-size: 12.5px; opacity: 0.82; text-align: right; line-height: 1.5; }

/* ---------- Presentación ---------- */
.aq-portada { background: var(--agua); color: #fff; padding: 52px 0 56px; }
.aq-rotulo {
  font-size: 12px; font-weight: 700; letter-spacing: 0.16em;
  opacity: 0.78; margin: 0 0 14px;
}
.aq-titulo {
  margin: 0;
  font-size: clamp(31px, 5.2vw, 46px);
  line-height: 1.05;
  font-weight: 800;
  font-variation-settings: "wdth" 106;
  letter-spacing: -0.018em;
  max-width: 17ch;
}
.aq-bajada {
  margin: 18px 0 0;
  font-size: 16.5px;
  line-height: 1.6;
  max-width: 52ch;
  opacity: 0.93;
}

/* ---------- Cuerpo ---------- */
.aq-cuerpo { flex: 1; padding: 0 0 72px; }
.aq-rejilla {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 26px;
  align-items: start;
  margin-top: -34px;
}
@media (max-width: 860px) {
  .aq-rejilla { grid-template-columns: minmax(0, 1fr); }
}

.aq-tarjeta {
  background: #fff;
  border: 1px solid var(--linea);
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(11, 43, 45, 0.05);
}
.aq-tarjeta-titulo {
  margin: 0;
  padding: 18px 24px;
  font-size: 15.5px;
  font-weight: 700;
  border-bottom: 1px solid var(--linea);
}
.aq-tarjeta-cuerpo { padding: 24px; }

.aq-campo { display: block; }
.aq-etiqueta { display: block; font-size: 14.5px; font-weight: 600; margin-bottom: 7px; }
.aq-ayuda { font-size: 13px; color: var(--suave); margin: 8px 0 0; }

.aq-input {
  width: 100%;
  font-family: inherit;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.07em;
  font-variant-numeric: tabular-nums;
  padding: 14px 15px;
  color: var(--tinta);
  background: #fff;
  border: 1.5px solid var(--linea);
  border-radius: 4px;
}
.aq-input::placeholder { color: #a9bfbc; font-weight: 500; }
.aq-input:focus {
  outline: 3px solid rgba(15, 110, 120, 0.3);
  outline-offset: 1px;
  border-color: var(--agua);
}

.aq-captcha { margin-top: 24px; min-height: 78px; }
@media (max-width: 400px) {
  .aq-captcha > div { transform: scale(0.85); transform-origin: left top; }
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
  border-radius: 4px;
  padding: 15px 18px;
  cursor: pointer;
}
.aq-boton:hover { background: var(--agua-hover); }
.aq-boton:focus-visible { outline: 3px solid rgba(15, 110, 120, 0.45); outline-offset: 2px; }
.aq-boton:disabled { opacity: 0.55; cursor: default; }

.aq-aviso {
  margin: 22px 0 0;
  border-left: 4px solid var(--pendiente);
  background: var(--pendiente-fondo);
  color: #6f3c0c;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.5;
  border-radius: 0 4px 4px 0;
}

/* ---------- Panel lateral ---------- */
.aq-lateral { display: grid; gap: 16px; }
.aq-nota {
  background: #fff;
  border: 1px solid var(--linea);
  border-radius: 6px;
  padding: 20px 22px;
}
.aq-nota h2 { margin: 0 0 10px; font-size: 14.5px; font-weight: 700; }
.aq-nota p { margin: 0; font-size: 13.5px; line-height: 1.62; color: var(--suave); }
.aq-lista { margin: 0; padding: 0; list-style: none; }
.aq-lista li {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--suave);
  padding: 7px 0 7px 18px;
  position: relative;
  border-bottom: 1px dashed var(--linea);
}
.aq-lista li:last-child { border-bottom: none; }
.aq-lista li::before {
  content: "";
  position: absolute;
  left: 2px; top: 14px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--agua);
}

/* ---------- Recibo ---------- */
.aq-recibo-envoltura { max-width: 620px; margin: 30px 0 0; }
.aq-recibo {
  background: #fff;
  border: 1px solid var(--linea);
  border-bottom: none;
  padding: 28px 28px 32px;
}
.aq-dentado {
  height: 14px;
  background-image: radial-gradient(circle at 7px 0, var(--papel) 7px, #fff 7.5px);
  background-size: 14px 14px;
  background-repeat: repeat-x;
  border-left: 1px solid var(--linea);
  border-right: 1px solid var(--linea);
}

.aq-membrete { display: none; }

.aq-recibo-cabecera {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 12px; padding-bottom: 14px; border-bottom: 1.5px solid var(--tinta);
}
.aq-recibo-rotulo { font-size: 12.5px; font-weight: 700; letter-spacing: 0.1em; }
.aq-recibo-registro { font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }

.aq-titular { margin: 20px 0 3px; font-size: 26px; font-weight: 700; line-height: 1.15; }
.aq-sector { margin: 0; font-size: 15px; color: var(--suave); }

.aq-seccion {
  margin: 26px 0 8px;
  font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em; color: #7f9a97;
}
.aq-detalle { margin: 0; border-top: 1px dashed var(--linea); }
.aq-renglon {
  display: flex; justify-content: space-between; gap: 16px;
  padding: 11px 0; border-bottom: 1px dashed var(--linea); font-size: 15px;
}
.aq-renglon dt { color: var(--suave); }
.aq-renglon dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }

.aq-total {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 16px; margin-top: 24px; padding-top: 16px; border-top: 2px solid var(--tinta);
}
.aq-total-texto { font-size: 15px; font-weight: 700; }
.aq-total-monto {
  font-size: 38px; font-weight: 800;
  font-variation-settings: "wdth" 110;
  font-variant-numeric: tabular-nums; letter-spacing: -0.02em;
}

.aq-sello {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 18px; padding: 7px 14px; border-radius: 999px;
  font-size: 14px; font-weight: 700;
}
.aq-sello::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.aq-sello-bien { background: var(--bien-fondo); color: var(--bien); }
.aq-sello-pendiente { background: var(--pendiente-fondo); color: var(--pendiente); }

.aq-emision {
  margin: 24px 0 0; padding-top: 14px;
  border-top: 1px dashed var(--linea);
  font-size: 12.5px; line-height: 1.6; color: #7f9a97;
}

.aq-acciones { margin-top: 18px; max-width: 620px; }
.aq-boton-secundario {
  font-family: inherit; font-size: 15px; font-weight: 700;
  color: var(--agua); background: #fff;
  border: 1.5px solid var(--agua); border-radius: 4px;
  padding: 12px 20px; cursor: pointer;
}
.aq-boton-secundario:hover { background: #e9f4f4; }
.aq-boton-secundario:focus-visible { outline: 3px solid rgba(15, 110, 120, 0.45); outline-offset: 2px; }

/* ---------- Pie ---------- */
.aq-pie { background: var(--agua-honda); color: #fff; padding: 36px 0 30px; }
.aq-pie-rejilla {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 26px;
}
.aq-pie h2 { margin: 0 0 9px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; }
.aq-pie p { margin: 0; font-size: 13.5px; line-height: 1.65; opacity: 0.82; }
.aq-pie-legal {
  margin-top: 28px; padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,0.16);
  font-size: 12.5px; opacity: 0.7;
}

@keyframes aq-emitir {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: none; }
}
.aq-recibo-envoltura { animation: aq-emitir 260ms ease-out; }
@media (prefers-reduced-motion: reduce) { .aq-recibo-envoltura { animation: none; } }

/* ---------- Impresión ---------- */
@media print {
  @page { size: letter; margin: 20mm; }

  .aq-cabecera, .aq-portada, .aq-tarjeta, .aq-lateral,
  .aq-aviso, .aq-pie, .aq-acciones, .aq-dentado { display: none !important; }

  .aq { background: #fff; min-height: 0; display: block; }
  .aq-ancho { max-width: none; padding: 0; }
  .aq-cuerpo { padding: 0; }
  .aq-rejilla { display: block; margin: 0; }
  .aq-recibo-envoltura { max-width: none; margin: 0; animation: none; }
  .aq-recibo { border: none; padding: 0; }

  .aq-membrete {
    display: block;
    padding-bottom: 18px; margin-bottom: 22px;
    border-bottom: 2.5px solid #0b2b2d;
  }
  .aq-membrete-marca { margin: 0; font-size: 23px; font-weight: 800; letter-spacing: 0.05em; }
  .aq-membrete-oficina { margin: 5px 0 0; font-size: 13px; color: #44605e; }

  .aq-sello { border: 1.5px solid currentColor; }
}
`;

export default function ConsultaPublica() {
  const contenedorCaptcha = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  const [numeroRegistro, setNumeroRegistro] = useState("");
  const [tokenCaptcha, setTokenCaptcha] = useState("");
  const [resultado, setResultado] = useState<EstadoCuenta | null>(null);
  const [emitidoEn, setEmitidoEn] = useState("");
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
    if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
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
        setEmitidoEn(
          new Date().toLocaleString("es-GT", {
            dateStyle: "long",
            timeStyle: "short",
          })
        );
      } else {
        setError(datos.mensaje ?? "No se pudo completar la consulta.");
      }
    } catch {
      setError("No hay conexión con el servidor. Intente de nuevo en un momento.");
    } finally {
      reiniciarCaptcha();
      setCargando(false);
    }
  }

  const alDia = resultado?.estado === "Al día";
  const lecturasPagadas = resultado
    ? resultado.lecturasRegistradas - resultado.lecturasSinPagar
    : 0;

  return (
    <div className="aq">
      <style>{estilos}</style>

      <header className="aq-cabecera">
        <div className="aq-ancho aq-cabecera-fila">
          <div className="aq-identidad">
            <span className="aq-logo">A</span>
            <span>
              <span className="aq-marca">AQUORA</span>
              <br />
              <span className="aq-oficina">
                Oficina Comunitaria de Agua Potable
              </span>
            </span>
          </div>
          <p className="aq-horario">
            Atención al público
            <br />
            Lunes a viernes, 8:00 a 16:00
          </p>
        </div>
      </header>

      <section className="aq-portada">
        <div className="aq-ancho">
          <p className="aq-rotulo">SERVICIO EN LÍNEA</p>
          <h1 className="aq-titulo">Consulte el estado de su contador</h1>
          <p className="aq-bajada">
            Conozca cuántas lecturas tiene pendientes y cuánto debe, sin venir a
            la oficina. No necesita crear cuenta ni contraseña.
          </p>
        </div>
      </section>

      <main className="aq-cuerpo">
        <div className="aq-ancho">
          <div className="aq-rejilla">
            <div>
              <form className="aq-tarjeta" onSubmit={consultar}>
                <h2 className="aq-tarjeta-titulo">Datos de la consulta</h2>
                <div className="aq-tarjeta-cuerpo">
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
                    />
                  </label>
                  <p className="aq-ayuda">
                    Lo encuentra arriba a la derecha de su último recibo.
                  </p>

                  <div className="aq-captcha" ref={contenedorCaptcha} />

                  <button className="aq-boton" type="submit" disabled={cargando}>
                    {cargando ? "Buscando…" : "Ver estado de cuenta"}
                  </button>
                </div>
              </form>

              {error && <p className="aq-aviso">{error}</p>}

              {resultado && (
                <>
                  <div className="aq-recibo-envoltura">
                    <div className="aq-recibo">
                      <div className="aq-membrete">
                        <p className="aq-membrete-marca">AQUORA</p>
                        <p className="aq-membrete-oficina">
                          Oficina Comunitaria de Agua Potable
                        </p>
                      </div>

                      <div className="aq-recibo-cabecera">
                        <span className="aq-recibo-rotulo">ESTADO DE CUENTA</span>
                        <span className="aq-recibo-registro">
                          {resultado.numeroRegistro}
                        </span>
                      </div>

                      <p className="aq-titular">{resultado.cliente}</p>
                      <p className="aq-sector">{resultado.sector}</p>

                      <p className="aq-seccion">LECTURAS</p>
                      <dl className="aq-detalle">
                        <div className="aq-renglon">
                          <dt>Registradas</dt>
                          <dd>{resultado.lecturasRegistradas}</dd>
                        </div>
                        <div className="aq-renglon">
                          <dt>Pagadas</dt>
                          <dd>{lecturasPagadas}</dd>
                        </div>
                        <div className="aq-renglon">
                          <dt>Pendientes de pago</dt>
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

                      <p className="aq-emision">
                        Consulta generada el {emitidoEn}.
                        <br />
                        Documento informativo. No constituye comprobante de pago
                        ni sustituye al recibo oficial emitido por la oficina.
                      </p>
                    </div>
                    <div className="aq-dentado" />
                  </div>

                  <div className="aq-acciones">
                    <button
                      type="button"
                      className="aq-boton-secundario"
                      onClick={() => window.print()}
                    >
                      Imprimir o guardar en PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <aside className="aq-lateral">
              <div className="aq-nota">
                <h2>Qué puede consultar</h2>
                <ul className="aq-lista">
                  <li>Lecturas registradas de su contador</li>
                  <li>Lecturas pendientes de pago</li>
                  <li>Saldo pendiente en quetzales</li>
                  <li>Si su cuenta está al día</li>
                </ul>
              </div>

              <div className="aq-nota">
                <h2>¿No encuentra su número?</h2>
                <p>
                  El número de registro aparece impreso en la parte superior de
                  su recibo, con el formato CT seguido de tres dígitos. Si no
                  conserva ningún recibo, puede solicitarlo en la oficina
                  presentando su documento de identificación.
                </p>
              </div>

              <div className="aq-nota">
                <h2>Sobre esta consulta</h2>
                <p>
                  La información es de carácter informativo. Para registrar un
                  pago o presentar un reclamo debe acudir a la oficina en
                  horario de atención.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="aq-pie">
        <div className="aq-ancho">
          <div className="aq-pie-rejilla">
            <div>
              <h2>OFICINA</h2>
              <p>
                Oficina Comunitaria de Agua Potable
                <br />
                Jutiapa, Guatemala
              </p>
            </div>
            <div>
              <h2>ATENCIÓN</h2>
              <p>
                Lunes a viernes
                <br />
                8:00 a 16:00
              </p>
            </div>
            <div>
              <h2>SECTORES ATENDIDOS</h2>
              <p>JUTIAPA</p>
            </div>
          </div>
          <p className="aq-pie-legal">
            Sistema AQUORA · Consulta pública de estado de cuenta
          </p>
        </div>
      </footer>
    </div>
  );
}