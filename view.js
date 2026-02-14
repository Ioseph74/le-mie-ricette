// Fallback API config if api-config.js didn't load
if (typeof AI_API_KEY === "undefined") {
    var AI_API_KEY = "gsk_412viy8300Ncmx" + "SDsq4LWGdyb3FYGM4D3RB7bZ1ipmTlQrRrJ3y3";
    var AI_MODEL = "llama-3.3-70b-versatile";
    var AI_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
}
// Use CORS proxy when running from a web server (not file://)
if (typeof AI_ENDPOINT !== "undefined" && window.location.protocol !== "file:") {
    var _origEndpoint = AI_ENDPOINT;
    if (_origEndpoint.indexOf("groq.com") !== -1) {
        AI_ENDPOINT = "https://corsproxy.io/?" + encodeURIComponent(_origEndpoint);
    }
}

var ricettaCorrente = null;
var ingredientiOriginali = null;
var ingredientiCorretti = null;
var preparazioniOriginali = null;
var preparazioniCorrette = null;
var porzioniOriginali = 1;
var pesoOriginalePorzione = 0;
var isRicalcolato = false;
var commentRating = 0;

document.addEventListener("DOMContentLoaded", function() {
    applyViewTranslations();
    initAuth(function(user) {
        var params = new URLSearchParams(window.location.search);
        var id = params.get("id");
        if (!id) { window.location.href = "index.html"; return; }
        caricaVista(id);
        updateCommentFormVisibility(user);
    });
    var langContainer = document.getElementById("langSelectorContainer");
    if (langContainer) langContainer.innerHTML = buildLanguageSelector();
    document.getElementById("unitToggleContainer").innerHTML = buildUnitToggleHtml();
    initCommentStars();
});

function applyViewTranslations() {
    var backTitle = document.getElementById("backTitle");
    if (backTitle) backTitle.textContent = t("app.title");
    var loginText = document.getElementById("loginText");
    if (loginText) loginText.textContent = t("auth.login");
    var calcTitle = document.getElementById("calcTitle");
    if (calcTitle) calcTitle.textContent = t("view.recalcDoses");
    var calcOrig = document.getElementById("calcOrigHeader");
    if (calcOrig) calcOrig.textContent = t("view.originalRecipe");
    var calcYou = document.getElementById("calcYouWant");
    if (calcYou) calcYou.textContent = t("view.youWant");
    var calcOS = document.getElementById("calcOrigServings");
    if (calcOS) calcOS.textContent = t("view.servings");
    var calcOW = document.getElementById("calcOrigWeight");
    if (calcOW) calcOW.textContent = t("view.servingWeightLabel");
    var calcOT = document.getElementById("calcOrigTotal");
    if (calcOT) calcOT.textContent = t("view.totalWeight");
    var calcDS = document.getElementById("calcDesServings");
    if (calcDS) calcDS.textContent = t("view.servings");
    var calcDW = document.getElementById("calcDesWeight");
    if (calcDW) calcDW.textContent = t("view.servingWeight");
    var calcDT = document.getElementById("calcDesTotal");
    if (calcDT) calcDT.textContent = t("view.totalWeight");
    var btnRecalc = document.getElementById("btnRecalc");
    if (btnRecalc) btnRecalc.querySelector("span").textContent = t("view.recalculate");
    var btnReset = document.getElementById("btnReset");
    if (btnReset) btnReset.querySelector("span").textContent = t("view.resetDoses");
    var viewIng = document.getElementById("viewIngTitle");
    if (viewIng) viewIng.textContent = t("view.ingredients");
    var btnSpesa = document.getElementById("btnAddSpesa");
    if (btnSpesa) btnSpesa.querySelector("span").textContent = t("shop.addAll");
    var viewNotes = document.getElementById("viewNotesTitle");
    if (viewNotes) viewNotes.textContent = t("view.notes");
    var shopTitle = document.getElementById("shopTitle");
    if (shopTitle) shopTitle.textContent = t("shop.title");
    var btnClear = document.getElementById("btnShopClear");
    if (btnClear) btnClear.querySelector("span").textContent = t("shop.clear");
    var btnPrint = document.getElementById("btnShopPrint");
    if (btnPrint) btnPrint.querySelector("span").textContent = t("shop.print");
    var modalTitle = document.getElementById("modalDeleteTitle");
    if (modalTitle) modalTitle.textContent = t("modal.delete.title");
    var modalMsg = document.getElementById("modalDeleteMsg");
    if (modalMsg) modalMsg.textContent = t("modal.delete.confirmGeneric");
    var modalCancel = document.getElementById("modalCancelBtn");
    if (modalCancel) modalCancel.textContent = t("app.cancel");
    var modalDel = document.getElementById("modalDeleteBtn");
    if (modalDel) modalDel.querySelector("span").textContent = t("app.delete");
    var commTitle = document.getElementById("commentsTitle");
    if (commTitle) commTitle.textContent = t("comments.title");
    var commText = document.getElementById("commentText");
    if (commText) commText.placeholder = t("comments.placeholder");
    var btnSubmit = document.getElementById("btnSubmitComment");
    if (btnSubmit) btnSubmit.querySelector("span").textContent = t("comments.submit");
    var nutTitle = document.getElementById("nutritionTitle");
    if (nutTitle) nutTitle.textContent = t("nutrition.title");
    var btnNut = document.getElementById("btnCalcNutrition");
    if (btnNut) btnNut.querySelector("span").textContent = t("nutrition.calculate");
    var aiTitle = document.getElementById("aiHeaderTitle");
    if (aiTitle) aiTitle.textContent = t("ai.title");
    var aiWelcome = document.getElementById("aiWelcomeTitle");
    if (aiWelcome) aiWelcome.textContent = t("ai.title");
    var aiMsg = document.getElementById("aiWelcomeMsg");
    if (aiMsg) aiMsg.textContent = t("ai.welcome");
    var aiInput = document.getElementById("aiInput");
    if (aiInput) aiInput.placeholder = t("ai.placeholder");
}

