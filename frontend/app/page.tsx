"use client";

import { useEffect, useRef, useState } from "react";

const API = "http://localhost:8081/api";
const SITE_KEY = "6LfHGAQuAAAAADD80vURShmGB_HK-_oeRK7ewG7V";

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

export default function ConsultaPublica() {
  const contenedorCaptcha = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  const [numeroRegistro, setNumeroRegistro] = useState("");
  const [tokenCaptcha, setTokenCaptcha] = useState("");
  const [resultado, setResultado] = useState<EstadoCuenta | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Carga el script de Google y dibuja la casilla "No soy un robot".
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
      setError('Marca la casilla "No soy un robot" antes de consultar.');
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
        setError(datos.mensaje ?? "Ocurrió un error en la consulta.");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Verifica que esté encendido.");
    } finally {
      // Google invalida el token tras usarlo, así que se reinicia la casilla.
      reiniciarCaptcha();
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Consulta pública</h1>
          <p className="mt-2 text-slate-600">
            Consulta el estado de cuenta de tu contador de agua sin necesidad de
            iniciar sesión.
          </p>
        </header>

        <form
          onSubmit={consultar}
          className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <label className="block text-sm font-medium text-slate-700">
            Número de registro del contador
            <input
              type="text"
              value={numeroRegistro}
              onChange={(e) => setNumeroRegistro(e.target.value)}
              placeholder="Ejemplo: CT-001"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <div className="mt-5">
            <span className="block text-sm font-medium text-slate-700">
              Verificación de seguridad
            </span>
            <div ref={contenedorCaptcha} className="mt-2" />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="mt-6 w-full rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {cargando ? "Consultando..." : "Consultar"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-800 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {resultado && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Estado de cuenta</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Fila etiqueta="Número de registro" valor={resultado.numeroRegistro} />
              <Fila etiqueta="Cliente" valor={resultado.cliente} />
              <Fila etiqueta="Sector" valor={resultado.sector} />
              <Fila
                etiqueta="Lecturas registradas"
                valor={String(resultado.lecturasRegistradas)}
              />
              <Fila
                etiqueta="Lecturas sin pagar"
                valor={String(resultado.lecturasSinPagar)}
              />
              <Fila
                etiqueta="Monto pendiente"
                valor={`Q ${resultado.montoPendiente.toFixed(2)}`}
              />
            </dl>
            <p
              className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                resultado.estado === "Al día"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {resultado.estado}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <dt className="text-slate-500">{etiqueta}</dt>
      <dd className="font-medium text-slate-900">{valor}</dd>
    </div>
  );
}