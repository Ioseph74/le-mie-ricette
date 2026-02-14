// ========================================
// AI-CHAT.JS - AI Chef Assistant with Gemini
// ========================================

// Uses AI_API_KEY, AI_MODEL, AI_ENDPOINT from api-config.js
var AI_CHAT_ENDPOINT = AI_ENDPOINT;

var aiConversation = [];
var aiIsLoading = false;

// ========================================
// OPEN/CLOSE PANEL
// ========================================

function toggleAiChat() {
    var panel = document.getElementById("aiPanel");
    var overlay = document.getElementById("aiOverlay");
    var fabAi = document.querySelector(".fab-ai");
    var fabShop = document.getElementById("fabShopping");

    if (panel && overlay) {
        panel.classList.toggle("active");
        overlay.classList.toggle("active");

        var isOpen = panel.classList.contains("active");

        if (fabAi) fabAi.style.display = isOpen ? "none" : "flex";
        if (fabShop) fabShop.style.display = isOpen ? "none" : "flex";

        if (isOpen) {
            var input = document.getElementById("aiInput");
            if (input) setTimeout(function() { input.focus(); }, 300);
        }
    }
}

// ========================================
// RECIPE CONTEXT
// ========================================

function getContestoRicetta() {
    if (!ricettaCorrente) return "No recipe selected.";

    var r = ricettaCorrente;
    var testo = "RECIPE: " + r.titolo + "\n";

    if (r.categoria) testo += "Category: " + r.categoria + "\n";
    testo += "Servings: " + (r.porzioniOriginali || 1) + "\n";

    if (r.ingredienti && r.ingredienti.length > 0) {
        testo += "\nINGREDIENTS:\n";
        for (var i = 0; i < r.ingredienti.length; i++) {
            var ing = r.ingredienti[i];
            testo += "- " + ing.nome;
            if (ing.quantita) testo += ": " + ing.quantita + " " + (ing.unita || "");
            testo += "\n";
        }
    }

    if (r.preparazioni && r.preparazioni.length > 0) {
        testo += "\nPREPARATION:\n";
        for (var s = 0; s < r.preparazioni.length; s++) {
            var sez = r.preparazioni[s];
            testo += "\n" + sez.titolo + ":\n";
            if (sez.ingredientiUsati && sez.ingredientiUsati.length > 0) {
                testo += "Ingredients used: ";
                testo += sez.ingredientiUsati.map(function(iu) {
                    return iu.nome + (iu.quantita ? " " + iu.quantita + " " + (iu.unita || "") : "");
                }).join(", ") + "\n";
            }
            if (sez.passi) {
                for (var p = 0; p < sez.passi.length; p++) {
                    var passo = sez.passi[p];
                    var testoP = typeof passo === "string" ? passo : passo.testo;
                    testo += (p + 1) + ". " + testoP + "\n";
                }
            }
        }
    }

    if (r.note) testo += "\nNOTES: " + r.note + "\n";

    return testo;
}

// Language-specific system prompts
function getSystemPromptForLang() {
    var langInstructions = {
        en: "You are a friendly and expert chef assistant. The user is viewing a recipe in their cooking app. Reply in English, concisely and practically. Use a friendly but professional tone. If the question is about the recipe, use the provided context for specific answers. Format answers readably: use bullet points when needed. If unsure about something, say so.",
        it: "Sei un assistente chef esperto e amichevole. L'utente sta guardando una ricetta nella sua app di cucina. Rispondi in italiano, in modo conciso e pratico. Usa un tono amichevole ma professionale. Se la domanda riguarda la ricetta, usa il contesto fornito per dare risposte specifiche. Formatta le risposte in modo leggibile: usa elenchi puntati quando servono. Se non sei sicuro di qualcosa, dillo.",
        fr: "Vous etes un assistant chef expert et amical. L'utilisateur consulte une recette dans son application de cuisine. Repondez en francais, de maniere concise et pratique. Utilisez un ton amical mais professionnel. Si la question concerne la recette, utilisez le contexte fourni pour des reponses specifiques. Formatez les reponses de maniere lisible. Si vous n'etes pas sur de quelque chose, dites-le.",
        de: "Sie sind ein freundlicher und erfahrener Kochassistent. Der Benutzer sieht sich ein Rezept in seiner Koch-App an. Antworten Sie auf Deutsch, praezise und praktisch. Verwenden Sie einen freundlichen aber professionellen Ton. Wenn die Frage das Rezept betrifft, nutzen Sie den bereitgestellten Kontext. Formatieren Sie Antworten lesbar. Wenn Sie sich bei etwas nicht sicher sind, sagen Sie es.",
        es: "Eres un asistente chef experto y amable. El usuario esta viendo una receta en su aplicacion de cocina. Responde en espanol, de forma concisa y practica. Usa un tono amable pero profesional. Si la pregunta es sobre la receta, usa el contexto proporcionado para dar respuestas especificas. Formatea las respuestas de forma legible. Si no estas seguro de algo, dilo."
    };
    return langInstructions[currentLanguage] || langInstructions["en"];
}

// ========================================
// SEND MESSAGE
// ========================================

