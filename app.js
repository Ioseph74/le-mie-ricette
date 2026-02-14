var tutteLeRicette = [];
var categoriaAttiva = "tutte";
var ricercaAttiva = "";

document.addEventListener("DOMContentLoaded", function() {
    applyTranslationsIndex();
    initAuth(function(user) {
        caricaEMostraRicette();
    });
    inizializzaFiltri();
    inizializzaRicerca();
    // Insert language selector
    var langContainer = document.getElementById("langSelectorContainer");
    if (langContainer) langContainer.innerHTML = buildLanguageSelector();
});

function applyTranslationsIndex() {
    document.title = t("app.title");
    var appTitle = document.getElementById("appTitle");
    if (appTitle) appTitle.textContent = t("app.title");
    var searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.placeholder = t("search.placeholder");
    var btnNew = document.getElementById("btnNewRecipe");
    if (btnNew) btnNew.querySelector("span").textContent = t("header.newRecipe");
    var loginText = document.getElementById("loginText");
    if (loginText) loginText.textContent = t("auth.login");
    var emptyTitle = document.getElementById("emptyTitle");
    if (emptyTitle) emptyTitle.textContent = t("empty.title");
    var emptyMsg = document.getElementById("emptyMessage");
    if (emptyMsg) emptyMsg.textContent = t("empty.message");
    var btnCreate = document.getElementById("btnCreateRecipe");
    if (btnCreate) btnCreate.querySelector("span").textContent = t("empty.create");
    var shopTitle = document.getElementById("shopTitle");
    if (shopTitle) shopTitle.textContent = t("shop.title");
    var btnClear = document.getElementById("btnShopClear");
    if (btnClear) btnClear.querySelector("span").textContent = t("shop.clear");
    var btnPrint = document.getElementById("btnShopPrint");
    if (btnPrint) btnPrint.querySelector("span").textContent = t("shop.print");

    // Translate filter buttons
    var filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(function(btn) {
        var cat = btn.dataset.category;
        if (cat === "tutte") {
            btn.textContent = t("cat.all");
        } else {
            var emoji = { "antipasti": "🥗", "primi": "🍝", "secondi": "🥩", "contorni": "🥦", "dolci": "🍰", "pane-e-lievitati": "🍞", "salse-e-condimenti": "🫙", "bevande": "🥤", "conserve": "🏺", "base": "📋" };
            btn.textContent = (emoji[cat] || "") + " " + getCategoryName(cat);
        }
    });
}

async function caricaEMostraRicette() {
    var grid = document.getElementById("recipesGrid");
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> ' + t("app.loading") + '</div>';
    try {
        tutteLeRicette = await caricaRicette();
        mostraRicette();
    } catch (error) {
        console.error("Error loading recipes:", error);
        grid.innerHTML = '<div class="loading">' + t("view.errorLoading") + '</div>';
    }
}

function mostraRicette() {
    var grid = document.getElementById("recipesGrid");
    var empty = document.getElementById("emptyState");
    var ricetteFiltrate = tutteLeRicette;

    if (categoriaAttiva !== "tutte") {
        ricetteFiltrate = ricetteFiltrate.filter(function(r) { return r.categoria === categoriaAttiva; });
    }

    if (ricercaAttiva.trim() !== "") {
        var query = ricercaAttiva.toLowerCase();
        ricetteFiltrate = ricetteFiltrate.filter(function(r) {
            if (r.titolo && r.titolo.toLowerCase().indexOf(query) >= 0) return true;
            if (r.ingredienti) {
                var ingFlat = normalizzaIngredienti(r.ingredienti);
                for (var j = 0; j < ingFlat.length; j++) {
                    if (ingFlat[j].nome && ingFlat[j].nome.toLowerCase().indexOf(query) >= 0) return true;
                }
            }
            if (r.note && r.note.toLowerCase().indexOf(query) >= 0) return true;
            return false;
        });
    }

    if (ricetteFiltrate.length === 0) {
        grid.innerHTML = "";
        grid.style.display = "none";
        empty.style.display = "block";
    } else {
        grid.style.display = "grid";
        empty.style.display = "none";
        grid.innerHTML = ricetteFiltrate.map(function(r) { return creaCard(r); }).join("");
    }
}

