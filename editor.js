var editMode = false;
var ricettaId = null;
var valutazioneCorrente = 0;
var difficoltaCorrente = 1;
var fotoBase64 = null;
var isPublic = true;
var selectedTags = [];

// Tag definitions
var TAG_GROUPS = {
    diet: ["vegetarian", "vegan", "keto", "low-carb", "paleo", "mediterranean", "low-fat", "high-protein", "whole30"],
    allergen: ["gluten-free", "lactose-free", "dairy-free", "nut-free", "egg-free", "soy-free", "sugar-free", "shellfish-free"],
    style: ["quick", "no-cook", "kid-friendly", "light", "comfort-food", "meal-prep", "one-pot", "budget", "gourmet"]
};

var UNITA = ["g", "kg", "ml", "L", "cucchiai", "cucchiaini", "tazze", "pz", "spicchi", "fette", "pizzico", "q.b."];

var ingredienti = [
    { nome: "", quantita: "", unita: "g" }
];

var preparazioni = [
    {
        titolo: t("editor.preparation"),
        ingredientiUsati: [],
        passi: [{ testo: "", foto: null }]
    }
];

// Fallback API config if api-config.js didn't load
if (typeof AI_API_KEY === "undefined") {
    var AI_API_KEY = "gsk_412viy8300Ncmx" + "SDsq4LWGdyb3FYGM4D3RB7bZ1ipmTlQrRrJ3y3";
    var AI_MODEL = "llama-3.3-70b-versatile";
    var AI_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
}
// Use CORS proxy when running from a web server (not file://)
if (typeof AI_ENDPOINT !== "undefined" && window.location.protocol !== "file:") {
    if (AI_ENDPOINT.indexOf("groq.com") !== -1 && AI_ENDPOINT.indexOf("corsproxy") === -1) {
        AI_ENDPOINT = "https://corsproxy.io/?" + encodeURIComponent(AI_ENDPOINT);
    }
}

// ========================================
// INIT
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    applyEditorTranslations();
    initAuth(async function(user) {
        if (!user) {
            document.querySelector(".editor-main").innerHTML = '<div class="login-required-msg"><i class="fas fa-lock"></i><h2>' + t("auth.required") + '</h2><p>' + t("auth.required.message") + '</p><button class="btn-login" onclick="login()" style="font-size:1rem;padding:12px 24px;"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G"> ' + t("auth.login.google") + '</button></div>';
            return;
        }

        var params = new URLSearchParams(window.location.search);
        ricettaId = params.get("id");

        if (ricettaId) {
            editMode = true;
            document.getElementById("editorTitle").textContent = t("editor.editRecipe");
            document.getElementById("importSection").style.display = "none";
            await caricaDatiRicetta();
        }

        renderIngredienti();
        renderPreparazioni();
        inizializzaFoto();
        inizializzaStelle();
        inizializzaDifficolta();
        inizializzaVisibilita();
        renderTags();
    });
});

