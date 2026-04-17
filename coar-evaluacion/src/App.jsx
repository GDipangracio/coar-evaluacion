import { useState, useRef, useEffect } from "react";

const COAR = {
  dark: "#1A3A5C",
  mid: "#2E6DA4",
  light: "#D6E8F7",
  green: "#1A7A4A",
  orange: "#C05A00",
};

const CRITERIOS = [
  {
    id: "calidad", nombre: "Calidad de trabajo", desc: "Precisión, terminación, retrabajo",
    opciones: [
      { val: 5, label: "Muy superior", desc: "No requiere correcciones. Otros lo toman como referencia." },
      { val: 4, label: "Superior", desc: "Errores mínimos que él mismo detecta y corrige." },
      { val: 3, label: "Satisfactorio", desc: "Cumple el estándar mínimo. Necesita supervisión ocasional." },
      { val: 2, label: "Norm. aceptable", desc: "Requiere corrección frecuente. No detecta sus propios errores." },
      { val: 1, label: "Insatisfactorio", desc: "Genera retrabajo sistemático." },
    ],
  },
  {
    id: "cantidad", nombre: "Cantidad de trabajo", desc: "Rendimiento y productividad diaria",
    opciones: [
      { val: 5, label: "Muy superior", desc: "Supera consistentemente al grupo. Referente de productividad." },
      { val: 4, label: "Superior", desc: "Produce por encima del promedio de forma sostenida." },
      { val: 3, label: "Satisfactorio", desc: "Cumple el ritmo esperado. No frena el avance." },
      { val: 2, label: "Norm. aceptable", desc: "Ritmo inferior con frecuencia. Necesita seguimiento." },
      { val: 1, label: "Insatisfactorio", desc: "Su bajo rendimiento afecta a la cuadrilla." },
    ],
  },
  {
    id: "confiabilidad", nombre: "Confiabilidad", desc: "Asistencia, puntualidad, cumplimiento de instrucciones",
    opciones: [
      { val: 5, label: "Muy superior", desc: "Asistencia perfecta. Cumple sin recordatorio. Apto para tareas críticas." },
      { val: 4, label: "Superior", desc: "Muy buena asistencia. Avisa ante imprevistos." },
      { val: 3, label: "Satisfactorio", desc: "Asistencia regular. Cumple con supervisión normal." },
      { val: 2, label: "Norm. aceptable", desc: "Inasistencias o tardanzas recurrentes." },
      { val: 1, label: "Insatisfactorio", desc: "Ausentismo que afecta la planificación." },
    ],
  },
  {
    id: "actitud", nombre: "Actitud", desc: "Disposición, equipo, relación con el entorno",
    opciones: [
      { val: 5, label: "Muy superior", desc: "Empuja al equipo. Colabora sin que se lo pidan." },
      { val: 4, label: "Superior", desc: "Siempre dispuesto. Buena relación con mandos y externos." },
      { val: 3, label: "Satisfactorio", desc: "Cooperativo. No genera conflictos." },
      { val: 2, label: "Norm. aceptable", desc: "Actitud variable. Genera fricciones ocasionales." },
      { val: 1, label: "Insatisfactorio", desc: "Actitud negativa que afecta el clima de obra." },
    ],
  },
  {
    id: "seguridad", nombre: "Seguridad", desc: "Cumplimiento de normas, influencia en el equipo",
    opciones: [
      { val: 5, label: "Muy superior", desc: "Cumple todas las normas y promueve activamente su cumplimiento." },
      { val: 4, label: "Superior", desc: "Cumple consistentemente e influye positivamente." },
      { val: 3, label: "Satisfactorio", desc: "Cumple cuando se le recuerda. No genera riesgos activos." },
      { val: 2, label: "Norm. aceptable", desc: "Incumple con cierta frecuencia. Necesita corrección." },
      { val: 1, label: "Insatisfactorio", desc: "Incumplimiento sistemático que genera riesgo." },
    ],
  },
];

