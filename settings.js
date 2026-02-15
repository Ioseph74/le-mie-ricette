document.addEventListener("DOMContentLoaded", function() {
    document.title = t("settings.title");
    var backTitle = document.getElementById("backTitle");
    if (backTitle) backTitle.textContent = t("app.title");
    var loginText = document.getElementById("loginText");
    if (loginText) loginText.textContent = t("auth.login");
    var loginMsg = document.getElementById("settingsLoginMsg");
    if (loginMsg) loginMsg.textContent = t("settings.notLoggedIn");

    initAuth(function(user) {
        if (user) {
            renderSettings(user);
        }
    });
});

async function renderSettings(user) {
    var container = document.getElementById("settingsContent");

    // Load stats
    var myRecipeCount = 0;
    var favCount = 0;
    var followCount = 0;

    try {
        var recSnap = await db.collection("ricette").where("autore", "==", user.uid).get();
        myRecipeCount = recSnap.size;
    } catch (e) {}

    try {
        var favSnap = await db.collection("preferiti").where("userId", "==", user.uid).get();
        favCount = favSnap.size;
    } catch (e) {}

    try {
        var folSnap = await db.collection("seguiti").where("userId", "==", user.uid).get();
        followCount = folSnap.size;
    } catch (e) {}

    // Build languages options
    var langs = getAllLanguages();
    var langOptions = "";
    for (var i = 0; i < langs.length; i++) {
        var selected = langs[i].code === currentLanguage ? " selected" : "";
        langOptions += '<option value="' + langs[i].code + '"' + selected + '>' + langs[i].flag + ' ' + langs[i].name + '</option>';
    }

    var html = '';

    // Profile card
    html += '<div class="settings-card">';
    html += '<h2><i class="fas fa-user-circle"></i> ' + t("settings.profile") + '</h2>';
    html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">';
    if (user.photoURL) html += '<img src="' + user.photoURL + '" style="width:64px;height:64px;border-radius:50%;object-fit:cover;">';
    html += '<div>';
    html += '<div style="font-size:1.1rem;font-weight:700;">' + escapeHtml(user.displayName || "User") + '</div>';
    html += '<div style="font-size:0.85rem;color:var(--text-light);">' + escapeHtml(user.email || "") + '</div>';
    html += '</div></div>';

    // Stats
    html += '<div class="settings-stats">';
    html += '<div class="stat-card"><div class="stat-value">' + myRecipeCount + '</div><div class="stat-label">' + t("settings.myRecipes") + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + favCount + '</div><div class="stat-label">' + t("settings.myFavorites") + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + followCount + '</div><div class="stat-label">' + t("settings.myFollowing") + '</div></div>';
    html += '</div>';
    html += '</div>';

    // Preferences card
    html += '<div class="settings-card">';
    html += '<h2><i class="fas fa-sliders-h"></i> ' + t("settings.preferences") + '</h2>';

    html += '<div class="settings-field">';
    html += '<label>' + t("settings.language") + '</label>';
    html += '<select id="settingsLang" onchange="changeSettingsLang(this.value)">' + langOptions + '</select>';
    html += '</div>';

    html += '<div class="settings-field">';
    html += '<label>' + t("settings.units") + '</label>';
    html += '<select id="settingsUnits" onchange="changeSettingsUnits(this.value)">';
    html += '<option value="metric"' + (currentUnitSystem === "metric" ? " selected" : "") + '>' + t("units.metric") + '</option>';
    html += '<option value="imperial"' + (currentUnitSystem === "imperial" ? " selected" : "") + '>' + t("units.imperial") + '</option>';
    html += '</select>';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
}

async function changeSettingsLang(code) {
    setLanguage(code);
    // Save to Firestore
    if (auth.currentUser) {
        try {
            await db.collection("userPreferences").doc(auth.currentUser.uid).set(
                { language: code, updatedAt: new Date().toISOString() },
                { merge: true }
            );
        } catch (e) {
            console.warn("Could not save language preference:", e);
        }
    }
    window.location.reload();
}

async function changeSettingsUnits(system) {
    setUnitSystem(system);
    // Save to Firestore
    if (auth.currentUser) {
        try {
            await db.collection("userPreferences").doc(auth.currentUser.uid).set(
                { unitSystem: system, updatedAt: new Date().toISOString() },
                { merge: true }
            );
        } catch (e) {
            console.warn("Could not save unit preference:", e);
        }
    }
    mostraToast(t("settings.saved"), "success");
}
