function esportaPDF() {
    if (!ricettaCorrente) return;
    mostraToast(t("toast.pdfGenerating"), "");
    var r = ricettaCorrente;
    var datiIng = ingredientiCorretti || ingredientiOriginali;
    var datiPrep = preparazioniCorrette || preparazioniOriginali;
    var tempoTotale = (r.tempoPreparazione || 0) + (r.tempoCottura || 0);
    var diff = ["", t("diff.easy"), t("diff.medium"), t("diff.hard")];
    var stelle = "";
    for (var st = 0; st < 5; st++) {
        stelle += st < (r.valutazione || 0) ? "\u2605" : "\u2606";
    }

    var titoloSafe = escapeHtml(r.titolo);
    var categoriaSafe = escapeHtml(formattaCategoria(r.categoria));

    var h = [];
    h.push('<div style="font-family:Georgia,serif;color:#2d2d2d;">');
    h.push('<div style="text-align:center;margin-bottom:12px;">');
    h.push('<div style="font-size:22px;font-weight:bold;margin:0 0 4px 0;">' + titoloSafe + '</div>');
    if (r.categoria) {
        h.push('<div style="color:#e85d26;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">' + categoriaSafe + '</div>');
    }
    h.push('<div style="font-size:16px;color:#f4b400;margin-bottom:6px;">' + stelle + '</div>');
    var infoParts = [];
    if (tempoTotale > 0) infoParts.push("\u23F1 " + tempoTotale + " min");
    infoParts.push("\uD83D\uDCCA " + diff[r.difficolta || 1]);
    infoParts.push("\uD83D\uDC65 " + (r.porzioniOriginali || 1) + " " + t("view.servingsLabel"));
    h.push('<div style="color:#6b6b6b;font-size:12px;">' + infoParts.join(" &nbsp;|&nbsp; ") + '</div>');
    h.push('</div>');
    h.push('<div style="border-bottom:3px double #e85d26;margin-bottom:14px;"></div>');
    if (r.foto) {
        h.push('<div style="text-align:center;margin-bottom:14px;">');
        h.push('<img src="' + r.foto + '" style="max-width:250px;max-height:200px;border-radius:8px;">');
        h.push('</div>');
    }
    h.push('<div style="margin-bottom:14px;">');
    h.push('<div style="font-size:15px;font-weight:bold;color:#e85d26;border-bottom:2px solid #e85d26;padding-bottom:3px;margin-bottom:8px;">' + t("view.ingredients") + '</div>');
    for (var i = 0; i < datiIng.length; i++) {
        var ing = datiIng[i];
        var qta = fmtPdfQta(ing.quantita, ing.unita);
        var bg = i % 2 === 0 ? "background:#fdf9f6;" : "";
        h.push('<div style="display:flex;justify-content:space-between;padding:3px 6px;font-size:12px;' + bg + '">');
        h.push('<span>' + escapeHtml(ing.nome) + '</span>');
        h.push('<span style="font-weight:600;color:#c94d1e;">' + escapeHtml(qta) + '</span>');
        h.push('</div>');
    }
    h.push('</div>');
    for (var s = 0; s < datiPrep.length; s++) {
        var sez = datiPrep[s];
        h.push('<div style="margin-bottom:14px;">');
        h.push('<div style="font-size:15px;font-weight:bold;color:#e85d26;border-bottom:2px solid #e85d26;padding-bottom:3px;margin-bottom:8px;">' + escapeHtml(sez.titolo) + '</div>');
        if (sez.ingredientiUsati && sez.ingredientiUsati.length > 0) {
            h.push('<div style="background:#fdf9f6;padding:6px 10px;border-radius:6px;margin-bottom:8px;border-left:3px solid #e85d26;">');
            h.push('<div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#e85d26;margin-bottom:3px;">' + t("editor.ingredientsUsed") + '</div>');
            for (var iu = 0; iu < sez.ingredientiUsati.length; iu++) {
                var item = sez.ingredientiUsati[iu];
                var qtaIu = fmtPdfQta(item.quantita, item.unita);
                h.push('<div style="display:flex;justify-content:space-between;font-size:11px;padding:1px 0;">');
                h.push('<span>' + escapeHtml(item.nome) + '</span>');
                h.push('<span style="font-weight:600;color:#c94d1e;">' + escapeHtml(qtaIu) + '</span>');
                h.push('</div>');
            }
            h.push('</div>');
        }
        if (sez.passi && sez.passi.length > 0) {
            for (var pp = 0; pp < sez.passi.length; pp++) {
                var passo = sez.passi[pp];
                h.push('<div style="margin-bottom:10px;">');
                h.push('<div style="display:flex;gap:8px;font-size:12px;line-height:1.5;">');
                h.push('<div style="min-width:22px;width:22px;height:22px;background:#e85d26;color:white;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:bold;">' + (pp + 1) + '</div>');
                h.push('<div style="flex:1;">' + escapeHtml(passo.testo) + '</div>');
                h.push('</div>');
                if (passo.foto) {
                    h.push('<div style="margin-top:6px;margin-left:30px;">');
                    h.push('<img src="' + passo.foto + '" style="max-width:200px;max-height:150px;border-radius:6px;border:1px solid #e0d8d0;">');
                    h.push('</div>');
                }
                h.push('</div>');
            }
        }
        h.push('</div>');
    }
    if (r.note && r.note.trim()) {
        h.push('<div style="padding:8px 10px;background:#fdf9f6;border-left:4px solid #e85d26;border-radius:4px;margin-bottom:14px;">');
        h.push('<div style="font-size:10px;font-weight:700;color:#e85d26;text-transform:uppercase;margin-bottom:3px;">' + t("view.notes") + '</div>');
        h.push('<div style="font-size:11px;font-style:italic;line-height:1.5;color:#6b6b6b;">' + escapeHtml(r.note) + '</div>');
        h.push('</div>');
    }
    h.push('<div style="text-align:center;padding-top:10px;border-top:1px solid #e0d8d0;color:#aaa;font-size:9px;margin-top:14px;">');
    h.push(t("app.title") + " \u2014 " + new Date().toLocaleDateString(currentLanguage));
    h.push('</div>');
    h.push('</div>');
    generaPdfDaHtml(h.join("\n"), r.titolo);
}