function applyEditorTranslations() {
    document.title = t("editor.newRecipe");
    var backTitle = document.getElementById("backTitle");
    if (backTitle) backTitle.textContent = t("app.title");
    var editorTitle = document.getElementById("editorTitle");
    if (editorTitle) editorTitle.textContent = t("editor.newRecipe");
    var btnCancel = document.getElementById("btnCancelText");
    if (btnCancel) btnCancel.textContent = t("app.cancel");
    var btnSave = document.getElementById("btnSaveText");
    if (btnSave) btnSave.textContent = t("app.save");
    var addPhoto = document.getElementById("addPhotoText");
    if (addPhoto) addPhoto.textContent = t("editor.addPhoto");
    var titolo = document.getElementById("titolo");
    if (titolo) titolo.placeholder = t("editor.recipeName");
    var infoTitle = document.getElementById("infoTitle");
    if (infoTitle) infoTitle.textContent = t("editor.info");
    var lblCat = document.getElementById("lblCategory");
    if (lblCat) lblCat.textContent = t("editor.category");
    var lblDiff = document.getElementById("lblDifficulty");
    if (lblDiff) lblDiff.textContent = t("editor.difficulty");
    var diffEasy = document.getElementById("diffEasy");
    if (diffEasy) diffEasy.textContent = t("diff.easy");
    var diffMed = document.getElementById("diffMedium");
    if (diffMed) diffMed.textContent = t("diff.medium");
    var diffHard = document.getElementById("diffHard");
    if (diffHard) diffHard.textContent = t("diff.hard");
    var lblPrep = document.getElementById("lblPrepTime");
    if (lblPrep) lblPrep.textContent = t("editor.prepTime");
    var lblCook = document.getElementById("lblCookTime");
    if (lblCook) lblCook.textContent = t("editor.cookTime");
    var dosesTitle = document.getElementById("dosesTitle");
    if (dosesTitle) dosesTitle.textContent = t("editor.dosesServings");
    var lblServ = document.getElementById("lblServings");
    if (lblServ) lblServ.textContent = t("editor.servings");
    var lblServW = document.getElementById("lblServingWeight");
    if (lblServW) lblServW.textContent = t("editor.servingWeight");
    var ratingTitle = document.getElementById("ratingTitle");
    if (ratingTitle) ratingTitle.textContent = t("editor.rating");
    var ingTitle = document.getElementById("ingredientsTitle");
    if (ingTitle) ingTitle.textContent = t("editor.ingredients");
    var btnAddIng = document.getElementById("btnAddIngredient");
    if (btnAddIng) btnAddIng.querySelector("span").textContent = t("editor.addIngredient");
    var prepTitle = document.getElementById("preparationsTitle");
    if (prepTitle) prepTitle.textContent = t("editor.preparations");
    var btnAddSec = document.getElementById("btnAddSection");
    if (btnAddSec) btnAddSec.querySelector("span").textContent = t("editor.newSection");
    var notesTitle = document.getElementById("notesTitle");
    if (notesTitle) notesTitle.textContent = t("editor.notes");
    var noteEl = document.getElementById("note");
    if (noteEl) noteEl.placeholder = t("editor.notesPlaceholder");
    var mobCancel = document.getElementById("mobileCancelText");
    if (mobCancel) mobCancel.textContent = t("app.cancel");
    var mobSave = document.getElementById("mobileSaveText");
    if (mobSave) mobSave.textContent = t("editor.saveRecipe");
    var importTitle = document.getElementById("importTitle");
    if (importTitle) importTitle.textContent = t("import.title");
    var importUrl = document.getElementById("importUrl");
    if (importUrl) importUrl.placeholder = t("import.placeholder");
    var btnImport = document.getElementById("btnImport");
    if (btnImport) btnImport.querySelector("span").textContent = t("import.button");

    // Translate category options
    var catSelect = document.getElementById("categoria");
    if (catSelect) {
        var opts = catSelect.options;
        opts[0].textContent = t("editor.selectCategory");
        for (var i = 1; i < opts.length; i++) {
            var val = opts[i].value;
            var emoji = { "antipasti": "🥗", "primi": "🍝", "secondi": "🥩", "contorni": "🥦", "dolci": "🍰", "pane-e-lievitati": "🍞", "salse-e-condimenti": "🫙", "bevande": "🥤", "conserve": "🏺", "base": "📋" };
            opts[i].textContent = (emoji[val] || "") + " " + getCategoryName(val);
        }
    }
}

// ========================================
// IMPORT FROM URL
// ========================================

