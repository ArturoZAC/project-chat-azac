export const AuthBranding = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center align-center h-full min-h-screen p-10 relative overflow-hidden">
      {/* Fondo degradado */}
      <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-hover to-[#5B21B6]" />

      {/* Esfera grande top-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          top: "-10%",
          left: "-12%",
          background: "radial-gradient(circle at 35% 35%, #A78BFA, #7C3AED, #4C1D95)",
          boxShadow: "0 0 80px rgba(167,139,250,0.35), inset 0 0 50px rgba(255,255,255,0.08)",
          opacity: 0.7,
        }}
      />

      {/* Esfera mediana top-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          top: "12%",
          right: "-6%",
          background: "radial-gradient(circle at 38% 38%, #C4B5FD, #8B5CF6, #5B21B6)",
          boxShadow: "0 0 50px rgba(196,181,253,0.25)",
          opacity: 0.55,
        }}
      />

      {/* Esfera pequeña mid-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 110,
          height: 110,
          top: "42%",
          left: "6%",
          background: "radial-gradient(circle at 38% 38%, #A78BFA, #6D28D9)",
          boxShadow: "0 0 40px rgba(167,139,250,0.2)",
          opacity: 0.45,
        }}
      />

      {/* Esfera grande bottom-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          bottom: "8%",
          right: "-8%",
          background: "radial-gradient(circle at 35% 35%, #C4B5FD, #7C3AED, #4C1D95)",
          boxShadow: "0 0 70px rgba(167,139,250,0.3)",
          opacity: 0.5,
        }}
      />

      {/* Esfera pequeña bottom-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          bottom: "32%",
          left: "18%",
          background: "radial-gradient(circle at 38% 38%, #A78BFA, #6D28D9)",
          opacity: 0.35,
        }}
      />

      {/* Orbe central difuso */}
      <div
        className="absolute rounded-full"
        style={{
          width: 460,
          height: 340,
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse, #A78BFA 0%, #7C3AED 40%, transparent 75%)",
          opacity: 0.18,
          filter: "blur(12px)",
        }}
      />

      {/* Texto central */}
      <div className="relative z-10 flex flex-col gap-5 mx-auto w-md max-w-75">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-white" style={{ opacity: 0.45 }} />
          <span className="h1-badge-white uppercase tracking-[0.2em]" style={{ opacity: 0.7 }}>
            Chat en tiempo real
          </span>
        </div>

        {/* Headline */}
        <h2 className="h2-white leading-tight">
          Tu equipo,
          <br />
          siempre <span className="text-accent">conectado.</span>
        </h2>

        {/* Chat preview decorativo */}
        <div className="flex flex-col gap-2">
          <small className="p-white" style={{ opacity: 0.45 }}>
            Lucía · hace 2 min
          </small>
          <div
            className="self-start px-3 py-2 rounded-2xl rounded-bl text-sm"
            style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.9)" }}
          >
            ¿Revisaste el diseño nuevo? 👀
          </div>
          <div
            className="self-end px-3 py-2 rounded-2xl rounded-br text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.92)", color: "#5B21B6" }}
          >
            Sí, quedó increíble 🔥
          </div>
          <small className="p-white text-right" style={{ opacity: 0.45 }}>
            Tú · ahora
          </small>
        </div>

        <p className="p-white" style={{ opacity: 0.8 }}>
          Mensajes rápidos, canales organizados y colaboración fluida — todo en un solo lugar.
        </p>

        {/* Badge */}
        <div
          className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border"
          style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-300 shrink-0" />
          <span className="h1-badge-white" style={{ opacity: 0.85 }}>
            Productividad nivel pro
          </span>
        </div>
      </div>
    </div>
  );
};