const INCIDENTES = [
  { id: 1, texto: "¿Tiene suficientes conocimientos técnicos para el desempeño de su oficio?", inversa: false },
  { id: 2, texto: "¿Tiene experiencia en el tipo de trabajo que está ejecutando?", inversa: false },
  { id: 3, texto: "¿Puede planear, ejecutar y controlar sus tareas de forma autónoma?", inversa: false },
  { id: 4, texto: "¿Demuestra concentración e interés durante el trabajo?", inversa: false },
  { id: 5, texto: "¿Tiene interés en aprender cosas nuevas y mejorar su oficio?", inversa: false },
  { id: 6, texto: "¿Presta atención al orden y las condiciones del lugar de trabajo?", inversa: false },
  { id: 7, texto: "¿Tiene cuidado con su seguridad y la de sus compañeros durante las tareas?", inversa: false },
  { id: 8, texto: "¿Su producción en términos de calidad y cantidad es elogiable?", inversa: false },
  { id: 9, texto: "¿Desarrolla tareas complejas prestando atención a las instrucciones recibidas?", inversa: false },
  { id: 10, texto: "¿Un curso de especialización sería recomendable para su progreso?", inversa: false },
  { id: 11, texto: "¿Trata con respeto a compañeros, mandos, clientes, vecinos y proveedores?", inversa: false },
  { id: 12, texto: "¿Su conducta en obra y en la vía pública refleja los valores de COAR?", inversa: false },
  { id: 13, texto: "¿Cumple el reglamento interno sin necesidad de recordatorio constante?", inversa: false },
  { id: 14, texto: "¿El resultado de su trabajo tiene errores frecuentes y no es satisfactorio?", inversa: true },
  { id: 15, texto: "¿Su presentación personal y vestimenta de trabajo es descuidada?", inversa: true },
];

const VAL_COLORS = {
  5: { bg: "#EAF3DE", color: "#3B6D11" },
  4: { bg: "#D6E8F7", color: "#1A3A5C" },
  3: { bg: "#FAEEDA", color: "#854F0B" },
  2: { bg: "#FAECE7", color: "#993C1D" },
  1: { bg: "#FCEBEB", color: "#A32D2D" },
};

const STEPS = ["Sesión", "Calidad", "Cantidad", "Confiab.", "Actitud", "Seguridad", "Incidentes", "Resumen"];

function ProgressBar({ active }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: 1 }}>
          <div style={{
            height: 3, borderRadius: 2,
            background: i < active ? COAR.mid : i === active ? COAR.orange : "#e0e0e0",
            transition: "background 0.3s",
          }} />
          <div style={{ fontSize: 9, color: i <= active ? COAR.dark : "#aaa", marginTop: 3, textAlign: "center" }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

function Bubble({ role, children }) {
  const isAgent = role === "agent";
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isAgent ? "row" : "row-reverse", marginBottom: 12 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: isAgent ? COAR.dark : "#f0f0f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 500, color: isAgent ? "#fff" : "#666",
        border: isAgent ? "none" : "1px solid #ddd",
      }}>
        {isAgent ? "CO" : "SV"}
      </div>
      <div style={{
        maxWidth: "82%", padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.6,
        background: isAgent ? "#f5f5f5" : COAR.dark,
        color: isAgent ? "#222" : "#fff",
        borderTopLeftRadius: isAgent ? 3 : 12,
        borderTopRightRadius: isAgent ? 12 : 3,
        border: isAgent ? "1px solid #e8e8e8" : "none",
      }}>
        {children}
      </div>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: color === "orange" ? "#FAEEDA" : COAR.light,
      color: color === "orange" ? COAR.orange : COAR.dark,
      marginBottom: 4,
    }}>{children}</span>
  );
}

