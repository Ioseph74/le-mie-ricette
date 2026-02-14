// ========================================
// SHOPPING-LIST.JS - Lista della Spesa
// Salva in localStorage (nessun database necessario)
// ========================================

const STORAGE_KEY = "listaDellaSPesa";

// ========================================
// GESTIONE DATI
// ========================================

function getListaSpesa() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function salvaListaSpesa(lista) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    aggiornaBadge();
}

function aggiungiAllaSpesa(ingredienti) {
    // ingredienti = [{ nome, quantita, unita }, ...]
    const lista = getListaSpesa();

    ingredienti.forEach(ing => {
        if (!ing.nome || ing.nome.trim() === "") return;

        // Controlla se esiste già
        const esistente = lista.find(item =>
            item.nome.toLowerCase() === ing.nome.toLowerCase() &&
            item.unita === ing.unita
        );

        if (esistente) {
            // Somma le quantità
            if (esistente.quantita && ing.quantita) {
                esistente.quantita = parseFloat(esistente.quantita) + parseFloat(ing.quantita);
            }
        } else {
            lista.push({
                nome: ing.nome,
                quantita: ing.quantita,
                unita: ing.unita || "",
                checked: false
            });
        }
    });

    salvaListaSpesa(lista);
    renderListaSpesa();
}

function toggleItemSpesa(index) {
    const lista = getListaSpesa();
    if (lista[index]) {
        lista[index].checked = !lista[index].checked;
        salvaListaSpesa(lista);
        renderListaSpesa();
    }
}

function rimuoviItemSpesa(index) {
    const lista = getListaSpesa();
    lista.splice(index, 1);
    salvaListaSpesa(lista);
    renderListaSpesa();
}

function clearShopping() {
    salvaListaSpesa([]);
    renderListaSpesa();
}

// ========================================
// RENDERING
// ========================================

function renderListaSpesa() {
    const container = document.getElementById("shoppingList");
    if (!container) return;

    const lista = getListaSpesa();

    if (lista.length === 0) {
        container.innerHTML = '<p class="shopping-empty">' + (typeof t === 'function' ? t("shop.empty") : "The list is empty") + '</p>';
        return;
    }

    // Ordina: non spuntati prima, poi spuntati
    const ordinata = [...lista].map((item, i) => ({ ...item, originalIndex: i }));
    ordinata.sort((a, b) => a.checked - b.checked);

    container.innerHTML = ordinata.map(item => {
        const qta = item.quantita
            ? `${formattaNumero(item.quantita)} ${item.unita}`
            : item.unita || "";

        return `
            <div class="shopping-item ${item.checked ? 'checked' : ''}">
                <input type="checkbox" ${item.checked ? 'checked' : ''}
                    onchange="toggleItemSpesa(${item.originalIndex})">
                <span>${item.nome}${qta ? ' — ' + qta : ''}</span>
                <button class="btn-icon" onclick="rimuoviItemSpesa(${item.originalIndex})" 
                    style="margin-left:auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join("");
}

function formattaNumero(n) {
    const num = parseFloat(n);
    if (isNaN(num)) return n;
    return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
}

// ========================================
// PANNELLO LATERALE
// ========================================

function toggleShopping() {
    const panel = document.getElementById("shoppingPanel");
    const overlay = document.getElementById("shoppingOverlay");

    if (panel && overlay) {
        panel.classList.toggle("active");
        overlay.classList.toggle("active");
        if (panel.classList.contains("active")) {
            renderListaSpesa();
        }
    }
}

// Chiudi cliccando sull'overlay
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("shoppingOverlay");
    if (overlay) {
        overlay.addEventListener("click", toggleShopping);
    }
    aggiornaBadge();
});

// ========================================
// BADGE CONTATORE
// ========================================

function aggiornaBadge() {
    const badge = document.getElementById("fabBadge");
    if (!badge) return;

    const lista = getListaSpesa();
    const nonSpuntati = lista.filter(i => !i.checked).length;

    if (nonSpuntati > 0) {
        badge.style.display = "flex";
        badge.textContent = nonSpuntati;
    } else {
        badge.style.display = "none";
    }
}

// ========================================
// STAMPA LISTA
// ========================================

function printShopping() {
    const lista = getListaSpesa();
    if (lista.length === 0) return;

    const nonSpuntati = lista.filter(i => !i.checked);
    const spuntati = lista.filter(i => i.checked);

    var shopTitleText = typeof t === 'function' ? t("shop.title") : "Shopping List";
    var locale = typeof currentLanguage !== 'undefined' ? currentLanguage : 'en';
    let html = `
        <html><head><title>${shopTitleText}</title>
        <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; }
            h1 { font-size: 1.5rem; margin-bottom: 8px; }
            .data { color: #888; margin-bottom: 24px; font-size: 0.9rem; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; }
            .box { width: 16px; height: 16px; border: 2px solid #ccc; border-radius: 3px; flex-shrink: 0; }
            .checked { text-decoration: line-through; color: #aaa; }
            .checked .box { background: #ccc; }
        </style></head><body>
        <h1>🛒 ${shopTitleText}</h1>
        <div class="data">${new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <ul>
    `;

    nonSpuntati.forEach(item => {
        const qta = item.quantita ? ` — ${formattaNumero(item.quantita)} ${item.unita}` : "";
        html += `<li><span class="box"></span>${item.nome}${qta}</li>`;
    });

    spuntati.forEach(item => {
        const qta = item.quantita ? ` — ${formattaNumero(item.quantita)} ${item.unita}` : "";
        html += `<li class="checked"><span class="box"></span>${item.nome}${qta}</li>`;
    });

    html += `</ul></body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
}