function generaPdfDaHtml(htmlContent, titolo) {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var bodyOriginalStyle = document.body.style.cssText;
    var htmlOriginalStyle = document.documentElement.style.cssText;
    var allChildren = document.body.children;
    var hiddenElements = [];
    for (var c = 0; c < allChildren.length; c++) {
        if (allChildren[c].style.display !== "none") {
            hiddenElements.push({el: allChildren[c], d: allChildren[c].style.display});
            allChildren[c].style.display = "none";
        }
    }
    document.documentElement.style.cssText = "width:595px!important;overflow:hidden!important;margin:0!important;padding:0!important;";
    document.body.style.cssText = "width:595px!important;margin:0!important;padding:0!important;overflow:hidden!important;background:white!important;position:relative!important;left:0!important;";
    var tempDiv = document.createElement("div");
    tempDiv.style.cssText = "width:595px;padding:20px;background:white;margin:0;box-sizing:border-box;position:relative;left:0;";
    tempDiv.innerHTML = htmlContent;
    document.body.insertBefore(tempDiv, document.body.firstChild);
    window.scrollTo(0, 0);
    var nomeFile = titolo.replace(/[^a-zA-Z0-9 ]/gi, "").replace(/ +/g, "_");
    setTimeout(function() {
        var altezza = tempDiv.scrollHeight;
        var larghezza = tempDiv.getBoundingClientRect().width;
        html2pdf().set({
            margin: 10,
            filename: nomeFile + ".pdf",
            image: {type: "jpeg", quality: 0.8},
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                width: larghezza,
                height: altezza,
                windowWidth: 595,
                windowHeight: altezza
            },
            jsPDF: {unit: "mm", format: "a4", orientation: "portrait"}
        }).from(tempDiv).save().then(function() {
            doRipristina();
        }).catch(function(err) {
            console.error("PDF Error:", err);
            doRipristina();
            mostraToast(t("toast.pdfError"), "error");
        });
        function doRipristina() {
            if (tempDiv.parentNode) {
                document.body.removeChild(tempDiv);
            }
            document.body.style.cssText = bodyOriginalStyle;
            document.documentElement.style.cssText = htmlOriginalStyle;
            for (var j = 0; j < hiddenElements.length; j++) {
                hiddenElements[j].el.style.display = hiddenElements[j].d;
            }
            window.scrollTo(0, scrollTop);
            mostraToast(t("toast.pdfDone"), "success");
        }
    }, 600);
}

function fmtPdfQta(quantita, unita) {
    if (unita === "q.b." || unita === "to taste") return unita;
    if (!quantita) return unita || "";
    var num = parseFloat(quantita);
    if (isNaN(num)) return quantita + " " + (unita || "");
    var str = num % 1 === 0 ? num.toString() : num.toFixed(1);
    return (str + " " + (unita || "")).trim();
}