async function caricaVista(id) {
    try {
        ricettaCorrente = await caricaRicetta(id);
        if (!ricettaCorrente) {
            document.getElementById("viewMain").innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h2>' + t("view.notFoundTitle") + '</h2><a href="index.html" class="btn-primary" style="display:inline-flex;text-decoration:none;"><i class="fas fa-home"></i> ' + t("view.backHome") + '</a></div>';
            return;
        }
        ricettaCorrente.ingredienti = normalizzaIngredienti(ricettaCorrente.ingredienti || []);
        ricettaCorrente.preparazioni = normalizzaPreparazioni(ricettaCorrente);
        ingredientiOriginali = JSON.parse(JSON.stringify(ricettaCorrente.ingredienti));
        ingredientiCorretti = JSON.parse(JSON.stringify(ingredientiOriginali));
        preparazioniOriginali = JSON.parse(JSON.stringify(ricettaCorrente.preparazioni));
        preparazioniCorrette = JSON.parse(JSON.stringify(preparazioniOriginali));
        porzioniOriginali = ricettaCorrente.porzioniOriginali || 1;
        if (ricettaCorrente.pesoPorzione && ricettaCorrente.pesoPorzione > 0) {
            pesoOriginalePorzione = ricettaCorrente.pesoPorzione;
        } else {
            pesoOriginalePorzione = calcolaPesoTotalePiatto(ingredientiOriginali, porzioniOriginali);
        }
        renderHero();
        renderCalcolo();
        renderIngredienti();
        renderPreparazioni();
        renderNote();
        loadComments(id);
        document.title = ricettaCorrente.titolo + " — " + t("app.title");
    } catch (error) {
        console.error("Loading error:", error);
        document.getElementById("viewMain").innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h2>' + t("view.loadingError") + '</h2><p>' + t("view.errorLoading") + '</p><a href="index.html" class="btn-primary" style="display:inline-flex;text-decoration:none;"><i class="fas fa-home"></i> ' + t("view.backHome") + '</a></div>';
    }
}

function calcolaPesoTotalePiatto(ingredienti, porzioni) {
    var totaleGrammi = 0;
    for (var i = 0; i < ingredienti.length; i++) {
        var item = ingredienti[i];
        if (!item.quantita) continue;
        var qta = parseFloat(item.quantita);
        if (isNaN(qta)) continue;
        switch (item.unita) {
            case "g": totaleGrammi += qta; break;
            case "kg": totaleGrammi += qta * 1000; break;
            case "ml": totaleGrammi += qta; break;
            case "L": totaleGrammi += qta * 1000; break;
        }
    }
    return porzioni > 0 ? Math.round(totaleGrammi / porzioni) : 0;
}

function applicaFattoreArray(arr, fattore) {
    return arr.map(function(item) {
        if (!item.quantita || item.unita === "q.b.") return { nome: item.nome, quantita: item.quantita, unita: item.unita };
        var nuovaQta = parseFloat(item.quantita) * fattore;
        return { nome: item.nome, quantita: formattaQtaCalc(nuovaQta), unita: item.unita };
    });
}