function creaCard(ricetta) {
    var stelle = generaStelle(ricetta.valutazione || 0);
    var difficolta = generaDifficolta(ricetta.difficolta || 1);
    var tempoTotale = (ricetta.tempoPreparazione || 0) + (ricetta.tempoCottura || 0);
    var categoriaNome = formattaCategoria(ricetta.categoria);
    var loggato = isLoggato();

    var titoloEscaped = escapeHtml(ricetta.titolo || t("card.noTitle"));

    var imgHtml = ricetta.foto
        ? '<img src="' + ricetta.foto + '" alt="' + titoloEscaped + '" loading="lazy">'
        : '<div class="placeholder-icon"><i class="fas fa-utensils"></i></div>';

    var actionsHtml = "";
    if (loggato) {
        actionsHtml = '<div class="recipe-card-actions">' +
            '<button onclick="event.stopPropagation(); modificaRicetta(\'' + ricetta.id + '\')" title="' + t("view.edit") + '" aria-label="' + t("view.edit") + '"><i class="fas fa-pen"></i></button>' +
            '<button onclick="event.stopPropagation(); confermaElimina(\'' + ricetta.id + '\')" title="' + t("app.delete") + '" aria-label="' + t("app.delete") + '"><i class="fas fa-trash"></i></button>' +
            '</div>';
    }

    return '<div class="recipe-card" onclick="apriRicetta(\'' + ricetta.id + '\')">' +
        actionsHtml +
        '<div class="recipe-card-img">' + imgHtml + '</div>' +
        '<div class="recipe-card-body">' +
        '<div class="recipe-card-category">' + escapeHtml(categoriaNome) + '</div>' +
        '<div class="recipe-card-title">' + titoloEscaped + '</div>' +
        '<div class="recipe-card-meta">' +
        (tempoTotale > 0 ? '<span><i class="far fa-clock"></i> ' + tempoTotale + ' min</span>' : '') +
        '<span>' + difficolta + '</span>' +
        '<span><i class="fas fa-users"></i> ' + (ricetta.porzioniOriginali || "-") + '</span>' +
        '</div>' +
        '<div class="recipe-card-stars">' + stelle + '</div>' +
        '</div></div>';
}

function inizializzaFiltri() {
    document.querySelectorAll(".filter-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
            btn.classList.add("active");
            categoriaAttiva = btn.dataset.category;
            mostraRicette();
        });
    });
}

function inizializzaRicerca() {
    var input = document.getElementById("searchInput");
    var timeout;
    input.addEventListener("input", function() {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            ricercaAttiva = input.value;
            mostraRicette();
        }, 300);
    });
}

function apriRicetta(id) { window.location.href = "view.html?id=" + id; }
function modificaRicetta(id) { window.location.href = "editor.html?id=" + id; }

function confermaElimina(id) {
    var titolo = "";
    for (var i = 0; i < tutteLeRicette.length; i++) {
        if (tutteLeRicette[i].id === id) {
            titolo = tutteLeRicette[i].titolo || "";
            break;
        }
    }

    var overlay = document.createElement("div");
    overlay.className = "modal-overlay active";

    var modal = document.createElement("div");
    modal.className = "modal";

    var h3 = document.createElement("h3");
    h3.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:#e53e3e;"></i> ' + t("modal.delete.title");

    var p = document.createElement("p");
    p.textContent = t("modal.delete.confirm", { title: titolo });

    var actions = document.createElement("div");
    actions.className = "modal-actions";

    var btnAnnulla = document.createElement("button");
    btnAnnulla.className = "btn-secondary";
    btnAnnulla.textContent = t("app.cancel");
    btnAnnulla.addEventListener("click", chiudiModal);

    var btnElimina = document.createElement("button");
    btnElimina.className = "btn-danger";
    btnElimina.innerHTML = '<i class="fas fa-trash"></i> ' + t("app.delete");
    btnElimina.addEventListener("click", function() { eseguiElimina(id); });

    actions.appendChild(btnAnnulla);
    actions.appendChild(btnElimina);
    modal.appendChild(h3);
    modal.appendChild(p);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function chiudiModal() {
    var modal = document.querySelector(".modal-overlay");
    if (modal) modal.remove();
}

async function eseguiElimina(id) {
    try {
        await eliminaRicetta(id);
        chiudiModal();
        tutteLeRicette = tutteLeRicette.filter(function(r) { return r.id !== id; });
        mostraRicette();
        mostraToast(t("toast.deleted"), "success");
    } catch (error) {
        console.error("Error deleting:", error);
        mostraToast(t("toast.deleteError"), "error");
    }
}