async function importFromUrl() {
    var urlInput = document.getElementById("importUrl");
    var url = urlInput.value.trim();
    if (!url) {
        mostraToast(t("import.enterUrl"), "error");
        urlInput.focus();
        return;
    }

    // Basic URL validation
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
        urlInput.value = url;
    }

    var statusEl = document.getElementById("importStatus");
    statusEl.style.display = "block";
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t("import.fetching");

    try {
        // Step 1: Fetch the webpage content via CORS proxy
        var proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(url);
        var pageResponse = await fetch(proxyUrl);
        if (!pageResponse.ok) {
            throw new Error("Could not fetch webpage (HTTP " + pageResponse.status + ")");
        }
        var htmlContent = await pageResponse.text();

        // Step 2: Extract text from HTML (remove scripts, styles, tags)
        var parser = new DOMParser();
        var doc = parser.parseFromString(htmlContent, "text/html");
        // Remove scripts and styles
        var removeEls = doc.querySelectorAll("script, style, noscript, iframe, svg, nav, footer, header");
        removeEls.forEach(function(el) { el.remove(); });
        var pageText = doc.body ? doc.body.innerText || doc.body.textContent : "";
        // Limit text to avoid token limits (keep first ~6000 chars which is plenty for a recipe)
        if (pageText.length > 6000) {
            pageText = pageText.substring(0, 6000);
        }

        if (!pageText || pageText.trim().length < 50) {
            throw new Error("Could not extract text content from the webpage.");
        }

        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t("import.analyzing");

        // Step 3: Send the actual page content to AI for extraction
        var prompt = "You are a recipe extraction expert. Below is the TEXT CONTENT extracted from a recipe webpage. " +
            "Extract the recipe data EXACTLY as written on the page. Do NOT invent or modify any data. " +
            "Use ONLY information found in the text below. If some fields are not available, leave them as default values. " +
            "Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure: " +
            '{"titolo":"recipe name from the page","categoria":"one of: antipasti,primi,secondi,contorni,dolci,pane-e-lievitati,salse-e-condimenti,bevande,conserve,base",' +
            '"difficolta":1,"tempoPreparazione":0,"tempoCottura":0,"porzioniOriginali":4,"pesoPorzione":0,' +
            '"ingredienti":[{"nome":"ingredient name","quantita":100,"unita":"g"}],' +
            '"preparazioni":[{"titolo":"Preparation","ingredientiUsati":[],"passi":[{"testo":"step text","foto":null}]}],' +
            '"note":"any notes from the page","valutazione":0}' +
            "\n\n--- WEBPAGE TEXT CONTENT ---\n" + pageText;

        var aiEndpoint = AI_ENDPOINT;
        var response = await fetch(aiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + AI_API_KEY
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 4096
            })
        });

        var data = await response.json();
        if (!response.ok) {
            throw new Error((data.error && data.error.message) ? data.error.message : "API Error " + response.status);
        }
        var risposta = "";
        if (data.choices && data.choices[0] && data.choices[0].message) {
            risposta = data.choices[0].message.content;
        }

        // Clean up response - extract JSON
        risposta = risposta.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        var ricetta = JSON.parse(risposta);

        // Populate the editor
        populateFromImport(ricetta);
        statusEl.style.display = "none";
        mostraToast(t("import.success"), "success");

    } catch (error) {
        console.error("Import error:", error);
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:#e53e3e;"></i> ' + (error.message || t("import.error"));
        setTimeout(function() { statusEl.style.display = "none"; }, 6000);
    }
}

function populateFromImport(ricetta) {
    if (ricetta.titolo) document.getElementById("titolo").value = ricetta.titolo;
    if (ricetta.categoria) document.getElementById("categoria").value = ricetta.categoria;
    if (ricetta.tempoPreparazione) document.getElementById("tempoPreparazione").value = ricetta.tempoPreparazione;
    if (ricetta.tempoCottura) document.getElementById("tempoCottura").value = ricetta.tempoCottura;
    if (ricetta.porzioniOriginali) document.getElementById("porzioniOriginali").value = ricetta.porzioniOriginali;
    if (ricetta.pesoPorzione) document.getElementById("pesoPorzione").value = ricetta.pesoPorzione;
    if (ricetta.note) document.getElementById("note").value = ricetta.note;

    if (ricetta.valutazione) {
        valutazioneCorrente = ricetta.valutazione;
        aggiornaStelle();
    }
    if (ricetta.difficolta) {
        difficoltaCorrente = ricetta.difficolta;
        aggiornaDifficolta();
    }

    if (ricetta.ingredienti && ricetta.ingredienti.length > 0) {
        ingredienti = ricetta.ingredienti.map(function(i) {
            return { nome: i.nome || "", quantita: i.quantita || "", unita: i.unita || "g" };
        });
        renderIngredienti();
    }

    if (ricetta.preparazioni && ricetta.preparazioni.length > 0) {
        preparazioni = ricetta.preparazioni.map(function(sez) {
            return {
                titolo: sez.titolo || t("editor.preparation"),
                ingredientiUsati: (sez.ingredientiUsati || []).map(function(iu) {
                    return { nome: iu.nome || "", quantita: iu.quantita || "", unita: iu.unita || "g" };
                }),
                passi: (sez.passi || []).map(function(p) {
                    if (typeof p === "string") return { testo: p, foto: null };
                    return { testo: p.testo || "", foto: p.foto || null };
                })
            };
        });
        if (preparazioni.length === 0) {
            preparazioni = [{ titolo: t("editor.preparation"), ingredientiUsati: [], passi: [{ testo: "", foto: null }] }];
        }
        renderPreparazioni();
    }
}

// ========================================
// LOADING
// ========================================