function inviaMessaggioAi(testo) {
    if (!testo || testo.trim() === "" || aiIsLoading) return;

    testo = testo.trim();

    aiConversation.push({ role: "user", text: testo });
    renderMessaggiAi();
    mostraAiLoading(true);

    var input = document.getElementById("aiInput");
    if (input) { input.value = ""; input.focus(); }

    var contesto = getContestoRicetta();

    var systemPrompt = getSystemPromptForLang() + "\n\n" +
        "CURRENT RECIPE CONTEXT:\n" + contesto;

    var recipeName = ricettaCorrente ? ricettaCorrente.titolo : "a recipe";

    var contents = [];
    contents.push({
        role: "user",
        parts: [{ text: systemPrompt + "\n\nInitial question: Hello, I am ready to help with this recipe!" }]
    });
    contents.push({
        role: "model",
        parts: [{ text: t("ai.welcome") + " - **" + recipeName + "**!" }]
    });

    for (var i = 0; i < aiConversation.length; i++) {
        var msg = aiConversation[i];
        contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
        });
    }

    fetch(AI_CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        mostraAiLoading(false);

        var risposta = "";
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            risposta = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            risposta = "Error: " + data.error.message;
        } else {
            risposta = "Sorry, I could not generate a response. Please try again.";
        }

        aiConversation.push({ role: "ai", text: risposta });
        renderMessaggiAi();
    })
    .catch(function(error) {
        mostraAiLoading(false);
        console.error("AI Error:", error);
        aiConversation.push({ role: "ai", text: "Connection error. Check your internet connection and try again." });
        renderMessaggiAi();
    });
}

// ========================================
// QUICK SUGGESTIONS
// ========================================

function getSuggerimenti() {
    if (!ricettaCorrente) return [];
    return [
        t("ai.vegan"),
        t("ai.lactoseFree"),
        t("ai.glutenFree"),
        t("ai.cookingTips"),
        t("ai.storage"),
        t("ai.wine")
    ];
}

// ========================================
// RENDER MESSAGES
// ========================================

function renderMessaggiAi() {
    var container = document.getElementById("aiMessages");
    if (!container) return;

    if (aiConversation.length === 0) {
        var titolo = ricettaCorrente ? escapeHtml(ricettaCorrente.titolo) : t("app.title");
        container.innerHTML = '<div class="ai-welcome">' +
            '<div style="font-size:2.5rem;margin-bottom:8px;">&#x1F9D1;&#x200D;&#x1F373;</div>' +
            '<h3>' + t("ai.title") + '</h3>' +
            '<p>' + t("ai.welcome") + ': <strong>' + titolo + '</strong></p>' +
            '</div>';
        return;
    }

    var html = "";
    for (var i = 0; i < aiConversation.length; i++) {
        var msg = aiConversation[i];
        if (msg.role === "user") {
            html += '<div class="ai-msg ai-msg-user">' + escapeHtml(msg.text) + '</div>';
        } else {
            html += '<div class="ai-msg ai-msg-ai">' + formattaRispostaAi(msg.text) + '</div>';
        }
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

function mostraAiLoading(show) {
    aiIsLoading = show;
    var container = document.getElementById("aiMessages");
    var sendBtn = document.getElementById("aiSendBtn");

    if (sendBtn) sendBtn.disabled = show;

    if (show && container) {
        container.innerHTML += '<div class="ai-msg ai-msg-loading" id="aiLoading"><div class="ai-typing-dots"><span></span><span></span><span></span></div></div>';
        container.scrollTop = container.scrollHeight;
    } else {
        var loading = document.getElementById("aiLoading");
        if (loading) loading.remove();
    }
}

// ========================================
// RESPONSE FORMATTING
// ========================================

function formattaRispostaAi(testo) {
    testo = escapeHtml(testo);
    testo = testo.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    testo = testo.replace(/\*(.+?)\*/g, '<em>$1</em>');
    testo = testo.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    testo = testo.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    testo = testo.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    testo = testo.replace(/\n\n/g, '</p><p>');
    testo = testo.replace(/\n/g, '<br>');
    testo = '<p>' + testo + '</p>';
    testo = testo.replace(/<p><\/p>/g, '');
    testo = testo.replace(/<p><br><\/p>/g, '');
    return testo;
}

// ========================================
// INPUT HANDLING
// ========================================

function aiHandleKeypress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        var input = document.getElementById("aiInput");
        if (input) inviaMessaggioAi(input.value);
    }
}

// ========================================
// INIT
// ========================================

function initAiChat() {
    var sugContainer = document.getElementById("aiSuggestions");
    if (!sugContainer) return;

    var suggerimenti = getSuggerimenti();
    sugContainer.innerHTML = suggerimenti.map(function(s) {
        return '<button class="ai-suggestion-btn" onclick="inviaMessaggioAi(this.textContent)">' + escapeHtml(s) + '</button>';
    }).join("");
}

document.addEventListener("DOMContentLoaded", function() {
    var checkInterval = setInterval(function() {
        if (ricettaCorrente) {
            clearInterval(checkInterval);
            initAiChat();
        }
    }, 500);

    setTimeout(function() {
        clearInterval(checkInterval);
    }, 30000);
});