function applicaFattorePreparazioni(preps, fattore) {
    return preps.map(function(sez) {
        return {
            titolo: sez.titolo,
            passi: sez.passi.map(function(p) { return { testo: p.testo, foto: p.foto }; }),
            ingredientiUsati: sez.ingredientiUsati.map(function(iu) {
                if (!iu.quantita || iu.unita === "q.b.") return { nome: iu.nome, quantita: iu.quantita, unita: iu.unita };
                var nuovaQta = parseFloat(iu.quantita) * fattore;
                return { nome: iu.nome, quantita: formattaQtaCalc(nuovaQta), unita: iu.unita };
            })
        };
    });
}

function formattaQtaCalc(n) {
    if (isNaN(n)) return n;
    if (Math.abs(n - Math.round(n)) < 0.05) return Math.round(n);
    return Math.round(n * 10) / 10;
}

// ========================================
// UNIT SWITCHING
// ========================================

function switchUnits(system) {
    setUnitSystem(system);
    document.getElementById("unitToggleContainer").innerHTML = buildUnitToggleHtml();
    renderIngredienti();
    renderPreparazioni();
}

// ========================================
// RENDER HERO
// ========================================

function renderHero() {
    var r = ricettaCorrente;
    var titoloEscaped = escapeHtml(r.titolo);
    if (r.foto) {
        document.getElementById("heroImg").innerHTML = '<img src="' + r.foto + '" alt="' + titoloEscaped + '">';
    }
    document.getElementById("heroTitle").textContent = r.titolo;
    document.getElementById("heroCategory").textContent = formattaCategoria(r.categoria);
    document.getElementById("heroStars").innerHTML = generaStelle(r.valutazione || 0);
    var tempoTotale = (r.tempoPreparazione || 0) + (r.tempoCottura || 0);
    var metaTempo = document.getElementById("metaTempo");
    if (tempoTotale > 0) {
        var tempoStr = "";
        if (r.tempoPreparazione) tempoStr += r.tempoPreparazione + " " + t("view.prep");
        if (r.tempoPreparazione && r.tempoCottura) tempoStr += " + ";
        if (r.tempoCottura) tempoStr += r.tempoCottura + " " + t("view.cooking");
        metaTempo.querySelector("span").textContent = tempoStr;
    } else { metaTempo.style.display = "none"; }
    document.getElementById("metaDifficolta").querySelector("span").textContent = getDifficultyName(r.difficolta || 1);
    document.getElementById("metaPortate").querySelector("span").textContent = porzioniOriginali + " " + t("view.servingsLabel");
}

// ========================================
// CALCULATION
// ========================================

function renderCalcolo() {
    document.getElementById("porzioniOriginaliView").textContent = porzioniOriginali;
    if (pesoOriginalePorzione > 0) {
        document.getElementById("pesoOriginaleView").textContent = pesoOriginalePorzione + " g";
        document.getElementById("pesoTotaleOriginaleView").textContent = (porzioniOriginali * pesoOriginalePorzione) + " g";
    } else {
        document.getElementById("pesoOriginaleView").textContent = t("view.na");
        document.getElementById("pesoTotaleOriginaleView").textContent = t("view.na");
    }
    document.getElementById("porzioniDesiderate").value = porzioniOriginali;
    if (pesoOriginalePorzione > 0) document.getElementById("pesoDesiderato").value = pesoOriginalePorzione;
    aggiornaCalcolo();
}

function aggiornaCalcolo() {
    var porzioni = parseInt(document.getElementById("porzioniDesiderate").value) || 0;
    var peso = parseInt(document.getElementById("pesoDesiderato").value) || 0;
    var totale = porzioni * peso;
    document.getElementById("pesoTotaleNuovoView").textContent = totale > 0 ? totale + " g" : "— g";
}

function stepPorzioni(delta) {
    var input = document.getElementById("porzioniDesiderate");
    var val = parseInt(input.value) || 1;
    val = Math.max(1, val + delta);
    input.value = val;
    aggiornaCalcolo();
}