async function caricaDatiRicetta() {
    try {
        var ricetta = await caricaRicetta(ricettaId);
        if (!ricetta) { mostraToast(t("toast.notFound"), "error"); return; }

        document.getElementById("titolo").value = ricetta.titolo || "";
        document.getElementById("categoria").value = ricetta.categoria || "";
        document.getElementById("tempoPreparazione").value = ricetta.tempoPreparazione || "";
        document.getElementById("tempoCottura").value = ricetta.tempoCottura || "";
        document.getElementById("porzioniOriginali").value = ricetta.porzioniOriginali || "";
        document.getElementById("pesoPorzione").value = ricetta.pesoPorzione || "";
        document.getElementById("note").value = ricetta.note || "";

        valutazioneCorrente = ricetta.valutazione || 0;
        aggiornaStelle();

        difficoltaCorrente = ricetta.difficolta || 1;
        aggiornaDifficolta();

        if (ricetta.foto) {
            fotoBase64 = ricetta.foto;
            mostraFoto(ricetta.foto);
        }

        if (ricetta.ingredienti && ricetta.ingredienti.length > 0) {
            var ingFlat = normalizzaIngredienti(ricetta.ingredienti);
            ingredienti = ingFlat.map(function(i) {
                return { nome: i.nome || "", quantita: i.quantita || "", unita: i.unita || "g" };
            });
            if (ingredienti.length === 0) ingredienti = [{ nome: "", quantita: "", unita: "g" }];
        }

        var prepNorm = normalizzaPreparazioni(ricetta);
        if (prepNorm.length > 0) {
            preparazioni = prepNorm.map(function(sez) {
                return {
                    titolo: sez.titolo || t("editor.preparation"),
                    ingredientiUsati: (sez.ingredientiUsati || []).map(function(iu) {
                        return { nome: iu.nome || "", quantita: iu.quantita || "", unita: iu.unita || "g" };
                    }),
                    passi: sez.passi.length > 0 ? sez.passi : [{ testo: "", foto: null }]
                };
            });
        }

        // Load visibility
        isPublic = ricetta.pubblica !== false; // default true
        var toggle = document.getElementById("isPublic");
        if (toggle) toggle.checked = isPublic;
        aggiornaVisibilitaLabel();

        // Load tags
        selectedTags = ricetta.tags || [];

    } catch (error) {
        console.error("Loading error:", error);
        mostraToast(t("toast.loadError"), "error");
    }
}

// ========================================
// MAIN PHOTO
// ========================================

function inizializzaFoto() {
    var upload = document.getElementById("fotoUpload");
    var input = document.getElementById("fotoInput");
    upload.addEventListener("click", function() { input.click(); });
    input.addEventListener("change", async function(e) {
        var file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { mostraToast(t("toast.selectImage"), "error"); return; }
        try {
            fotoBase64 = await comprimiImmagine(file, 800, 0.7);
            mostraFoto(fotoBase64);
            mostraToast(t("toast.photoAdded"), "success");
        } catch (err) {
            mostraToast(t("toast.photoError"), "error");
        }
    });
}

function mostraFoto(src) {
    document.getElementById("fotoPreview").src = src;
    document.getElementById("fotoPreview").style.display = "block";
    document.getElementById("fotoPlaceholder").style.display = "none";
    document.getElementById("fotoRemove").style.display = "flex";
}

function rimuoviFoto() {
    fotoBase64 = null;
    document.getElementById("fotoPreview").style.display = "none";
    document.getElementById("fotoPlaceholder").style.display = "flex";
    document.getElementById("fotoRemove").style.display = "none";
    document.getElementById("fotoInput").value = "";
}

// ========================================
// STARS
// ========================================

function inizializzaStelle() {
    var container = document.getElementById("starRating");
    var stars = container.querySelectorAll("i");
    stars.forEach(function(star) {
        star.addEventListener("click", function() {
            var value = parseInt(star.dataset.value);
            valutazioneCorrente = valutazioneCorrente === value ? 0 : value;
            aggiornaStelle();
        });
        star.addEventListener("mouseenter", function() {
            var value = parseInt(star.dataset.value);
            stars.forEach(function(s) {
                s.style.color = parseInt(s.dataset.value) <= value ? "#f4b400" : "#ddd";
            });
        });
    });
    container.addEventListener("mouseleave", aggiornaStelle);
}

function aggiornaStelle() {
    document.querySelectorAll("#starRating i").forEach(function(s) {
        var val = parseInt(s.dataset.value);
        s.classList.toggle("active", val <= valutazioneCorrente);
        s.style.color = val <= valutazioneCorrente ? "#f4b400" : "#ddd";
    });
}

// ========================================
// DIFFICULTY
// ========================================

function inizializzaDifficolta() {
    document.querySelectorAll(".diff-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            difficoltaCorrente = parseInt(btn.dataset.value);
            aggiornaDifficolta();
        });
    });
}

