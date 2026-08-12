// Animación antes de cambiar de una página HTML a otra.
document.querySelectorAll(".animated-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) return;

    event.preventDefault();

    if (link.classList.contains("hotspot-informes")) {
      link.classList.add("is-clicked");
    }

    document.body.classList.add("is-leaving");

    setTimeout(() => {
      window.location.href = href;
    }, 390);
  });
});

// Contenido dinámico para detalle.html
if (document.body.classList.contains("detail-page")) {
  const plans = {
    diaria: {
      eyebrow: "RENTA DIARIA",
      title: "Elite MIG 300",
      description: "Opción pensada para trabajos puntuales o proyectos de corta duración.",
      price: "$650",
      equipment: "Elite MIG 300",
      mode: "1 día",
      message: "Hola, quiero informes sobre la renta diaria de la Elite MIG 300 por $650."
    },
    semanal: {
      eyebrow: "RENTA SEMANAL",
      title: "Elite MIG 300",
      description: "Una modalidad práctica para trabajos que necesitan varios días de uso.",
      price: "$1,700",
      equipment: "Elite MIG 300",
      mode: "1 semana",
      message: "Hola, quiero informes sobre la renta semanal de la Elite MIG 300 por $1,700."
    },
    mensual: {
      eyebrow: "RENTA MENSUAL",
      title: "Elite MIG 300",
      description: "Opción para proyectos de mayor duración que requieren el equipo por más tiempo.",
      price: "$4,000",
      equipment: "Elite MIG 300",
      mode: "1 mes",
      message: "Hola, quiero informes sobre la renta mensual de la Elite MIG 300 por $4,000."
    },
    co2: {
      eyebrow: "CILINDRO CO2 OPCIONAL",
      title: "Servicio de CO2",
      description: "Complemento opcional para la renta del equipo, con tarifa según el periodo.",
      price: "Desde $100",
      equipment: "Cilindro CO2",
      mode: "$100 día · $250 semana · $600 mes",
      message: "Hola, quiero informes sobre el cilindro CO2 opcional para la renta de la Elite MIG 300."
    }
  };

  const params = new URLSearchParams(window.location.search);
  const selected = plans[params.get("plan")] || plans.diaria;

  document.getElementById("detailEyebrow").textContent = selected.eyebrow;
  document.getElementById("detailTitle").textContent = selected.title;
  document.getElementById("detailDescription").textContent = selected.description;
  document.getElementById("detailPrice").textContent = selected.price;
  document.getElementById("detailEquipment").textContent = selected.equipment;
  document.getElementById("detailMode").textContent = selected.mode;

  // IMPORTANTE: cambia este número por tu WhatsApp real.
  const phone = "5210000000000";
  document.getElementById("detailWhatsapp").href =
    `https://wa.me/${phone}?text=${encodeURIComponent(selected.message)}`;
}
