// ========================================
// UTILS.JS - Shared utility functions
// ========================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

/**
 * Format category with emoji and translated name
 */
function formattaCategoria(cat) {
    if (!cat) return "";
    var emoji = {
        "antipasti": "🥗", "primi": "🍝", "secondi": "🥩", "contorni": "🥦",
        "dolci": "🍰", "pane-e-lievitati": "🍞", "salse-e-condimenti": "🫙",
        "bevande": "🥤", "conserve": "🏺", "base": "📋"
    };
    var nome = getCategoryName(cat);
    return (emoji[cat] || "") + " " + nome;
}

/**
 * Format quantity for display
 */
function formattaQuantita(quantita, unita) {
    if (unita === "q.b.") return "q.b.";
    if (!quantita) return unita || "";
    var num = parseFloat(quantita);
    if (isNaN(num)) return quantita + " " + (unita || "");
    var str = num % 1 === 0 ? num.toString() : num.toFixed(1);
    return (str + " " + (unita || "")).trim();
}

/**
 * Show toast notification
 */
function mostraToast(messaggio, tipo) {
    document.querySelectorAll(".toast").forEach(function(t) { t.remove(); });
    var toast = document.createElement("div");
    toast.className = "toast" + (tipo ? " " + tipo : "");
    toast.textContent = messaggio;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add("show"); }, 10);
    setTimeout(function() {
        toast.classList.remove("show");
        setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
}

/**
 * Normalize steps from old format (strings) to new (objects with photos)
 */
function normalizzaPassi(passi) {
    if (!passi || passi.length === 0) return [];
    return passi.map(function(p) {
        if (typeof p === "string") return { testo: p, foto: null };
        return { testo: p.testo || "", foto: p.foto || null };
    });
}

/**
 * Normalize ingredients: flatten structure with subsections
 */
function normalizzaIngredienti(ingredienti) {
    if (!ingredienti || ingredienti.length === 0) return [];
    if (ingredienti[0] && ingredienti[0].sottosezione) {
        var flat = [];
        for (var s = 0; s < ingredienti.length; s++) {
            if (ingredienti[s].items) {
                for (var i = 0; i < ingredienti[s].items.length; i++) {
                    flat.push(ingredienti[s].items[i]);
                }
            }
        }
        return flat;
    }
    return ingredienti;
}

/**
 * Normalize preparations: handle old and new format
 */
function normalizzaPreparazioni(ricetta) {
    if (ricetta.preparazioni && ricetta.preparazioni.length > 0) {
        return ricetta.preparazioni.map(function(sez) {
            return {
                titolo: sez.titolo || t("editor.preparation"),
                ingredientiUsati: sez.ingredientiUsati || [],
                passi: normalizzaPassi(sez.passi)
            };
        });
    }
    if (ricetta.preparazione && ricetta.preparazione.length > 0) {
        return ricetta.preparazione.map(function(sez) {
            return {
                titolo: sez.sottosezione || t("editor.preparation"),
                ingredientiUsati: [],
                passi: normalizzaPassi(sez.passi)
            };
        });
    }
    return [];
}

/**
 * Generate star HTML
 */
function generaStelle(valutazione) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
        html += i <= valutazione ? '<i class="fas fa-star"></i>' : '<i class="fas fa-star empty"></i>';
    }
    return html;
}

/**
 * Generate difficulty indicator
 */
function generaDifficolta(livello) {
    var etichetta = getDifficultyName(livello);
    var dots = "";
    for (var i = 1; i <= 3; i++) {
        dots += '<span class="dot ' + (i <= livello ? 'filled' : '') + '"></span>';
    }
    return '<span class="difficulty">' + dots + '</span> ' + etichetta;
}

// ========================================
// UNIT CONVERSION SYSTEM
// ========================================

var UNIT_SYSTEM_KEY = "unitSystem";
var currentUnitSystem = localStorage.getItem(UNIT_SYSTEM_KEY) || "metric";

// Conversion factors
var UNIT_CONVERSIONS = {
    // Metric to Imperial
    "g_to_oz": 0.035274,
    "kg_to_lb": 2.20462,
    "ml_to_floz": 0.033814,
    "L_to_qt": 1.05669,
    // Imperial to Metric
    "oz_to_g": 28.3495,
    "lb_to_kg": 0.453592,
    "floz_to_ml": 29.5735,
    "qt_to_L": 0.946353
};