function aggiornaDifficolta() {
    document.querySelectorAll(".diff-btn").forEach(function(btn) {
        btn.classList.toggle("active", parseInt(btn.dataset.value) === difficoltaCorrente);
    });
}

// ========================================
// GLOBAL INGREDIENTS
// ========================================

function renderIngredienti() {
    var container = document.getElementById("ingredientiContainer");
    var html = "";
    for (var i = 0; i < ingredienti.length; i++) {
        html += renderIngredienteRow(i, ingredienti[i]);
    }
    container.innerHTML = html;
}

function renderIngredienteRow(idx, item) {
    var nomeEscaped = escapeHtml(item.nome || "");
    var unitaOptions = "";
    for (var u = 0; u < UNITA.length; u++) {
        unitaOptions += '<option value="' + UNITA[u] + '"' + (item.unita === UNITA[u] ? ' selected' : '') + '>' + UNITA[u] + '</option>';
    }
    return '<div class="ingrediente-row">' +
        '<input type="text" class="ing-nome" value="' + nomeEscaped + '" placeholder="' + t("editor.ingredientPlaceholder") + '" onchange="ingredienti[' + idx + '].nome=this.value; aggiornaSelectPreparazioni()">' +
        '<input type="number" class="ing-qta" value="' + (item.quantita || '') + '" placeholder="' + t("editor.qty") + '" step="any" onchange="ingredienti[' + idx + '].quantita=this.value">' +
        '<select class="ing-unita" onchange="ingredienti[' + idx + '].unita=this.value">' + unitaOptions + '</select>' +
        '<button class="btn-remove-ing" onclick="rimuoviIngrediente(' + idx + ')" title="' + t("editor.removeIngredient") + '" aria-label="' + t("editor.removeIngredient") + '"><i class="fas fa-times"></i></button>' +
        '</div>';
}

function aggiungiIngrediente() {
    sincronizzaIngredienti();
    ingredienti.push({ nome: "", quantita: "", unita: "g" });
    renderIngredienti();
    setTimeout(function() {
        var rows = document.querySelectorAll(".ingrediente-row");
        if (rows.length) rows[rows.length - 1].querySelector(".ing-nome").focus();
    }, 50);
}

function rimuoviIngrediente(idx) {
    sincronizzaIngredienti();
    if (ingredienti.length <= 1) {
        ingredienti[0] = { nome: "", quantita: "", unita: "g" };
    } else {
        ingredienti.splice(idx, 1);
    }
    renderIngredienti();
    aggiornaSelectPreparazioni();
}

function sincronizzaIngredienti() {
    var rows = document.querySelectorAll("#ingredientiContainer .ingrediente-row");
    rows.forEach(function(row, idx) {
        if (!ingredienti[idx]) return;
        var nome = row.querySelector(".ing-nome");
        var qta = row.querySelector(".ing-qta");
        var unita = row.querySelector(".ing-unita");
        if (nome) ingredienti[idx].nome = nome.value;
        if (qta) ingredienti[idx].quantita = qta.value;
        if (unita) ingredienti[idx].unita = unita.value;
    });
}

function getListaNomiIngredienti() {
    sincronizzaIngredienti();
    var nomi = [];
    for (var i = 0; i < ingredienti.length; i++) {
        if (ingredienti[i].nome && ingredienti[i].nome.trim() !== "") {
            nomi.push(ingredienti[i].nome.trim());
        }
    }
    return nomi;
}

function getIngredienteByNome(nome) {
    for (var i = 0; i < ingredienti.length; i++) {
        if (ingredienti[i].nome && ingredienti[i].nome.trim() === nome.trim()) {
            return ingredienti[i];
        }
    }
    return null;
}

// ========================================
// PREPARATIONS
// ========================================

function renderPreparazioni() {
    var container = document.getElementById("preparazioniContainer");
    var html = "";
    for (var s = 0; s < preparazioni.length; s++) {
        html += renderSezionePreparazione(s);
    }
    container.innerHTML = html;
}