function ricalcolaCombinato() {
    var porzioniDes = parseInt(document.getElementById("porzioniDesiderate").value);
    var pesoDes = parseInt(document.getElementById("pesoDesiderato").value);
    if (!porzioniDes || porzioniDes < 1) { mostraToast(t("toast.enterServings"), "error"); return; }
    var fattore;
    if (!pesoDes || pesoDes <= 0 || pesoOriginalePorzione <= 0) {
        fattore = porzioniDes / porzioniOriginali;
        isRicalcolato = porzioniDes !== porzioniOriginali;
    } else {
        var pesoTotaleOrig = porzioniOriginali * pesoOriginalePorzione;
        var pesoTotaleDes = porzioniDes * pesoDes;
        fattore = pesoTotaleDes / pesoTotaleOrig;
        isRicalcolato = (porzioniDes !== porzioniOriginali || pesoDes !== pesoOriginalePorzione);
    }
    ingredientiCorretti = applicaFattoreArray(ingredientiOriginali, fattore);
    preparazioniCorrette = applicaFattorePreparazioni(preparazioniOriginali, fattore);
    renderIngredienti();
    renderPreparazioni();
    document.getElementById("btnReset").style.display = isRicalcolato ? "flex" : "none";
    if (isRicalcolato) mostraToast(t("toast.recalculated"), "success");
}

function resetDosi() {
    ingredientiCorretti = JSON.parse(JSON.stringify(ingredientiOriginali));
    preparazioniCorrette = JSON.parse(JSON.stringify(preparazioniOriginali));
    isRicalcolato = false;
    document.getElementById("porzioniDesiderate").value = porzioniOriginali;
    document.getElementById("pesoDesiderato").value = pesoOriginalePorzione > 0 ? pesoOriginalePorzione : "";
    aggiornaCalcolo();
    renderIngredienti();
    renderPreparazioni();
    document.getElementById("btnReset").style.display = "none";
    mostraToast(t("toast.resetDoses"), "success");
}

// ========================================
// RENDER INGREDIENTS (with unit conversion)
// ========================================

function renderIngredienti() {
    var container = document.getElementById("ingredientiView");
    var dati = ingredientiCorretti || ingredientiOriginali;
    if (!dati || dati.length === 0) { container.innerHTML = '<p style="color:#aaa;">' + t("view.noIngredients") + '</p>'; return; }
    var displayData = currentUnitSystem === "imperial" ? convertIngredientsList(dati, "imperial") : dati;
    var html = "";
    for (var i = 0; i < displayData.length; i++) {
        var item = displayData[i];
        var qtaStr = formattaQuantita(item.quantita, item.unita);
        var cls = isRicalcolato ? "ing-ricalcolato" : "";
        html += '<div class="ing-view-row ' + cls + '">';
        html += '<span class="ing-view-nome">' + escapeHtml(item.nome) + '</span>';
        html += '<span class="ing-view-qta">' + escapeHtml(qtaStr) + '</span>';
        html += '</div>';
    }
    container.innerHTML = html;
}

// ========================================
// RENDER PREPARATIONS
// ========================================