var METRIC_UNITS = ["g", "kg", "ml", "L", "cucchiai", "cucchiaini", "tazze", "pz", "spicchi", "fette", "pizzico", "q.b."];
var IMPERIAL_UNITS = ["oz", "lb", "fl oz", "qt", "tbsp", "tsp", "cups", "pcs", "cloves", "slices", "pinch", "to taste"];

// Map metric unit names to imperial equivalents
var UNIT_MAP_TO_IMPERIAL = {
    "g": "oz", "kg": "lb", "ml": "fl oz", "L": "qt",
    "cucchiai": "tbsp", "cucchiaini": "tsp", "tazze": "cups",
    "pz": "pcs", "spicchi": "cloves", "fette": "slices",
    "pizzico": "pinch", "q.b.": "to taste"
};

var UNIT_MAP_TO_METRIC = {
    "oz": "g", "lb": "kg", "fl oz": "ml", "qt": "L",
    "tbsp": "cucchiai", "tsp": "cucchiaini", "cups": "tazze",
    "pcs": "pz", "cloves": "spicchi", "slices": "fette",
    "pinch": "pizzico", "to taste": "q.b."
};

function setUnitSystem(system) {
    if (system !== "metric" && system !== "imperial") system = "metric";
    currentUnitSystem = system;
    localStorage.setItem(UNIT_SYSTEM_KEY, system);
}

function getUnitSystem() {
    return currentUnitSystem;
}

function convertUnit(value, fromUnit, toSystem) {
    if (!value || isNaN(parseFloat(value))) return { value: value, unit: fromUnit };
    var num = parseFloat(value);

    if (toSystem === "imperial") {
        switch (fromUnit) {
            case "g": return { value: Math.round(num * UNIT_CONVERSIONS["g_to_oz"] * 100) / 100, unit: "oz" };
            case "kg": return { value: Math.round(num * UNIT_CONVERSIONS["kg_to_lb"] * 100) / 100, unit: "lb" };
            case "ml": return { value: Math.round(num * UNIT_CONVERSIONS["ml_to_floz"] * 100) / 100, unit: "fl oz" };
            case "L": return { value: Math.round(num * UNIT_CONVERSIONS["L_to_qt"] * 100) / 100, unit: "qt" };
            default:
                var impUnit = UNIT_MAP_TO_IMPERIAL[fromUnit];
                return { value: num, unit: impUnit || fromUnit };
        }
    } else {
        switch (fromUnit) {
            case "oz": return { value: Math.round(num * UNIT_CONVERSIONS["oz_to_g"] * 100) / 100, unit: "g" };
            case "lb": return { value: Math.round(num * UNIT_CONVERSIONS["lb_to_kg"] * 100) / 100, unit: "kg" };
            case "fl oz": return { value: Math.round(num * UNIT_CONVERSIONS["floz_to_ml"] * 100) / 100, unit: "ml" };
            case "qt": return { value: Math.round(num * UNIT_CONVERSIONS["qt_to_L"] * 100) / 100, unit: "L" };
            default:
                var metUnit = UNIT_MAP_TO_METRIC[fromUnit];
                return { value: num, unit: metUnit || fromUnit };
        }
    }
}

function convertIngredientsList(ingredients, toSystem) {
    return ingredients.map(function(ing) {
        if (!ing.quantita || ing.unita === "q.b." || ing.unita === "to taste") {
            return { nome: ing.nome, quantita: ing.quantita, unita: ing.unita };
        }
        var converted = convertUnit(ing.quantita, ing.unita, toSystem);
        return { nome: ing.nome, quantita: converted.value, unita: converted.unit };
    });
}

function getAvailableUnits() {
    if (currentUnitSystem === "imperial") return IMPERIAL_UNITS;
    return METRIC_UNITS;
}

function buildUnitToggleHtml() {
    var isMetric = currentUnitSystem === "metric";
    return '<div class="unit-toggle">' +
        '<button class="unit-btn' + (isMetric ? ' active' : '') + '" onclick="switchUnits(\'metric\')">' + t("units.metric") + '</button>' +
        '<button class="unit-btn' + (!isMetric ? ' active' : '') + '" onclick="switchUnits(\'imperial\')">' + t("units.imperial") + '</button>' +
        '</div>';
}