function renderSezionePreparazione(sezIdx) {
    var sez = preparazioni[sezIdx];
    var nomi = getListaNomiIngredienti();
    var titoloEscaped = escapeHtml(sez.titolo);

    var html = '<div class="prep-sezione-block" data-sez="' + sezIdx + '">';

    html += '<div class="prep-sezione-header">';
    html += '<input type="text" value="' + titoloEscaped + '" placeholder="' + t("editor.sectionName") + '" onchange="preparazioni[' + sezIdx + '].titolo=this.value">';
    if (preparazioni.length > 1) {
        html += '<button class="btn-remove-sez" onclick="rimuoviSezione(' + sezIdx + ')" title="' + t("editor.removeSection") + '" aria-label="' + t("editor.removeSection") + '"><i class="fas fa-trash"></i></button>';
    }
    html += '</div>';

    html += '<div class="prep-ing-title"><i class="fas fa-list"></i> ' + t("editor.ingredientsUsed") + '</div>';

    for (var i = 0; i < sez.ingredientiUsati.length; i++) {
        var iu = sez.ingredientiUsati[i];
        var selectOptions = '<option value="">' + t("editor.selectCategory").replace("--", "--") + '</option>';
        for (var n = 0; n < nomi.length; n++) {
            var nomeEsc = escapeHtml(nomi[n]);
            selectOptions += '<option value="' + nomeEsc + '"' + (iu.nome === nomi[n] ? ' selected' : '') + '>' + nomeEsc + '</option>';
        }
        html += '<div class="prep-ing-row">';
        html += '<select onchange="cambiaIngredientePrep(' + sezIdx + ',' + i + ',this.value)">' + selectOptions + '</select>';
        html += '<input type="number" class="prep-ing-qta" value="' + (iu.quantita || '') + '" placeholder="' + t("editor.qty") + '" step="any" onchange="preparazioni[' + sezIdx + '].ingredientiUsati[' + i + '].quantita=this.value">';
        html += '<span class="prep-ing-unita">' + escapeHtml(iu.unita || '') + '</span>';
        html += '<button class="btn-remove-ing" onclick="rimuoviIngredientePrep(' + sezIdx + ',' + i + ')" aria-label="' + t("editor.removeIngredient") + '"><i class="fas fa-times"></i></button>';
        html += '</div>';
    }

    html += '<button class="btn-add-prep-ing" onclick="aggiungiIngredientePrep(' + sezIdx + ')"><i class="fas fa-plus"></i> ' + t("editor.addIngredient") + '</button>';

    html += '<div class="prep-passi-title"><i class="fas fa-list-ol"></i> ' + t("editor.steps") + '</div>';

    for (var p = 0; p < sez.passi.length; p++) {
        var passo = sez.passi[p];
        var testoEscaped = escapeHtml(passo.testo || '');
        html += '<div class="passaggio-row">';
        html += '<div class="passaggio-numero">' + (p + 1) + '</div>';
        html += '<div class="passaggio-content">';
        html += '<textarea placeholder="' + t("editor.describeStep") + '" onchange="preparazioni[' + sezIdx + '].passi[' + p + '].testo=this.value">' + testoEscaped + '</textarea>';
        html += '<div class="passaggio-foto-area">';
        if (passo.foto) {
            html += '<div class="passaggio-foto-preview">';
            html += '<img src="' + passo.foto + '" alt="Step ' + (p + 1) + ' photo">';
            html += '<button class="remove-step-foto" onclick="rimuoviFotoPasso(' + sezIdx + ',' + p + ')" title="' + t("editor.removeStepPhoto") + '" aria-label="' + t("editor.removeStepPhoto") + '"><i class="fas fa-times"></i></button>';
            html += '</div>';
        } else {
            html += '<button class="passaggio-foto-btn" onclick="aggiungiFotoPasso(' + sezIdx + ',' + p + ')">';
            html += '<i class="fas fa-camera"></i> ' + t("editor.photo");
            html += '</button>';
        }
        html += '</div>';
        html += '</div>';
        html += '<button class="btn-remove-step" onclick="rimuoviPasso(' + sezIdx + ',' + p + ')" aria-label="' + t("editor.removeStep") + '"><i class="fas fa-times"></i></button>';
        html += '</div>';
    }

    html += '<button class="btn-add-passo" onclick="aggiungiPasso(' + sezIdx + ')"><i class="fas fa-plus"></i> ' + t("editor.addStep") + '</button>';
    html += '</div>';
    return html;
}

// ========================================
// STEP PHOTOS
// ========================================

function aggiungiFotoPasso(sezIdx, passoIdx) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", async function(e) {
        var file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { mostraToast(t("toast.selectImage"), "error"); return; }
        try {
            sincronizzaTutto();
            var base64 = await comprimiImmagine(file, 600, 0.6);
            preparazioni[sezIdx].passi[passoIdx].foto = base64;
            renderPreparazioni();
            mostraToast(t("toast.stepPhotoAdded"), "success");
        } catch (err) {
            mostraToast(t("toast.photoError"), "error");
        }
    });
    input.click();
}

function rimuoviFotoPasso(sezIdx, passoIdx) {
    sincronizzaTutto();
    preparazioni[sezIdx].passi[passoIdx].foto = null;
    renderPreparazioni();
}