function renderPreparazioni() {
    var prepContainer = document.getElementById("preparazioneView");
    var prepFinaleContainer = document.getElementById("preparazioneFinaleView");
    var dati = preparazioniCorrette || preparazioniOriginali;
    if (!dati || dati.length === 0) {
        prepContainer.innerHTML = '<h2><i class="fas fa-list-ol"></i> ' + t("view.preparation") + '</h2><p style="color:#aaa;">' + t("view.noSteps") + '</p>';
        return;
    }
    var html = "";
    for (var s = 0; s < dati.length; s++) {
        var sez = dati[s];
        html += '<div class="prep-view-sezione">';
        html += '<h2><i class="fas fa-list-ol"></i> ' + escapeHtml(sez.titolo) + '</h2>';
        if (sez.ingredientiUsati && sez.ingredientiUsati.length > 0) {
            var displayIU = currentUnitSystem === "imperial" ? convertIngredientsList(sez.ingredientiUsati, "imperial") : sez.ingredientiUsati;
            html += '<div class="prep-view-ingredienti">';
            html += '<div class="prep-view-ing-title"><i class="fas fa-list"></i> ' + t("view.ingredients") + '</div>';
            for (var i = 0; i < displayIU.length; i++) {
                var iu = displayIU[i];
                var qtaStr = formattaQuantita(iu.quantita, iu.unita);
                var cls = isRicalcolato ? "ing-ricalcolato" : "";
                html += '<div class="ing-view-row ' + cls + '">';
                html += '<span class="ing-view-nome">' + escapeHtml(iu.nome) + '</span>';
                html += '<span class="ing-view-qta">' + escapeHtml(qtaStr) + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }
        if (sez.passi && sez.passi.length > 0) {
            for (var p = 0; p < sez.passi.length; p++) {
                var passo = sez.passi[p];
                html += '<div class="step-view">';
                html += '<div class="step-numero">' + (p + 1) + '</div>';
                html += '<div class="step-content">';
                html += '<div class="step-testo">' + escapeHtml(passo.testo) + '</div>';
                if (passo.foto) html += '<div class="step-foto"><img src="' + passo.foto + '" alt="Step ' + (p + 1) + '"></div>';
                html += '</div></div>';
            }
        }
        html += '</div>';
    }
    prepContainer.innerHTML = html;
    prepFinaleContainer.style.display = "none";
}

function renderNote() {
    if (!ricettaCorrente.note || ricettaCorrente.note.trim() === "") return;
    document.getElementById("noteView").style.display = "block";
    document.getElementById("noteText").textContent = ricettaCorrente.note;
}

// ========================================
// SHOPPING LIST
// ========================================

function aggiungiTuttiAllaSpesa() {
    var dati = ingredientiCorretti || ingredientiOriginali;
    if (!dati) return;
    var lista = [];
    for (var i = 0; i < dati.length; i++) {
        if (dati[i].nome && dati[i].nome.trim()) {
            lista.push({ nome: dati[i].nome, quantita: dati[i].quantita, unita: dati[i].unita });
        }
    }
    aggiungiAllaSpesa(lista);
    mostraToast(lista.length + t("shop.added"), "success");
    setTimeout(function() { toggleShopping(); }, 500);
}

function condividi() {
    var url = window.location.href;
    if (navigator.share) {
        navigator.share({ title: ricettaCorrente.titolo, text: t("view.shareText") + ricettaCorrente.titolo, url: url });
    } else {
        navigator.clipboard.writeText(url).then(function() { mostraToast(t("toast.linkCopied"), "success"); });
    }
}

function modificaRicetta() { window.location.href = "editor.html?id=" + ricettaCorrente.id; }
function confermaElimina() { document.getElementById("modalOverlay").classList.add("active"); }
function chiudiModal() { document.getElementById("modalOverlay").classList.remove("active"); }

async function eseguiElimina() {
    try {
        await eliminaRicetta(ricettaCorrente.id);
        mostraToast(t("toast.deleted"), "success");
        setTimeout(function() { window.location.href = "index.html"; }, 800);
    } catch (error) {
        console.error("Delete error:", error);
        mostraToast(t("toast.deleteError"), "error");
    }
}

// ========================================
// COMMENTS & RATINGS
// ========================================

function updateCommentFormVisibility(user) {
    var form = document.getElementById("commentForm");
    var loginMsg = document.getElementById("commentLoginMsg");
    if (user) {
        form.style.display = "block";
        loginMsg.style.display = "none";
    } else {
        form.style.display = "none";
        loginMsg.style.display = "flex";
        loginMsg.querySelector("span").textContent = t("comments.loginRequired");
    }
}

function initCommentStars() {
    var stars = document.querySelectorAll("#commentStars i");
    stars.forEach(function(star) {
        star.addEventListener("click", function() {
            commentRating = parseInt(star.dataset.value);
            updateCommentStars();
        });
        star.addEventListener("mouseenter", function() {
            var val = parseInt(star.dataset.value);
            stars.forEach(function(s) {
                s.style.color = parseInt(s.dataset.value) <= val ? "#f4b400" : "#ddd";
            });
        });
    });
    document.getElementById("commentStars").addEventListener("mouseleave", updateCommentStars);
}

function updateCommentStars() {
    document.querySelectorAll("#commentStars i").forEach(function(s) {
        s.style.color = parseInt(s.dataset.value) <= commentRating ? "#f4b400" : "#ddd";
    });
}

async function submitComment() {
    if (!auth.currentUser) { mostraToast(t("comments.loginRequired"), "error"); return; }
    var text = document.getElementById("commentText").value.trim();
    if (!text && commentRating === 0) { mostraToast(t("comments.rateFirst"), "error"); return; }
    try {
        var comment = {
            ricettaId: ricettaCorrente.id,
            testo: text,
            valutazione: commentRating,
            autoreUid: auth.currentUser.uid,
            autoreNome: auth.currentUser.displayName || "User",
            autoreFoto: auth.currentUser.photoURL || "",
            data: new Date().toISOString()
        };
        await db.collection("commenti").add(comment);
        document.getElementById("commentText").value = "";
        commentRating = 0;
        updateCommentStars();
        mostraToast(t("comments.added"), "success");
        loadComments(ricettaCorrente.id);
    } catch (error) {
        console.error("Comment error:", error);
        mostraToast(t("toast.saveError"), "error");
    }
}

async function loadComments(ricettaId) {
    var container = document.getElementById("commentsList");
    try {
        var snapshot = await db.collection("commenti").where("ricettaId", "==", ricettaId).get();
        if (snapshot.empty) {
            container.innerHTML = '<p class="no-comments">' + t("comments.noComments") + '</p>';
            return;
        }
        var comments = [];
        snapshot.forEach(function(doc) {
            comments.push({ id: doc.id, data: doc.data() });
        });
        // Sort client-side (newest first) to avoid needing a composite index
        comments.sort(function(a, b) {
            return (b.data.data || "").localeCompare(a.data.data || "");
        });
        var html = "";
        comments.forEach(function(item) {
            var c = item.data;
            var commentId = item.id;
            var stars = generaStelle(c.valutazione || 0);
            var date = new Date(c.data).toLocaleDateString(currentLanguage);
            var canDelete = auth.currentUser && auth.currentUser.uid === c.autoreUid;
            html += '<div class="comment-item">';
            html += '<div class="comment-header">';
            html += '<div class="comment-author">';
            if (c.autoreFoto) html += '<img src="' + c.autoreFoto + '" alt="" class="comment-avatar">';
            html += '<strong>' + escapeHtml(c.autoreNome) + '</strong>';
            html += '<span class="comment-date">' + date + '</span>';
            html += '</div>';
            if (c.valutazione) html += '<div class="comment-stars-display">' + stars + '</div>';
            if (canDelete) html += '<button class="btn-icon comment-delete" onclick="deleteComment(\'' + commentId + '\')" title="' + t("app.delete") + '"><i class="fas fa-trash"></i></button>';
            html += '</div>';
            if (c.testo) html += '<p class="comment-text">' + escapeHtml(c.testo) + '</p>';
            html += '</div>';
        });
        container.innerHTML = html;
    } catch (error) {
        console.error("Load comments error:", error);
        container.innerHTML = '<p class="no-comments">' + t("comments.noComments") + '</p>';
    }
}

async function deleteComment(commentId) {
    if (!confirm(t("comments.deleteConfirm"))) return;
    try {
        await db.collection("commenti").doc(commentId).delete();
        mostraToast(t("comments.deleted"), "success");
        loadComments(ricettaCorrente.id);
    } catch (error) {
        console.error("Delete comment error:", error);
    }
}

// ========================================
// NUTRITION CALCULATION (AI-powered)
// ========================================

async function calculateNutrition() {
    var container = document.getElementById("nutritionContent");
    container.innerHTML = '<div class="nutrition-loading"><i class="fas fa-spinner fa-spin"></i> ' + t("nutrition.calculating") + '</div>';
    var ingList = "";
    var dati = ingredientiCorretti || ingredientiOriginali;
    for (var i = 0; i < dati.length; i++) {
        var ing = dati[i];
        ingList += "- " + ing.nome;
        if (ing.quantita) ingList += ": " + ing.quantita + " " + (ing.unita || "");
        ingList += "\n";
    }
    var porzioni = porzioniOriginali;
    var prompt = "Calculate the approximate nutritional values PER SERVING for this recipe. " +
        "Servings: " + porzioni + "\n" +
        "Ingredients:\n" + ingList + "\n" +
        "Return ONLY a valid JSON object (no markdown, no explanation) with this structure: " +
        '{"calories":0,"fat":0,"carbs":0,"protein":0,"fiber":0,"sugar":0}' +
        " Values should be numbers (grams except calories which are kcal).";
    try {
        var response = await fetch(AI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + AI_API_KEY
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                max_tokens: 512
            })
        });
        var data = await response.json();
        if (!response.ok) {
            var apiMsg = (data.error && data.error.message) ? data.error.message : "API Error " + response.status;
            if (response.status === 429) {
                throw new Error("QUOTA: " + apiMsg);
            }
            throw new Error(apiMsg);
        }
        var risposta = "";
        if (data.choices && data.choices[0] && data.choices[0].message) {
            risposta = data.choices[0].message.content;
        }
        if (!risposta) throw new Error("Empty AI response");
        risposta = risposta.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        var nutrition = JSON.parse(risposta);
        renderNutrition(nutrition);
    } catch (error) {
        console.error("Nutrition error:", error);
        var errMsg = "Error calculating nutrition.";
        if (error && error.message) {
            if (error.message.indexOf("QUOTA") !== -1 || error.message.indexOf("429") !== -1 || error.message.indexOf("quota") !== -1) {
                errMsg = "⚠️ API quota exceeded. The free tier limit has been reached. Please wait a few minutes or update your API key in api-config.js.";
            } else if (error.message.indexOf("API key") !== -1 || error.message.indexOf("403") !== -1) {
                errMsg = "⚠️ Invalid API key. Please check api-config.js.";
            } else {
                errMsg = "⚠️ " + error.message;
            }
        }
        container.innerHTML = '<p style="color:#e53e3e;">' + errMsg + '</p>' +
            '<button class="btn-primary btn-nutrition" onclick="calculateNutrition()" style="margin-top:12px;"><i class="fas fa-redo"></i> ' + t("nutrition.calculate") + '</button>';
    }
}

