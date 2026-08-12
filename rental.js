
(function(){
 const cfg=window.REYGUE_CONFIG; if(!cfg||!cfg.rental)return;
 const eq=cfg.rental.equipment[0];
 document.querySelectorAll("[data-rental-status]").forEach(el=>{el.textContent=eq.status;el.dataset.status=eq.status.toLowerCase().replace("ó","o");});
 const buttons=[...document.querySelectorAll("[data-rental-plan]")];
 const co2=document.querySelector("#includeCo2");
 const ePrice=document.querySelector("[data-equipment-price]");
 const xPrice=document.querySelector("[data-extra-price]");
 const total=document.querySelector("[data-total-price]");
 const mode=document.querySelector("[data-rental-mode]");
 const cta=document.querySelector("[data-rental-whatsapp]");
 if(!buttons.length)return;
 let selected="diaria";
 const money=v=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(v);
 function render(){
   const plan=eq.plans[selected], extra=co2&&co2.checked?plan.co2:0, sum=plan.price+extra;
   buttons.forEach(b=>b.classList.toggle("is-active",b.dataset.rentalPlan===selected));
   if(ePrice)ePrice.textContent=money(plan.price); if(xPrice)xPrice.textContent=money(extra); if(total)total.textContent=money(sum); if(mode)mode.textContent=plan.days;
   if(cta)cta.dataset.message=`Hola, me interesa rentar la ${eq.name} por ${plan.days}${co2&&co2.checked?" con cilindro CO2":" sin cilindro CO2"}. El estimado mostrado en la página es de ${money(sum)}. ¿Tienen disponibilidad?`;
 }
 buttons.forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.rentalPlan;render();}));
 if(co2)co2.addEventListener("change",render); render();
})();