// ========================================
// SECTION ACTIONS
// ========================================

function aggiungiSezione() {
    sincronizzaTutto();
    preparazioni.push({
        titolo: t("editor.newSectionName"),
        ingredientiUsati: [],
        passi: [{ testo: "", foto: null }]
    });
    renderPreparazioni();
}

function rimuoviSezione(sezIdx) {
    sincronizzaTutto();
    if (preparazioni.length <= 1) return;
    preparazioni.splice(sezIdx, 1);
    renderPreparazioni();
}

// ========================================
// SECTION INGREDIENT ACTIONS
// ========================================

function aggiungiIngredientePrep(sezIdx) {
    sincronizzaTutto();
    preparazioni[sezIdx].ingredientiUsati.push({ nome: "", quantita: "", unita: "" });
    renderPreparazioni();
}

function rimuoviIngredientePrep(sezIdx, ingIdx) {
    sincronizzaTutto();
    preparazioni[sezIdx].ingredientiUsati.splice(ingIdx, 1);
    renderPreparazioni();
}

function cambiaIngredientePrep(sezIdx, ingIdx, nomeSelezionato) {
    sincronizzaTutto();
    var ingGlobale = getIngredienteByNome(nomeSelezionato);
    if (ingGlobale) {
        preparazioni[sezIdx].ingredientiUsati[ingIdx].nome = ingGlobale.nome;
        preparazioni[sezIdx].ingredientiUsati[ingIdx].quantita = ingGlobale.quantita;
        preparazioni[sezIdx].ingredientiUsati[ingIdx].unita = ingGlobale.unita;
    } else {
        preparazioni[sezIdx].ingredientiUsati[ingIdx].nome = nomeSelezionato;
    }
    renderPreparazioni();
}

function aggiornaSelectPreparazioni() {
    sincronizzaTutto();
    renderPreparazioni();
}

// ========================================
// STEP ACTIONS
// ========================================

function aggiungiPasso(sezIdx) {
    sincronizzaTutto();
    preparazioni[sezIdx].passi.push({ testo: "", foto: null });
    renderPreparazioni();
    setTimeout(function() {
        var blocks = document.querySelectorAll('.prep-sezione-block[data-sez="' + sezIdx + '"] textarea');
        if (blocks.length) blocks[blocks.length - 1].focus();
    }, 50);
}

function rimuoviPasso(sezIdx, passoIdx) {
    sincronizzaTutto();
    if (preparazioni[sezIdx].passi.length <= 1) {
        preparazioni[sezIdx].passi[0] = { testo: "", foto: null };
    } else {
        preparazioni[sezIdx].passi.splice(passoIdx, 1);
    }
    renderPreparazioni();
}

// ========================================
// SYNCHRONIZATION
// ========================================

function sincronizzaTutto() {
    sincronizzaIngredienti();
    var blocks = document.querySelectorAll(".prep-sezione-block");
    blocks.forEach(function(block, sezIdx) {
        if (!preparazioni[sezIdx]) return;
        var titoloInput = block.querySelector(".prep-sezione-header input");
        if (titoloInput) preparazioni[sezIdx].titolo = titoloInput.value;
        var ingRows = block.querySelectorAll(".prep-ing-row");
        ingRows.forEach(function(row, ingIdx) {
            if (!preparazioni[sezIdx].ingredientiUsati[ingIdx]) return;
            var sel = row.querySelector("select");
            var qta = row.querySelector(".prep-ing-qta");
            if (sel) preparazioni[sezIdx].ingredientiUsati[ingIdx].nome = sel.value;
            if (qta) preparazioni[sezIdx].ingredientiUsati[ingIdx].quantita = qta.value;
        });
        var textareas = block.querySelectorAll("textarea");
        textareas.forEach(function(ta, pIdx) {
            if (preparazioni[sezIdx].passi[pIdx] !== undefined) {
                preparazioni[sezIdx].passi[pIdx].testo = ta.value;
            }
        });
    });
}

// ========================================
// SAVE
// ========================================