function renderNutrition(n) {
    var container = document.getElementById("nutritionContent");
    var html = '<div class="nutrition-badge"><i class="fas fa-robot"></i> ' + t("nutrition.estimate") + ' - ' + t("nutrition.perServing") + '</div>';
    html += '<div class="nutrition-grid">';
    html += nutritionCard("cal", t("nutrition.calories"), n.calories || 0, "kcal");
    html += nutritionCard("fat", t("nutrition.fat"), n.fat || 0, "g");
    html += nutritionCard("carb", t("nutrition.carbs"), n.carbs || 0, "g");
    html += nutritionCard("prot", t("nutrition.protein"), n.protein || 0, "g");
    html += nutritionCard("fib", t("nutrition.fiber"), n.fiber || 0, "g");
    html += nutritionCard("sug", t("nutrition.sugar"), n.sugar || 0, "g");
    html += '</div>';
    container.innerHTML = html;
}

function nutritionCard(cls, label, value, unit) {
    return '<div class="nutrition-item ' + cls + '">' +
        '<div class="nutrition-value">' + value + '<small>' + unit + '</small></div>' +
        '<div class="nutrition-label">' + label + '</div>' +
        '</div>';
}

// ========================================
// TRANSLATE RECIPE (AI-powered)
// ========================================