function ComparativoTable({ rows, onEdit, title }) {
  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden", marginTop: 8 }}>
      <div style={{ background: COAR.light, padding: "8px 14px", fontSize: 12, fontWeight: 500, color: COAR.dark }}>{title}</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderTop: "1px solid #e8e8e8", gap: 10 }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#222" }}>{r.nombre}</span>
          <span style={{
            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: r.bg, color: r.color,
          }}>{r.label}</span>
          {onEdit && (
            <button onClick={() => onEdit(r.nombre)} style={{
              fontSize: 11, color: COAR.mid, background: "none",
              border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", padding: "2px 8px",
            }}>Editar</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AgenteEvaluacion() {
  const [messages, setMessages] = useState([]);
  const [fase, setFase] = useState("config_obra");
  const [config, setConfig] = useState({ obra: "", supervisor: "", oficio: "", categoria: "", periodo: "" });
  const [operarios, setOperarios] = useState([]);
  const [opInput, setOpInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [criterioIdx, setCriterioIdx] = useState(0);
  const [operarioIdx, setOperarioIdx] = useState(0);
  const [incidenteIdx, setIncidenteIdx] = useState(0);
  const [datos, setDatos] = useState({});
  const [incidentes, setIncidentes] = useState({});
  const [selVal, setSelVal] = useState(null);
  const [selResp, setSelResp] = useState(null);
  const [obsText, setObsText] = useState("");
  const [esperandoConfirm, setEsperandoConfirm] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    addAgent("Hola. Soy el agente de evaluación de personal COAR.\n\nVamos a registrar la evaluación de un grupo de operarios del mismo oficio y categoría, pregunta por pregunta — comparando todos antes de avanzar.\n\n¿En qué obra se realiza esta evaluación?");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, fase]);

  function addAgent(text) {
    setMessages(m => [...m, { role: "agent", text }]);
  }
  function addUser(text) {
    setMessages(m => [...m, { role: "user", text }]);
  }

  function progressStep() {
    if (fase.startsWith("config")) return 0;
    if (fase === "criterio" && criterioIdx === 0) return 1;
    if (fase === "criterio") return criterioIdx + 1;
    if (fase === "comparativo_criterio") return criterioIdx + 1;
    if (fase === "incidente" || fase === "comparativo_incidente") return 6;
    if (fase === "resumen") return 7;
    return 0;
  }

  function handleConfigText() {
    const val = textInput.trim();
    if (!val) return;
    addUser(val);
    setTextInput("");
    const order = ["config_obra", "config_supervisor", "config_oficio", "config_categoria", "config_periodo"];
    const fields = ["obra", "supervisor", "oficio", "categoria", "periodo"];
    const prompts = [
      (v) => `Obra: ${v}. ¿Cuál es tu nombre completo como supervisor evaluador?`,
      (v) => `Registrado. ¿Qué oficio vas a evaluar en esta sesión?`,
      (v) => `Oficio: ${v}. ¿Qué categoría?`,
      (v) => `Categoría: ${v}. ¿Qué período cubre esta evaluación?`,
      (v) => `Período: ${v}.\n\nAhora agregá los operarios del grupo. Podés agregar todos y después iniciar la evaluación.`,
    ];
    const idx = order.indexOf(fase);
    const field = fields[idx];
    setConfig(c => ({ ...c, [field]: val }));
    const nextFase = idx + 1 < order.length ? order[idx + 1] : "config_operarios";
    setFase(nextFase);
    setTimeout(() => addAgent(prompts[idx](val)), 100);
  }

  function addOperario() {
    const val = opInput.trim();
    if (!val) return;
    setOperarios(o => [...o, val]);
    setOpInput("");
  }

  function removeOperario(i) {
    setOperarios(o => o.filter((_, j) => j !== i));
  }

  function startEval() {
    const d = {}, inc = {};
    operarios.forEach(op => { d[op] = {}; inc[op] = {}; });
    setDatos(d);
    setIncidentes(inc);
    addUser(operarios.join(", "));
    addAgent(`Grupo confirmado: ${operarios.length} operario${operarios.length > 1 ? "s" : ""}.\n\nAhora evaluamos criterio por criterio. Para cada uno, calificás a todos antes de pasar al siguiente.\n\nEmpezamos.`);
    setCriterioIdx(0);
    setOperarioIdx(0);
    setSelVal(null);
    setFase("criterio");
    setTimeout(() => addAgent(`Criterio 1/5 — ${CRITERIOS[0].nombre}\n${CRITERIOS[0].desc}\n\nCalificá a ${operarios[0]}:`), 400);
  }

  function confirmarCriterio() {
    if (selVal === null) return;
    const c = CRITERIOS[criterioIdx];
    const op = operarios[operarioIdx];
    const opcion = c.opciones.find(o => o.val === selVal);
    addUser(`${op}: ${selVal} — ${opcion.label}`);
    const nextOpIdx = operarioIdx + 1;
    setDatos(d => {
      const updated = { ...d, [op]: { ...d[op], [c.id]: selVal } };
      return updated;
    });
    setSelVal(null);
    if (nextOpIdx < operarios.length) {
      setOperarioIdx(nextOpIdx);
      setTimeout(() => addAgent(`Calificá a ${operarios[nextOpIdx]}:`), 200);
    } else {
      setOperarioIdx(0);
      setTimeout(() => {
        setFase("comparativo_criterio");
        setEsperandoConfirm(true);
      }, 50);
    }
  }

  function confirmarCriterioGrupo() {
    setEsperandoConfirm(false);
    const next = criterioIdx + 1;
    if (next >= CRITERIOS.length) {
      addAgent("Planilla 1 completa.\n\nAhora pasamos a la Planilla 2 — Incidentes críticos.\n\nSon 15 preguntas de SÍ/NO. Respondemos por todos los operarios antes de pasar a la siguiente.");
      setIncidenteIdx(0);
      setOperarioIdx(0);
      setSelResp(null);
      setObsText("");
      setFase("incidente");
      setTimeout(() => {
        const inc = INCIDENTES[0];
        addAgent(`Pregunta 1/15${inc.inversa ? " ⚠ redacción inversa" : ""}\n${inc.texto}\n\n${operarios[0]}:`);
      }, 400);
    } else {
      setCriterioIdx(next);
      setOperarioIdx(0);
      setSelVal(null);
      setFase("criterio");
      setTimeout(() => addAgent(`Criterio ${next + 1}/5 — ${CRITERIOS[next].nombre}\n${CRITERIOS[next].desc}\n\nCalificá a ${operarios[0]}:`), 300);
    }
  }

  function editarDesdeComparativo(op) {
    const opIdx = operarios.indexOf(op);
    setOperarioIdx(opIdx);
    setSelVal(datos[op]?.[CRITERIOS[criterioIdx].id] || null);
    setFase("criterio");
    setEsperandoConfirm(false);
    addAgent(`Editando calificación de ${op} en ${CRITERIOS[criterioIdx].nombre}:`);
  }

  function confirmarIncidente() {
    if (!selResp) return;
    const inc = INCIDENTES[incidenteIdx];
    const op = operarios[operarioIdx];
    addUser(`${op}: ${selResp}${obsText ? " — " + obsText : ""}`);
    setIncidentes(d => ({ ...d, [op]: { ...d[op], [inc.id]: { resp: selResp, obs: obsText } } }));
    setSelResp(null);
    setObsText("");
    const nextOpIdx = operarioIdx + 1;
    if (nextOpIdx < operarios.length) {
      setOperarioIdx(nextOpIdx);
      setTimeout(() => addAgent(`${operarios[nextOpIdx]}:`), 150);
    } else {
      setOperarioIdx(0);
      setTimeout(() => {
        setFase("comparativo_incidente");
        setEsperandoConfirm(true);
      }, 50);
    }
  }

  function confirmarIncidenteGrupo() {
    setEsperandoConfirm(false);
    const next = incidenteIdx + 1;
    if (next >= INCIDENTES.length) {
      setFase("resumen");
      addAgent("Evaluación completa. Revisá el resumen antes de generar los archivos.");
    } else {
      setIncidenteIdx(next);
      setOperarioIdx(0);
      setSelResp(null);
      setObsText("");
      setFase("incidente");
      const inc = INCIDENTES[next];
      setTimeout(() => addAgent(`Pregunta ${inc.id}/15${inc.inversa ? " ⚠ redacción inversa" : ""}\n${inc.texto}\n\n${operarios[0]}:`), 300);
    }
  }

  function editarIncDesdeComparativo(op) {
    const opIdx = operarios.indexOf(op);
    setOperarioIdx(opIdx);
    const d = incidentes[op]?.[INCIDENTES[incidenteIdx].id];
    setSelResp(d?.resp || null);
    setObsText(d?.obs || "");
    setFase("incidente");
    setEsperandoConfirm(false);
    addAgent(`Editando pregunta ${INCIDENTES[incidenteIdx].id} para ${op}:`);
  }

  function generarReporteLocal() {
    const lineas = [];
    lineas.push("REPORTE DE EVALUACIÓN — COAR");
    lineas.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lineas.push("Obra: " + config.obra);
    lineas.push("Supervisor: " + config.supervisor);
    lineas.push("Grupo: " + config.oficio + " — " + config.categoria);
    lineas.push("Período: " + config.periodo);
    lineas.push("");
    const resultados = operarios.map(op => {
      const pts = CRITERIOS.reduce((sum, c) => sum + (datos[op]?.[c.id] || 0), 0);
      const max = CRITERIOS.length * 5;
      const pct = Math.round((pts / max) * 100);
      const positivos = INCIDENTES.filter(inc => {
        const d = incidentes[op]?.[inc.id];
        return d && ((d.resp === "SI" && !inc.inversa) || (d.resp === "NO" && inc.inversa));
      }).length;
      const negativosInversa = INCIDENTES.filter(inc => {
        const d = incidentes[op]?.[inc.id];
        return inc.inversa && d && d.resp === "SI";
      });
      let recomendacion = "";
      if (pts >= 22 && positivos >= 13) recomendacion = "⬆ SUBIDA DE CATEGORÍA";
      else if (pts >= 19 && positivos >= 11) recomendacion = "💰 RECONOCIMIENTO ECONÓMICO";
      else if (pts >= 15 && positivos >= 9) recomendacion = "⚠ SIN CAMBIOS — mantener categoría actual";
      else recomendacion = "📈 PLAN DE DESARROLLO Y SEGUIMIENTO";
      const divergencias = [];
      CRITERIOS.forEach(c => {
        const val = datos[op]?.[c.id] || 0;
        if ((c.id === "confiabilidad" || c.id === "actitud") && val <= 2) {
          divergencias.push(c.nombre + ": calificación baja (" + val + "/5) — verificar con JO");
        }
      });
      if (negativosInversa.length > 0) {
        divergencias.push("Alertas en incidentes: " + negativosInversa.map(i => "P" + i.id).join(", "));
      }
      return { op, pts, max, pct, positivos, recomendacion, divergencias };
    });
    resultados.forEach(r => {
      lineas.push("▸ " + r.op);
      lineas.push("  Planilla 1: " + r.pts + "/" + r.max + " pts (" + r.pct + "%)");
      CRITERIOS.forEach(c => {
        const val = datos[r.op]?.[c.id] || 0;
        const opcion = c.opciones.find(o => o.val === val);
        lineas.push("    " + c.nombre + ": " + val + " — " + (opcion?.label || "-"));
      });
      lineas.push("  Planilla 2: " + r.positivos + "/15 respuestas positivas");
      if (r.divergencias.length > 0) {
        lineas.push("  Alertas:");
        r.divergencias.forEach(d => lineas.push("    • " + d));
      }
      lineas.push("  Recomendación: " + r.recomendacion);
      lineas.push("");
    });
    lineas.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lineas.push("COMPARATIVO DEL GRUPO");
    const sorted = [...resultados].sort((a, b) => b.pts - a.pts);
    sorted.forEach((r, i) => {
      lineas.push("  " + (i+1) + ". " + r.op + " — " + r.pts + "/" + r.max + " pts · " + r.positivos + "/15 incidentes");
    });
    lineas.push("");
    lineas.push("Documento generado para puesta en común con Gerencia y Dirección.");
    return lineas.join("\n");
  }

  function generarArchivos() {
    setGenerando(true);
    try {
      const reporte = generarReporteLocal();
      setResultado(reporte);
    } catch (e) {
      setResultado("Error al generar el reporte.");
    }
    setGenerando(false);
  }

  const ps = progressStep();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 680, margin: "0 auto", padding: "16px 0 32px" }}>
      <div style={{ background: COAR.dark, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: COAR.mid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#fff", flexShrink: 0 }}>CO</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>Agente de evaluación de personal</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Planillas 1 y 2 · Supervisor · Por grupo de oficio y categoría</div>
        </div>
        {config.oficio && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{config.oficio} — {config.categoria}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{config.obra}</div>
          </div>
        )}
      </div>

      <ProgressBar active={ps} />

      <div style={{ minHeight: 200, marginBottom: 20 }}>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.text.split("\n").map((line, j) => (
              <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
            ))}
          </Bubble>
        ))}

        {fase === "comparativo_criterio" && (() => {
          const c = CRITERIOS[criterioIdx];
          const rows = operarios.map(op => {
            const val = datos[op]?.[c.id];
            const opcion = c.opciones.find(o => o.val === val);
            return { nombre: op, label: `${val} — ${opcion?.label}`, ...VAL_COLORS[val] };
          });
          return (
            <div style={{ marginBottom: 16 }}>
              <ComparativoTable rows={rows} onEdit={editarDesdeComparativo} title={`Comparativo — ${c.nombre}`} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button onClick={confirmarCriterioGrupo} style={{ padding: "9px 22px", background: COAR.dark, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Confirmar y continuar
                </button>
              </div>
            </div>
          );
        })()}

        {fase === "comparativo_incidente" && (() => {
          const inc = INCIDENTES[incidenteIdx];
          const rows = operarios.map(op => {
            const d = incidentes[op]?.[inc.id] || {};
            const resp = d.resp || "—";
            const esPositivo = (resp === "SI" && !inc.inversa) || (resp === "NO" && inc.inversa);
            return {
              nombre: op,
              label: resp + (d.obs ? ` · ${d.obs}` : ""),
              bg: esPositivo ? "#EAF3DE" : "#FCEBEB",
              color: esPositivo ? "#3B6D11" : "#A32D2D",
            };
          });
          return (
            <div style={{ marginBottom: 16 }}>
              <ComparativoTable rows={rows} onEdit={editarIncDesdeComparativo} title={`Pregunta ${inc.id}/15 — comparativo`} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button onClick={confirmarIncidenteGrupo} style={{ padding: "9px 22px", background: COAR.dark, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Confirmar y continuar
                </button>
              </div>
            </div>
          );
        })()}

        {fase === "resumen" && (
          <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 12 }}>Resumen del grupo — {config.oficio} {config.categoria}</div>
            {operarios.map(op => {
              const pts = CRITERIOS.reduce((sum, c) => sum + (datos[op]?.[c.id] || 0), 0);
              const max = CRITERIOS.length * 5;
              const positivos = INCIDENTES.filter(inc => {
                const d = incidentes[op]?.[inc.id];
                return d && ((d.resp === "SI" && !inc.inversa) || (d.resp === "NO" && inc.inversa));
              }).length;
              return (
                <div key={op} style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{op}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Planilla 1: {pts}/{max} pts · Planilla 2: {positivos}/15 respuestas positivas
                  </div>
                  <div style={{ display: "flex", gap: 3, marginTop: 8, flexWrap: "wrap" }}>
                    {CRITERIOS.map(c => {
                      const val = datos[op]?.[c.id] || 0;
                      return (
                        <div key={c.id} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#999", marginBottom: 2 }}>{c.nombre.split(" ")[0]}</div>
                          <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, background: VAL_COLORS[val]?.bg || "#eee", color: VAL_COLORS[val]?.color || "#999" }}>{val}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {!resultado && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                <button onClick={() => { setFase("criterio"); setCriterioIdx(0); setOperarioIdx(0); setSelVal(null); addAgent("Revisión iniciada. Empezamos desde el primer criterio."); }}
                  style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>
                  Revisar todo
                </button>
                <button onClick={generarArchivos} disabled={generando}
                  style={{ padding: "8px 22px", background: COAR.green, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: generando ? 0.6 : 1 }}>
                  {generando ? "Generando reporte..." : "Generar reporte de consolidación"}
                </button>
              </div>
            )}
            {resultado && (
              <div style={{ marginTop: 16, padding: 14, background: COAR.light, borderRadius: 8, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: COAR.dark }}>
                {resultado}
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "14px 16px" }}>

        {/* Config text inputs */}
        {fase.startsWith("config_") && fase !== "config_operarios" && (
          <>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 500 }}>
              {{ config_obra: "Nombre de la obra", config_supervisor: "Nombre del supervisor", config_oficio: "Oficio a evaluar", config_categoria: "Categoría", config_periodo: "Período evaluado" }[fase]}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={textInput} onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleConfigText()}
                placeholder={{ config_obra: "Ej: Obra Belgrano", config_supervisor: "Nombre y apellido", config_oficio: "Ej: Albañil colocador", config_categoria: "Ej: Oficial", config_periodo: "Ej: Enero–Diciembre 2025" }[fase]}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
              <button onClick={handleConfigText} style={{ padding: "8px 18px", background: COAR.dark, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Confirmar</button>
            </div>
          </>
        )}

        {fase === "config_operarios" && (
          <>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500 }}>Operarios del grupo — {config.oficio} {config.categoria}</div>
            {operarios.map((op, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                <span style={{ flex: 1 }}>{op}</span>
                <button onClick={() => removeOperario(i)} style={{ fontSize: 11, color: "#999", background: "none", border: "none", cursor: "pointer" }}>quitar</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input value={opInput} onChange={e => setOpInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addOperario()}
                placeholder="Nombre del operario" style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
              <button onClick={addOperario} style={{ padding: "8px 14px", background: COAR.mid, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Agregar</button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={startEval} disabled={operarios.length === 0}
                style={{ padding: "9px 22px", background: COAR.green, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: operarios.length === 0 ? 0.4 : 1 }}>
                Iniciar evaluación
              </button>
            </div>
          </>
        )}

        {fase === "criterio" && (() => {
          const c = CRITERIOS[criterioIdx];
          const op = operarios[operarioIdx];
          return (
            <>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 500 }}>
                <Tag color="orange">Criterio {criterioIdx + 1}/5</Tag> {c.nombre} · <strong>{op}</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {c.opciones.map(o => (
                  <button key={o.val} onClick={() => setSelVal(o.val)}
                    style={{
                      padding: "10px 12px", border: `1px solid ${selVal === o.val ? COAR.mid : "#ddd"}`,
                      borderRadius: 8, background: selVal === o.val ? COAR.light : "#fff",
                      cursor: "pointer", textAlign: "left", fontSize: 13, lineHeight: 1.4,
                      color: selVal === o.val ? COAR.dark : "#333",
                    }}>
                    <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: "50%", background: COAR.mid, color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, marginRight: 6 }}>{o.val}</span>
                    <strong>{o.label}</strong>
                    <br /><span style={{ fontSize: 11, color: "#888" }}>{o.desc}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={confirmarCriterio} disabled={selVal === null}
                  style={{ padding: "9px 22px", background: COAR.dark, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: selVal === null ? 0.4 : 1 }}>
                  Confirmar
                </button>
              </div>
            </>
          );
        })()}

        {fase === "incidente" && (() => {
          const inc = INCIDENTES[incidenteIdx];
          const op = operarios[operarioIdx];
          return (
            <>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500 }}>
                <Tag color="orange">Pregunta {inc.id}/15</Tag> {inc.inversa && <span style={{ color: COAR.orange, fontSize: 11 }}>⚠ redacción inversa</span>}
              </div>
              <div style={{ fontSize: 14, color: "#222", marginBottom: 12, lineHeight: 1.5 }}>{inc.texto}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 8 }}>{op}:</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["SI", "NO"].map(r => (
                  <button key={r} onClick={() => setSelResp(r)}
                    style={{ flex: 1, padding: "10px", border: `1px solid ${selResp === r ? COAR.mid : "#ddd"}`, borderRadius: 8, background: selResp === r ? COAR.light : "#fff", cursor: "pointer", fontWeight: 500, fontSize: 14, color: selResp === r ? COAR.dark : "#555" }}>
                    {r}
                  </button>
                ))}
              </div>
              <input value={obsText} onChange={e => setObsText(e.target.value)}
                placeholder="Observación puntual (opcional)"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, marginBottom: 12, boxSizing: "border-box" }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={confirmarIncidente} disabled={!selResp}
                  style={{ padding: "9px 22px", background: COAR.dark, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: !selResp ? 0.4 : 1 }}>
                  Confirmar
                </button>
              </div>
            </>
          );
        })()}

        {(fase === "comparativo_criterio" || fase === "comparativo_incidente" || fase === "resumen") && !resultado && (
          <div style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "8px 0" }}>
            {fase === "resumen" ? "Revisá el resumen y generá el reporte cuando estés listo." : "Revisá el comparativo y confirmá para continuar."}
          </div>
        )}

        {resultado && (
          <div style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "8px 0" }}>
            Reporte generado. Próximamente: exportación a Excel y Word.
          </div>
        )}
      </div>
    </div>
  );
}