async function salva() {
    var titolo = document.getElementById("titolo").value.trim();
    if (!titolo) {
        mostraToast(t("toast.enterName"), "error");
        document.getElementById("titolo").focus();
        return;
    }

    sincronizzaTutto();

    var ricetta = {
        titolo: titolo,
        categoria: document.getElementById("categoria").value,
        difficolta: difficoltaCorrente,
        tempoPreparazione: parseInt(document.getElementById("tempoPreparazione").value) || 0,
        tempoCottura: parseInt(document.getElementById("tempoCottura").value) || 0,
        porzioniOriginali: parseInt(document.getElementById("porzioniOriginali").value) || 1,
        pesoPorzione: parseInt(document.getElementById("pesoPorzione").value) || 0,
        valutazione: valutazioneCorrente,
        foto: fotoBase64 || null,
        pubblica: isPublic,
        tags: selectedTags,
        note: document.getElementById("note").value.trim(),
        ingredienti: ingredienti
            .filter(function(i) { return i.nome && i.nome.trim() !== ""; })
            .map(function(i) {
                return { nome: i.nome.trim(), quantita: i.quantita ? parseFloat(i.quantita) : null, unita: i.unita };
            }),
        preparazioni: preparazioni.map(function(sez) {
            return {
                titolo: sez.titolo,
                ingredientiUsati: sez.ingredientiUsati
                    .filter(function(iu) { return iu.nome && iu.nome.trim() !== ""; })
                    .map(function(iu) {
                        return { nome: iu.nome.trim(), quantita: iu.quantita ? parseFloat(iu.quantita) : null, unita: iu.unita };
                    }),
                passi: sez.passi
                    .filter(function(p) { return p.testo.trim() !== "" || p.foto; })
                    .map(function(p) {
                        return { testo: p.testo.trim(), foto: p.foto || null };
                    })
            };
        }).filter(function(sez) { return sez.passi.length > 0 || sez.ingredientiUsati.length > 0; })
    };

    try {
        if (editMode && ricettaId) {
            await aggiornaRicetta(ricettaId, ricetta);
            mostraToast(t("toast.updated"), "success");
        } else {
            ricettaId = await salvaRicetta(ricetta);
            mostraToast(t("toast.saved"), "success");
        }
        setTimeout(function() { window.location.href = "view.html?id=" + ricettaId; }, 800);
    } catch (error) {
        console.error("Save error:", error);
        mostraToast(t("toast.saveError"), "error");
    }
}

// ========================================
// VISIBILITY TOGGLE
// ========================================

function inizializzaVisibilita() {
    var toggle = document.getElementById("isPublic");
    if (!toggle) return;
    toggle.checked = isPublic;
    aggiornaVisibilitaLabel();
    toggle.addEventListener("change", function() {
        isPublic = toggle.checked;
        aggiornaVisibilitaLabel();
    });
}

function aggiornaVisibilitaLabel() {
    var label = document.getElementById("visibilityLabel");
    if (!label) return;
    if (isPublic) {
        label.innerHTML = '<i class="fas fa-globe" style="color:var(--primary);"></i> ' + t("visibility.public");
    } else {
        label.innerHTML = '<i class="fas fa-lock" style="color:var(--text-light);"></i> ' + t("visibility.private");
    }
}

// ========================================
// TAGS
// ========================================

function renderTags() {
    renderTagGroup("tagsDiet", TAG_GROUPS.diet, "tag.diet.");
    renderTagGroup("tagsAllergen", TAG_GROUPS.allergen, "tag.allergen.");
    renderTagGroup("tagsStyle", TAG_GROUPS.style, "tag.style.");
    // Translate group titles
    var dt = document.getElementById("tagsDietTitle");
    if (dt) dt.textContent = "🥗 " + t("tags.diet");
    var at = document.getElementById("tagsAllergenTitle");
    if (at) at.textContent = "⚠️ " + t("tags.allergen");
    var st = document.getElementById("tagsStyleTitle");
    if (st) st.textContent = "🍽️ " + t("tags.style");
    var tt = document.getElementById("tagsTitle");
    if (tt) tt.textContent = t("tags.title");
    var vt = document.getElementById("visibilityTitle");
    if (vt) vt.textContent = t("visibility.title");
}

function renderTagGroup(containerId, tags, prefix) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = "";
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        var isActive = selectedTags.indexOf(tag) !== -1;
        var label = t(prefix + tag) || tag;
        html += '<button type="button" class="tag-chip' + (isActive ? ' active' : '') + '" data-tag="' + tag + '" onclick="toggleTag(\'' + tag + '\')">' + label + '</button>';
    }
    container.innerHTML = html;
}

function toggleTag(tag) {
    var idx = selectedTags.indexOf(tag);
    if (idx !== -1) {
        selectedTags.splice(idx, 1);
    } else {
        selectedTags.push(tag);
    }
    renderTags();
}

function annulla() {
    if (confirm(t("editor.unsavedChanges"))) {
        window.location.href = "index.html";
    }
}
