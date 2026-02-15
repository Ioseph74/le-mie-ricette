var tutteLeRicette = [];
var categoriaAttiva = "tutte";
var ricercaAttiva = "";
var userFilterAttivo = "all"; // "all", "mine", "favorites", "following"
var activeTagFilters = [];
var advancedSearchOpen = false;

// Tag definitions (must match editor.js)
var TAG_GROUPS = {
    diet: ["vegetarian", "vegan", "keto", "low-carb", "paleo", "mediterranean", "low-fat", "high-protein", "whole30"],
    allergen: ["gluten-free", "lactose-free", "dairy-free", "nut-free", "egg-free", "soy-free", "sugar-free", "shellfish-free"],
    style: ["quick", "no-cook", "kid-friendly", "light", "comfort-food", "meal-prep", "one-pot", "budget", "gourmet"]
};

document.addEventListener("DOMContentLoaded", function() {
    applyTranslationsIndex();
    initAuth(function(user) {
        renderUserFilter();
        caricaEMostraRicette();
    });
    inizializzaFiltri();
    inizializzaRicerca();
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

    // Filter private recipes: show only own private recipes, hide others'
    ricetteFiltrate = ricetteFiltrate.filter(function(r) {
        if (r.pubblica === false) {
            return auth.currentUser && r.autore === auth.currentUser.uid;
        }
        return true;
    });

    // Apply user filter
    if (userFilterAttivo === "mine" && auth.currentUser) {
        ricetteFiltrate = ricetteFiltrate.filter(function(r) { return r.autore === auth.currentUser.uid; });
    } else if (userFilterAttivo === "favorites" && auth.currentUser) {
        ricetteFiltrate = ricetteFiltrate.filter(function(r) { return favoriteIds.has(r.id); });
    } else if (userFilterAttivo === "following" && auth.currentUser) {
        ricetteFiltrate = ricetteFiltrate.filter(function(r) { return followingIds.has(r.autore); });
    }

    // Apply tag filters
    if (activeTagFilters.length > 0) {
        ricetteFiltrate = ricetteFiltrate.filter(function(r) {
            if (!r.tags || r.tags.length === 0) return false;
            for (var i = 0; i < activeTagFilters.length; i++) {
                if (r.tags.indexOf(activeTagFilters[i]) === -1) return false;
            }
            return true;
        });
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
    var isOwner = auth.currentUser && ricetta.autore === auth.currentUser.uid;

    var titoloEscaped = escapeHtml(ricetta.titolo || t("card.noTitle"));

    var imgHtml = ricetta.foto
        ? '<img src="' + ricetta.foto + '" alt="' + titoloEscaped + '" loading="lazy">'
        : '<div class="placeholder-icon"><i class="fas fa-utensils"></i></div>';

    var actionsHtml = "";
    if (isOwner) {
        actionsHtml = '<div class="recipe-card-actions">' +
            '<button onclick="event.stopPropagation(); modificaRicetta(\'' + ricetta.id + '\')" title="' + t("view.edit") + '" aria-label="' + t("view.edit") + '"><i class="fas fa-pen"></i></button>' +
            '<button onclick="event.stopPropagation(); confermaElimina(\'' + ricetta.id + '\')" title="' + t("app.delete") + '" aria-label="' + t("app.delete") + '"><i class="fas fa-trash"></i></button>' +
            '</div>';
    }

    var authorHtml = "";
    if (ricetta.autoreNome && !isOwner) {
        authorHtml = '<div class="recipe-card-author"><i class="fas fa-user"></i> ' + escapeHtml(ricetta.autoreNome) + '</div>';
    }

    return '<div class="recipe-card" onclick="apriRicetta(\'' + ricetta.id + '\')">' +
        actionsHtml +
        '<div class="recipe-card-img">' + imgHtml + '</div>' +
        '<div class="recipe-card-body">' +
        '<div class="recipe-card-category">' + escapeHtml(categoriaNome) + '</div>' +
        authorHtml +
        '<div class="recipe-card-title">' + titoloEscaped + '</div>' +
        '<div class="recipe-card-meta">' +
        (tempoTotale > 0 ? '<span><i class="far fa-clock"></i> ' + tempoTotale + ' min</span>' : '') +
        '<span>' + difficolta + '</span>' +
        '<span><i class="fas fa-users"></i> ' + (ricetta.porzioniOriginali || "-") + '</span>' +
        '</div>' +
        '<div class="recipe-card-stars">' + stelle + '</div>' +
        renderCardTags(ricetta.tags) +
        '</div></div>';
}

function renderCardTags(tags) {
    if (!tags || tags.length === 0) return "";
    var html = '<div class="recipe-card-tags">';
    var max = Math.min(tags.length, 4);
    for (var i = 0; i < max; i++) {
        var label = t("tag.diet." + tags[i]) || t("tag.allergen." + tags[i]) || t("tag.style." + tags[i]) || tags[i];
        html += '<span class="tag-mini">' + escapeHtml(label) + '</span>';
    }
    if (tags.length > 4) html += '<span class="tag-mini">+' + (tags.length - 4) + '</span>';
    html += '</div>';
    return html;
}

// ========================================
// ADVANCED SEARCH
// ========================================

function toggleAdvancedSearch() {
    advancedSearchOpen = !advancedSearchOpen;
    var panel = document.getElementById("advancedSearchPanel");
    if (panel) panel.classList.toggle("open", advancedSearchOpen);
    var btn = document.getElementById("btnAdvancedSearch");
    if (btn) btn.classList.toggle("has-filters", activeTagFilters.length > 0);
    if (advancedSearchOpen) renderAdvancedSearchTags();
}

function renderAdvancedSearchTags() {
    var container = document.getElementById("advSearchTags");
    if (!container) return;
    var html = '';
    var groups = [
        { key: "diet", label: "🥗 " + t("tags.diet"), tags: TAG_GROUPS.diet, prefix: "tag.diet." },
        { key: "allergen", label: "⚠️ " + t("tags.allergen"), tags: TAG_GROUPS.allergen, prefix: "tag.allergen." },
        { key: "style", label: "🍽️ " + t("tags.style"), tags: TAG_GROUPS.style, prefix: "tag.style." }
    ];
    for (var g = 0; g < groups.length; g++) {
        var group = groups[g];
        html += '<div class="tags-group"><div class="tags-group-title">' + group.label + '</div><div class="tags-container">';
        for (var i = 0; i < group.tags.length; i++) {
            var tag = group.tags[i];
            var active = activeTagFilters.indexOf(tag) !== -1;
            var label = t(group.prefix + tag) || tag;
            html += '<button type="button" class="tag-chip' + (active ? ' active' : '') + '" onclick="toggleSearchTag(\'' + tag + '\')">' + label + '</button>';
        }
        html += '</div></div>';
    }
    container.innerHTML = html;
}

function toggleSearchTag(tag) {
    var idx = activeTagFilters.indexOf(tag);
    if (idx !== -1) {
        activeTagFilters.splice(idx, 1);
    } else {
        activeTagFilters.push(tag);
    }
    renderAdvancedSearchTags();
    var btn = document.getElementById("btnAdvancedSearch");
    if (btn) btn.classList.toggle("has-filters", activeTagFilters.length > 0);
    mostraRicette();
}

function clearTagFilters() {
    activeTagFilters = [];
    renderAdvancedSearchTags();
    var btn = document.getElementById("btnAdvancedSearch");
    if (btn) btn.classList.remove("has-filters");
    mostraRicette();
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

// ========================================
// USER FILTER
// ========================================

var favoriteIds = new Set();
var followingIds = new Set();

function renderUserFilter() {
    var container = document.getElementById("userFilterContainer");
    if (!container) return;
    if (!auth.currentUser) {
        container.innerHTML = "";
        return;
    }
    container.innerHTML =
        '<div class="user-filter">' +
        '<button class="user-filter-btn' + (userFilterAttivo === "all" ? ' active' : '') + '" onclick="setUserFilter(\'all\')">' + t("filter.all") + '</button>' +
        '<button class="user-filter-btn' + (userFilterAttivo === "mine" ? ' active' : '') + '" onclick="setUserFilter(\'mine\')"><i class="fas fa-user"></i> ' + t("filter.mine") + '</button>' +
        '<button class="user-filter-btn' + (userFilterAttivo === "favorites" ? ' active' : '') + '" onclick="setUserFilter(\'favorites\')"><i class="fas fa-heart"></i> ' + t("filter.favorites") + '</button>' +
        '<button class="user-filter-btn' + (userFilterAttivo === "following" ? ' active' : '') + '" onclick="setUserFilter(\'following\')"><i class="fas fa-users"></i> ' + t("filter.following") + '</button>' +
        '<a href="settings.html" class="user-filter-btn" title="' + t("settings.title") + '"><i class="fas fa-cog"></i></a>' +
        '</div>';
}

async function setUserFilter(filter) {
    userFilterAttivo = filter;
    renderUserFilter();
    if (filter === "favorites") {
        await loadFavoriteIds();
    } else if (filter === "following") {
        await loadFollowingIds();
    }
    mostraRicette();
}

async function loadFavoriteIds() {
    favoriteIds = new Set();
    if (!auth.currentUser) return;
    try {
        var snapshot = await db.collection("preferiti").where("userId", "==", auth.currentUser.uid).get();
        snapshot.forEach(function(doc) {
            favoriteIds.add(doc.data().ricettaId);
        });
    } catch (e) { console.error("Load favorites error:", e); }
}

async function loadFollowingIds() {
    followingIds = new Set();
    if (!auth.currentUser) return;
    try {
        var snapshot = await db.collection("seguiti").where("userId", "==", auth.currentUser.uid).get();
        snapshot.forEach(function(doc) {
            followingIds.add(doc.data().followedId);
        });
    } catch (e) { console.error("Load following error:", e); }
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