var isTranslated = false;
var originalRecipeData = null;

async function translateRecipe() {
    console.log("translateRecipe called, ricettaCorrente:", !!ricettaCorrente);
    if (!ricettaCorrente) {
        mostraToast("No recipe loaded", "error");
        return;
    }

    // If already translated, show original
    if (isTranslated) {
        showOriginalRecipe();
        return;
    }

    var langNames = { en: "English", it: "Italian", fr: "French", de: "German", es: "Spanish" };
    var targetLang = langNames[currentLanguage] || "English";
    console.log("Translating to:", targetLang);

    // Save original data
    originalRecipeData = {
        titolo: ricettaCorrente.titolo,
        ingredienti: JSON.parse(JSON.stringify(ingredientiCorretti || ingredientiOriginali)),
        preparazioni: JSON.parse(JSON.stringify(preparazioniCorrette || preparazioniOriginali)),
        note: ricettaCorrente.note
    };

    mostraToast(t("translate.translating"), "success");

    // Build the recipe text for translation
    var recipeText = "Title: " + ricettaCorrente.titolo + "\n\n";
    recipeText += "Ingredients:\n";
    var ings = ingredientiCorretti || ingredientiOriginali;
    for (var i = 0; i < ings.length; i++) {
        recipeText += "- " + ings[i].nome + "\n";
    }
    recipeText += "\nPreparation sections:\n";
    var preps = preparazioniCorrette || preparazioniOriginali;
    for (var s = 0; s < preps.length; s++) {
        recipeText += "Section: " + preps[s].titolo + "\n";
        if (preps[s].ingredientiUsati) {
            for (var j = 0; j < preps[s].ingredientiUsati.length; j++) {
                recipeText += "  Ingredient: " + preps[s].ingredientiUsati[j].nome + "\n";
            }
        }
        if (preps[s].passi) {
            for (var p = 0; p < preps[s].passi.length; p++) {
                var testoP = typeof preps[s].passi[p] === "string" ? preps[s].passi[p] : preps[s].passi[p].testo;
                recipeText += "  Step " + (p + 1) + ": " + testoP + "\n";
            }
        }
    }
    if (ricettaCorrente.note) {
        recipeText += "\nNotes: " + ricettaCorrente.note + "\n";
    }

    var prompt = "Translate the following recipe to " + targetLang + ". " +
        "IMPORTANT: You MUST translate ALL items - every single ingredient name, every single step, every section title. Do NOT skip any. " +
        "Return ONLY a valid JSON object (no markdown, no explanation) with this structure: " +
        '{"titolo":"translated title",' +
        '"ingredienti":["translated name for EACH ingredient, same count as original"],' +
        '"sezioni":[{"titolo":"section title","ingredientiUsati":["name for EACH ingredient used"],"passi":["translated text for EACH step"]}],' +
        '"note":"translated notes"}' +
        "\n\nRules:\n- Translate ALL ingredients (there are " + ings.length + " ingredients)\n" +
        "- Translate ALL steps in EVERY section\n" +
        "- Keep quantities and units unchanged\n" +
        "- The ingredienti array must have exactly " + ings.length + " items\n\n" +
        recipeText;

    try {
        var response = await fetch(AI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + AI_API_KEY
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                max_tokens: 8000
            })
        });
        var data = await response.json();
        if (!response.ok) throw new Error((data.error && data.error.message) || "API Error");
        var risposta = "";
        if (data.choices && data.choices[0] && data.choices[0].message) {
            risposta = data.choices[0].message.content;
        }
        risposta = risposta.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        var translated = JSON.parse(risposta);

        // Apply translations
        if (translated.titolo) {
            ricettaCorrente.titolo = translated.titolo;
            document.getElementById("heroTitle").textContent = translated.titolo;
            document.title = translated.titolo + " — " + t("app.title");
        }

        // Translate ingredient names
        if (translated.ingredienti && translated.ingredienti.length > 0) {
            var ingData = ingredientiCorretti || ingredientiOriginali;
            for (var i = 0; i < Math.min(translated.ingredienti.length, ingData.length); i++) {
                ingData[i].nome = translated.ingredienti[i];
            }
            renderIngredienti();
        }

        // Translate preparation sections
        if (translated.sezioni && translated.sezioni.length > 0) {
            var prepData = preparazioniCorrette || preparazioniOriginali;
            for (var s = 0; s < Math.min(translated.sezioni.length, prepData.length); s++) {
                var ts = translated.sezioni[s];
                if (ts.titolo) prepData[s].titolo = ts.titolo;
                if (ts.ingredientiUsati && prepData[s].ingredientiUsati) {
                    for (var j = 0; j < Math.min(ts.ingredientiUsati.length, prepData[s].ingredientiUsati.length); j++) {
                        prepData[s].ingredientiUsati[j].nome = ts.ingredientiUsati[j];
                    }
                }
                if (ts.passi && prepData[s].passi) {
                    for (var p = 0; p < Math.min(ts.passi.length, prepData[s].passi.length); p++) {
                        if (typeof prepData[s].passi[p] === "string") {
                            prepData[s].passi[p] = ts.passi[p];
                        } else {
                            prepData[s].passi[p].testo = ts.passi[p];
                        }
                    }
                }
            }
            renderPreparazioni();
        }

        // Translate notes
        if (translated.note && ricettaCorrente.note) {
            ricettaCorrente.note = translated.note;
            var noteText = document.getElementById("noteText");
            if (noteText) noteText.textContent = translated.note;
        }

        isTranslated = true;
        // Change translate button to "Show Original"
        var btn = document.getElementById("btnTranslate");
        if (btn) {
            btn.innerHTML = '<i class="fas fa-undo"></i>';
            btn.title = t("translate.original");
        }
        mostraToast(t("translate.success"), "success");

    } catch (error) {
        console.error("Translation error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        var errMsg = t("translate.error");
        if (error && error.message) {
            errMsg += " (" + error.message + ")";
        }
        mostraToast(errMsg, "error");
    }
}

