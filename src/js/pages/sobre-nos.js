document.addEventListener("DOMContentLoaded", () => {
  // Inicializa os ícones Lucide
  lucide.createIcons();

  // Configuração do clique no botão de Acessibilidade flutuante
  const btnAcessibilidade = document.getElementById("btn-acessibilidade");
  
  if (btnAcessibilidade) {
    btnAcessibilidade.addEventListener("click", () => {
      let vlibrasContainer = document.getElementById("vlibras-plugin");

      if (!vlibrasContainer) {
        vlibrasContainer = document.createElement("div");
        vlibrasContainer.id = "vlibras-plugin";
        vlibrasContainer.innerHTML = `
          <div vw class="enabled">
            <div vw-access-button class="active"></div>
            <div vw-plugin-wrapper>
              <div class="vw-plugin-top-wrapper"></div>
            </div>
          </div>
        `;
        document.body.appendChild(vlibrasContainer);

        const script = document.createElement("script");
        script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
        script.onload = () => {
          new window.VLibras.Widget("https://vlibras.gov.br/app");
          setTimeout(() => {
            const accessBtn = document.querySelector("[vw-access-button]");
            if (accessBtn) accessBtn.click();
          }, 500);
        };
        document.head.appendChild(script);
      } else {
        const accessBtn = document.querySelector("[vw-access-button]");
        if (accessBtn) accessBtn.click();
      }
    });
  }
});