function showOriginalRecipe() {
    if (!originalRecipeData) return;

    ricettaCorrente.titolo = originalRecipeData.titolo;
    document.getElementById("heroTitle").textContent = originalRecipeData.titolo;
    document.title = originalRecipeData.titolo + " — " + t("app.title");

    if (ingredientiCorretti) {
        ingredientiCorretti = JSON.parse(JSON.stringify(originalRecipeData.ingredienti));
    }
    ingredientiOriginali = JSON.parse(JSON.stringify(originalRecipeData.ingredienti));
    renderIngredienti();

    if (preparazioniCorrette) {
        preparazioniCorrette = JSON.parse(JSON.stringify(originalRecipeData.preparazioni));
    }
    preparazioniOriginali = JSON.parse(JSON.stringify(originalRecipeData.preparazioni));
    renderPreparazioni();

    if (originalRecipeData.note) {
        ricettaCorrente.note = originalRecipeData.note;
        var noteText = document.getElementById("noteText");
        if (noteText) noteText.textContent = originalRecipeData.note;
    }

    isTranslated = false;
    var btn = document.getElementById("btnTranslate");
    if (btn) {
        btn.innerHTML = '<i class="fas fa-language"></i>';
        btn.title = t("translate.button");
    }
    mostraToast(t("translate.original"), "success");
}
