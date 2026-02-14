// ========================================
// I18N.JS - Internationalization System
// Supported: English (en), Italian (it), French (fr), German (de), Spanish (es)
// ========================================

var I18N_STORAGE_KEY = "appLanguage";
var currentLanguage = localStorage.getItem(I18N_STORAGE_KEY) || "en";

var translations = {
    "app.title": { en: "My Recipes", it: "Le Mie Ricette", fr: "Mes Recettes", de: "Meine Rezepte", es: "Mis Recetas" },
    "app.loading": { en: "Loading...", it: "Caricamento...", fr: "Chargement...", de: "Laden...", es: "Cargando..." },
    "app.save": { en: "Save", it: "Salva", fr: "Enregistrer", de: "Speichern", es: "Guardar" },
    "app.cancel": { en: "Cancel", it: "Annulla", fr: "Annuler", de: "Abbrechen", es: "Cancelar" },
    "app.delete": { en: "Delete", it: "Elimina", fr: "Supprimer", de: "Löschen", es: "Eliminar" },
    "app.close": { en: "Close", it: "Chiudi", fr: "Fermer", de: "Schließen", es: "Cerrar" },
    "noscript.title": { en: "JavaScript Required", it: "JavaScript richiesto", fr: "JavaScript requis", de: "JavaScript erforderlich", es: "JavaScript requerido" },
    "noscript.message": { en: "This application requires JavaScript to function. Please enable it in your browser settings.", it: "Questa applicazione richiede JavaScript per funzionare. Abilitalo nelle impostazioni del browser.", fr: "Cette application necessite JavaScript pour fonctionner. Activez-le dans les parametres de votre navigateur.", de: "Diese Anwendung benoetigt JavaScript. Bitte aktivieren Sie es in Ihren Browsereinstellungen.", es: "Esta aplicacion requiere JavaScript para funcionar. Activelo en la configuracion de su navegador." },
    "auth.login": { en: "Sign in", it: "Accedi", fr: "Connexion", de: "Anmelden", es: "Iniciar sesion" },
    "auth.login.google": { en: "Sign in with Google", it: "Accedi con Google", fr: "Se connecter avec Google", de: "Mit Google anmelden", es: "Iniciar sesion con Google" },
    "auth.logout": { en: "Sign out", it: "Esci", fr: "Deconnexion", de: "Abmelden", es: "Cerrar sesion" },
    "auth.required": { en: "Login Required", it: "Accesso richiesto", fr: "Connexion requise", de: "Anmeldung erforderlich", es: "Inicio de sesion requerido" },
    "auth.required.message": { en: "You must sign in to create or edit recipes.", it: "Devi effettuare il login per creare o modificare ricette.", fr: "Vous devez vous connecter pour creer ou modifier des recettes.", de: "Sie muessen sich anmelden, um Rezepte zu erstellen oder zu bearbeiten.", es: "Debe iniciar sesion para crear o editar recetas." },
    "auth.error.login": { en: "Login error: ", it: "Errore nel login: ", fr: "Erreur de connexion: ", de: "Anmeldefehler: ", es: "Error de inicio de sesion: " },
    "search.placeholder": { en: "Search recipe or ingredient...", it: "Cerca ricetta o ingrediente...", fr: "Rechercher recette ou ingredient...", de: "Rezept oder Zutat suchen...", es: "Buscar receta o ingrediente..." },
    "header.newRecipe": { en: "New Recipe", it: "Nuova Ricetta", fr: "Nouvelle Recette", de: "Neues Rezept", es: "Nueva Receta" },
    "cat.all": { en: "All", it: "Tutte", fr: "Toutes", de: "Alle", es: "Todas" },
    "cat.antipasti": { en: "Appetizers", it: "Antipasti", fr: "Entrees", de: "Vorspeisen", es: "Aperitivos" },
    "cat.primi": { en: "First Courses", it: "Primi", fr: "Premiers plats", de: "Erste Gaenge", es: "Primeros platos" },
    "cat.secondi": { en: "Main Courses", it: "Secondi", fr: "Plats principaux", de: "Hauptgerichte", es: "Segundos platos" },
    "cat.contorni": { en: "Side Dishes", it: "Contorni", fr: "Accompagnements", de: "Beilagen", es: "Guarniciones" },
    "cat.dolci": { en: "Desserts", it: "Dolci", fr: "Desserts", de: "Desserts", es: "Postres" },
    "cat.pane-e-lievitati": { en: "Bread & Baked", it: "Pane e Lievitati", fr: "Pains et leves", de: "Brot & Gebaeck", es: "Pan y levados" },
    "cat.salse-e-condimenti": { en: "Sauces", it: "Salse e Condimenti", fr: "Sauces", de: "Sossen", es: "Salsas" },
    "cat.bevande": { en: "Beverages", it: "Bevande", fr: "Boissons", de: "Getraenke", es: "Bebidas" },
    "cat.conserve": { en: "Preserves", it: "Conserve", fr: "Conserves", de: "Konserven", es: "Conservas" },
    "cat.base": { en: "Basics", it: "Base", fr: "Bases", de: "Grundrezepte", es: "Basicas" },
    "empty.title": { en: "No recipes found", it: "Nessuna ricetta trovata", fr: "Aucune recette trouvee", de: "Keine Rezepte gefunden", es: "No se encontraron recetas" },
    "empty.message": { en: "Start by adding your first recipe!", it: "Inizia aggiungendo la tua prima ricetta!", fr: "Commencez par ajouter votre premiere recette!", de: "Beginnen Sie mit Ihrem ersten Rezept!", es: "Empiece anadiendo su primera receta!" },
    "empty.create": { en: "Create Recipe", it: "Crea Ricetta", fr: "Creer Recette", de: "Rezept erstellen", es: "Crear Receta" },
    "card.noTitle": { en: "Untitled", it: "Senza titolo", fr: "Sans titre", de: "Ohne Titel", es: "Sin titulo" },
    "diff.easy": { en: "Easy", it: "Facile", fr: "Facile", de: "Einfach", es: "Facil" },
    "diff.medium": { en: "Medium", it: "Media", fr: "Moyen", de: "Mittel", es: "Media" },
    "diff.hard": { en: "Hard", it: "Difficile", fr: "Difficile", de: "Schwer", es: "Dificil" },
    "shop.title": { en: "Shopping List", it: "Lista della Spesa", fr: "Liste de courses", de: "Einkaufsliste", es: "Lista de compras" },
    "shop.empty": { en: "The list is empty", it: "La lista e vuota", fr: "La liste est vide", de: "Die Liste ist leer", es: "La lista esta vacia" },
    "shop.clear": { en: "Clear", it: "Svuota", fr: "Vider", de: "Leeren", es: "Vaciar" },
    "shop.print": { en: "Print", it: "Stampa", fr: "Imprimer", de: "Drucken", es: "Imprimir" },
    "shop.addAll": { en: "Add to shopping list", it: "Aggiungi alla spesa", fr: "Ajouter aux courses", de: "Zur Einkaufsliste", es: "Anadir a la compra" },
    "shop.added": { en: " ingredients added to the list!", it: " ingredienti aggiunti alla lista!", fr: " ingredients ajoutes a la liste!", de: " Zutaten zur Liste hinzugefuegt!", es: " ingredientes anadidos a la lista!" },
    "modal.delete.title": { en: "Delete Recipe", it: "Elimina Ricetta", fr: "Supprimer Recette", de: "Rezept loeschen", es: "Eliminar Receta" },
    "modal.delete.confirm": { en: "Are you sure you want to delete \"{title}\"?", it: "Sei sicuro di voler eliminare \"{title}\"?", fr: "Etes-vous sur de vouloir supprimer \"{title}\"?", de: "Sind Sie sicher, dass Sie \"{title}\" loeschen moechten?", es: "Esta seguro de que desea eliminar \"{title}\"?" },
    "modal.delete.confirmGeneric": { en: "Are you sure you want to delete this recipe? This action cannot be undone.", it: "Sei sicuro di voler eliminare questa ricetta? L'azione non puo essere annullata.", fr: "Etes-vous sur de vouloir supprimer cette recette? Cette action est irreversible.", de: "Sind Sie sicher, dass Sie dieses Rezept loeschen moechten? Diese Aktion kann nicht rueckgaengig gemacht werden.", es: "Esta seguro de que desea eliminar esta receta? Esta accion no se puede deshacer." },
    "toast.deleted": { en: "Recipe deleted", it: "Ricetta eliminata", fr: "Recette supprimee", de: "Rezept geloescht", es: "Receta eliminada" },
    "toast.deleteError": { en: "Error deleting. Are you logged in?", it: "Errore nell'eliminazione. Sei loggato?", fr: "Erreur lors de la suppression. Etes-vous connecte?", de: "Fehler beim Loeschen. Sind Sie angemeldet?", es: "Error al eliminar. Ha iniciado sesion?" },
    "toast.saved": { en: "Recipe saved!", it: "Ricetta salvata!", fr: "Recette enregistree!", de: "Rezept gespeichert!", es: "Receta guardada!" },
    "toast.updated": { en: "Recipe updated!", it: "Ricetta aggiornata!", fr: "Recette mise a jour!", de: "Rezept aktualisiert!", es: "Receta actualizada!" },
    "toast.saveError": { en: "Error saving. Try again.", it: "Errore nel salvataggio. Riprova.", fr: "Erreur d'enregistrement. Reessayez.", de: "Fehler beim Speichern. Versuchen Sie es erneut.", es: "Error al guardar. Intentelo de nuevo." },
    "toast.notFound": { en: "Recipe not found", it: "Ricetta non trovata", fr: "Recette non trouvee", de: "Rezept nicht gefunden", es: "Receta no encontrada" },
    "toast.loadError": { en: "Loading error", it: "Errore nel caricamento", fr: "Erreur de chargement", de: "Ladefehler", es: "Error de carga" },
    "toast.photoAdded": { en: "Photo added!", it: "Foto aggiunta!", fr: "Photo ajoutee!", de: "Foto hinzugefuegt!", es: "Foto anadida!" },
    "toast.photoError": { en: "Error with the image", it: "Errore con l'immagine", fr: "Erreur avec l'image", de: "Fehler mit dem Bild", es: "Error con la imagen" },
    "toast.selectImage": { en: "Select an image file", it: "Seleziona un file immagine", fr: "Selectionnez un fichier image", de: "Waehlen Sie eine Bilddatei", es: "Seleccione un archivo de imagen" },
    "toast.linkCopied": { en: "Link copied!", it: "Link copiato!", fr: "Lien copie!", de: "Link kopiert!", es: "Enlace copiado!" },
    "toast.recalculated": { en: "Doses recalculated!", it: "Dosi ricalcolate!", fr: "Doses recalculees!", de: "Mengen neu berechnet!", es: "Dosis recalculadas!" },
    "toast.resetDoses": { en: "Doses restored", it: "Dosi ripristinate", fr: "Doses restaurees", de: "Mengen wiederhergestellt", es: "Dosis restauradas" },
    "toast.enterServings": { en: "Enter the number of servings", it: "Inserisci il numero di porzioni", fr: "Entrez le nombre de portions", de: "Geben Sie die Anzahl der Portionen ein", es: "Ingrese el numero de porciones" },
    "toast.enterName": { en: "Enter a recipe name", it: "Inserisci un nome per la ricetta", fr: "Entrez un nom de recette", de: "Geben Sie einen Rezeptnamen ein", es: "Ingrese un nombre para la receta" },
    "toast.stepPhotoAdded": { en: "Photo added to step!", it: "Foto aggiunta al passaggio!", fr: "Photo ajoutee a l'etape!", de: "Foto zum Schritt hinzugefuegt!", es: "Foto anadida al paso!" },
    "toast.pdfGenerating": { en: "Generating PDF...", it: "Generazione PDF in corso...", fr: "Generation du PDF...", de: "PDF wird erstellt...", es: "Generando PDF..." },
    "toast.pdfDone": { en: "PDF downloaded!", it: "PDF scaricato!", fr: "PDF telecharge!", de: "PDF heruntergeladen!", es: "PDF descargado!" },
    "toast.pdfError": { en: "Error generating PDF", it: "Errore nella generazione del PDF", fr: "Erreur de generation du PDF", de: "Fehler bei der PDF-Erstellung", es: "Error al generar el PDF" },
    "editor.newRecipe": { en: "New Recipe", it: "Nuova Ricetta", fr: "Nouvelle Recette", de: "Neues Rezept", es: "Nueva Receta" },
    "editor.editRecipe": { en: "Edit Recipe", it: "Modifica Ricetta", fr: "Modifier Recette", de: "Rezept bearbeiten", es: "Editar Receta" },
    "editor.saveRecipe": { en: "Save Recipe", it: "Salva Ricetta", fr: "Enregistrer Recette", de: "Rezept speichern", es: "Guardar Receta" },
    "editor.addPhoto": { en: "Add photo", it: "Aggiungi foto", fr: "Ajouter photo", de: "Foto hinzufuegen", es: "Anadir foto" },
    "editor.recipeName": { en: "Recipe name...", it: "Nome della ricetta...", fr: "Nom de la recette...", de: "Rezeptname...", es: "Nombre de la receta..." },
    "editor.info": { en: "Information", it: "Informazioni", fr: "Informations", de: "Informationen", es: "Informacion" },
    "editor.category": { en: "Category", it: "Categoria", fr: "Categorie", de: "Kategorie", es: "Categoria" },
    "editor.selectCategory": { en: "-- Select --", it: "-- Seleziona --", fr: "-- Selectionner --", de: "-- Auswaehlen --", es: "-- Seleccionar --" },
    "editor.difficulty": { en: "Difficulty", it: "Difficolta", fr: "Difficulte", de: "Schwierigkeit", es: "Dificultad" },
    "editor.prepTime": { en: "Preparation (min)", it: "Preparazione (min)", fr: "Preparation (min)", de: "Vorbereitung (Min)", es: "Preparacion (min)" },
    "editor.cookTime": { en: "Cooking (min)", it: "Cottura (min)", fr: "Cuisson (min)", de: "Kochzeit (Min)", es: "Coccion (min)" },
    "editor.dosesServings": { en: "Doses & Servings", it: "Dosi e Porzioni", fr: "Doses et Portions", de: "Mengen & Portionen", es: "Dosis y Porciones" },
    "editor.servings": { en: "Servings", it: "Porzioni", fr: "Portions", de: "Portionen", es: "Porciones" },
    "editor.servingWeight": { en: "Serving weight (g)", it: "Peso porzione (g)", fr: "Poids portion (g)", de: "Portionsgewicht (g)", es: "Peso porcion (g)" },
    "editor.rating": { en: "Rating", it: "Valutazione", fr: "Evaluation", de: "Bewertung", es: "Valoracion" },
    "editor.ingredients": { en: "Ingredients", it: "Ingredienti", fr: "Ingredients", de: "Zutaten", es: "Ingredientes" },
    "editor.addIngredient": { en: "Add ingredient", it: "Aggiungi ingrediente", fr: "Ajouter ingredient", de: "Zutat hinzufuegen", es: "Anadir ingrediente" },
    "editor.ingredientPlaceholder": { en: "Ingredient...", it: "Ingrediente...", fr: "Ingredient...", de: "Zutat...", es: "Ingrediente..." },
    "editor.qty": { en: "Qty", it: "Qta", fr: "Qte", de: "Mng", es: "Cant" },
    "editor.preparations": { en: "Preparations", it: "Preparazioni", fr: "Preparations", de: "Zubereitungen", es: "Preparaciones" },
    "editor.newSection": { en: "New Section", it: "Nuova Sezione", fr: "Nouvelle Section", de: "Neuer Abschnitt", es: "Nueva Seccion" },
    "editor.sectionName": { en: "Section name...", it: "Nome sezione...", fr: "Nom section...", de: "Abschnittsname...", es: "Nombre seccion..." },
    "editor.ingredientsUsed": { en: "Ingredients used", it: "Ingredienti usati", fr: "Ingredients utilises", de: "Verwendete Zutaten", es: "Ingredientes usados" },
    "editor.steps": { en: "Steps", it: "Passaggi", fr: "Etapes", de: "Schritte", es: "Pasos" },
    "editor.describeStep": { en: "Describe this step...", it: "Descrivi questo passaggio...", fr: "Decrivez cette etape...", de: "Beschreiben Sie diesen Schritt...", es: "Describa este paso..." },
    "editor.addStep": { en: "Add step", it: "Aggiungi passaggio", fr: "Ajouter etape", de: "Schritt hinzufuegen", es: "Anadir paso" },
    "editor.photo": { en: "Photo", it: "Foto", fr: "Photo", de: "Foto", es: "Foto" },
    "editor.notes": { en: "Notes", it: "Note", fr: "Notes", de: "Notizen", es: "Notas" },
    "editor.notesPlaceholder": { en: "Tips, variants, notes...", it: "Consigli, varianti, appunti...", fr: "Conseils, variantes, notes...", de: "Tipps, Varianten, Notizen...", es: "Consejos, variantes, notas..." },
    "editor.removeIngredient": { en: "Remove ingredient", it: "Rimuovi ingrediente", fr: "Supprimer ingredient", de: "Zutat entfernen", es: "Eliminar ingrediente" },
    "editor.removeSection": { en: "Remove section", it: "Rimuovi sezione", fr: "Supprimer section", de: "Abschnitt entfernen", es: "Eliminar seccion" },
    "editor.removeStep": { en: "Remove step", it: "Rimuovi passaggio", fr: "Supprimer etape", de: "Schritt entfernen", es: "Eliminar paso" },
    "editor.removeStepPhoto": { en: "Remove photo", it: "Rimuovi foto", fr: "Supprimer photo", de: "Foto entfernen", es: "Eliminar foto" },
    "editor.addStep": { en: "Add step", it: "Aggiungi passaggio", fr: "Ajouter etape", de: "Schritt hinzufuegen", es: "Anadir paso" },
    "editor.unsavedChanges": { en: "Are you sure? Unsaved changes will be lost.", it: "Sei sicuro? Le modifiche non salvate andranno perse.", fr: "Etes-vous sur? Les modifications non enregistrees seront perdues.", de: "Sind Sie sicher? Nicht gespeicherte Aenderungen gehen verloren.", es: "Esta seguro? Los cambios no guardados se perderan." },
    "editor.preparation": { en: "Preparation", it: "Preparazione", fr: "Preparation", de: "Zubereitung", es: "Preparacion" },
    "editor.newSectionName": { en: "New section", it: "Nuova sezione", fr: "Nouvelle section", de: "Neuer Abschnitt", es: "Nueva seccion" },
    "import.title": { en: "Import from Web", it: "Importa dal Web", fr: "Importer du Web", de: "Aus dem Web importieren", es: "Importar de la Web" },
    "import.placeholder": { en: "Paste recipe URL...", it: "Incolla URL della ricetta...", fr: "Collez l'URL de la recette...", de: "Rezept-URL einfuegen...", es: "Pegar URL de la receta..." },
    "import.button": { en: "Import", it: "Importa", fr: "Importer", de: "Importieren", es: "Importar" },
    "import.loading": { en: "Importing recipe with AI...", it: "Importazione ricetta con AI...", fr: "Importation avec IA...", de: "Rezept wird mit KI importiert...", es: "Importando receta con IA..." },
    "import.success": { en: "Recipe imported successfully!", it: "Ricetta importata con successo!", fr: "Recette importee avec succes!", de: "Rezept erfolgreich importiert!", es: "Receta importada con exito!" },
    "import.error": { en: "Error importing recipe. Check the URL and try again.", it: "Errore nell'importazione. Controlla l'URL e riprova.", fr: "Erreur d'importation. Verifiez l'URL et reessayez.", de: "Fehler beim Importieren. Ueberpruefen Sie die URL.", es: "Error al importar. Verifique la URL e intentelo de nuevo." },
    "import.enterUrl": { en: "Enter a valid URL", it: "Inserisci un URL valido", fr: "Entrez une URL valide", de: "Geben Sie eine gueltige URL ein", es: "Ingrese una URL valida" },
    "view.recalcDoses": { en: "Recalculate Doses", it: "Ricalcola Dosi", fr: "Recalculer Doses", de: "Mengen neu berechnen", es: "Recalcular Dosis" },
    "view.originalRecipe": { en: "Original recipe", it: "Ricetta originale", fr: "Recette originale", de: "Originalrezept", es: "Receta original" },
    "view.youWant": { en: "You want", it: "Tu vuoi", fr: "Vous voulez", de: "Sie moechten", es: "Usted quiere" },
    "view.servings": { en: "Servings", it: "Porzioni", fr: "Portions", de: "Portionen", es: "Porciones" },
    "view.servingWeight": { en: "Serving weight (g)", it: "Peso porzione (g)", fr: "Poids portion (g)", de: "Portionsgewicht (g)", es: "Peso porcion (g)" },
    "view.totalWeight": { en: "Total weight", it: "Peso totale", fr: "Poids total", de: "Gesamtgewicht", es: "Peso total" },
    "view.servingWeightLabel": { en: "Serving weight", it: "Peso porzione", fr: "Poids portion", de: "Portionsgewicht", es: "Peso porcion" },
    "view.recalculate": { en: "Recalculate", it: "Ricalcola", fr: "Recalculer", de: "Neu berechnen", es: "Recalcular" },
    "view.resetDoses": { en: "Reset to original doses", it: "Torna alle dosi originali", fr: "Retour aux doses originales", de: "Originalmengen wiederherstellen", es: "Volver a dosis originales" },
    "view.ingredients": { en: "Ingredients", it: "Ingredienti", fr: "Ingredients", de: "Zutaten", es: "Ingredientes" },
    "view.noIngredients": { en: "No ingredients", it: "Nessun ingrediente", fr: "Aucun ingredient", de: "Keine Zutaten", es: "Sin ingredientes" },
    "view.preparation": { en: "Preparation", it: "Preparazione", fr: "Preparation", de: "Zubereitung", es: "Preparacion" },
    "view.noSteps": { en: "No steps", it: "Nessun passaggio", fr: "Aucune etape", de: "Keine Schritte", es: "Sin pasos" },
    "view.notes": { en: "Notes", it: "Note", fr: "Notes", de: "Notizen", es: "Notas" },
    "view.share": { en: "Share", it: "Condividi", fr: "Partager", de: "Teilen", es: "Compartir" },
    "view.shareText": { en: "Try this recipe: ", it: "Prova questa ricetta: ", fr: "Essayez cette recette: ", de: "Probieren Sie dieses Rezept: ", es: "Pruebe esta receta: " },
    "view.printPdf": { en: "Print PDF", it: "Stampa PDF", fr: "Imprimer PDF", de: "PDF drucken", es: "Imprimir PDF" },
    "view.edit": { en: "Edit", it: "Modifica", fr: "Modifier", de: "Bearbeiten", es: "Editar" },
    "view.notFoundTitle": { en: "Recipe not found", it: "Ricetta non trovata", fr: "Recette non trouvee", de: "Rezept nicht gefunden", es: "Receta no encontrada" },
    "view.backHome": { en: "Back to Home", it: "Torna alla Home", fr: "Retour a l'accueil", de: "Zurueck zur Startseite", es: "Volver al inicio" },
    "view.errorLoading": { en: "An error occurred. Try again.", it: "Si e verificato un errore. Riprova.", fr: "Une erreur est survenue. Reessayez.", de: "Ein Fehler ist aufgetreten. Versuchen Sie es erneut.", es: "Se produjo un error. Intentelo de nuevo." },
    "view.loadingError": { en: "Loading error", it: "Errore nel caricamento", fr: "Erreur de chargement", de: "Ladefehler", es: "Error de carga" },
    "view.prep": { en: "prep", it: "prep", fr: "prep", de: "Vorb", es: "prep" },
    "view.cooking": { en: "cooking", it: "cottura", fr: "cuisson", de: "Kochen", es: "coccion" },
    "view.servingsLabel": { en: "servings", it: "porzioni", fr: "portions", de: "Portionen", es: "porciones" },
    "view.na": { en: "N/A", it: "N/D", fr: "N/D", de: "k.A.", es: "N/D" },
    "view.decreaseServings": { en: "Decrease servings", it: "Diminuisci porzioni", fr: "Diminuer portions", de: "Portionen verringern", es: "Disminuir porciones" },
    "view.increaseServings": { en: "Increase servings", it: "Aumenta porzioni", fr: "Augmenter portions", de: "Portionen erhoehen", es: "Aumentar porciones" },
    "ai.title": { en: "AI Chef Assistant", it: "Assistente Chef AI", fr: "Assistant Chef IA", de: "KI-Kochassistent", es: "Asistente Chef IA" },
    "ai.welcome": { en: "Ask me anything about the recipe", it: "Chiedimi qualsiasi cosa sulla ricetta", fr: "Demandez-moi tout sur la recette", de: "Fragen Sie mich alles zum Rezept", es: "Pregunteme lo que quiera sobre la receta" },
    "ai.placeholder": { en: "Ask the chef assistant...", it: "Chiedi all'assistente chef...", fr: "Demandez a l'assistant chef...", de: "Fragen Sie den Kochassistenten...", es: "Pregunte al asistente chef..." },
    "ai.send": { en: "Send message", it: "Invia messaggio", fr: "Envoyer message", de: "Nachricht senden", es: "Enviar mensaje" },
    "ai.vegan": { en: "Vegan variant", it: "Variante vegana", fr: "Variante vegan", de: "Vegane Variante", es: "Variante vegana" },
    "ai.lactoseFree": { en: "Lactose free", it: "Senza lattosio", fr: "Sans lactose", de: "Laktosefrei", es: "Sin lactosa" },
    "ai.glutenFree": { en: "Gluten free", it: "Senza glutine", fr: "Sans gluten", de: "Glutenfrei", es: "Sin gluten" },
    "ai.cookingTips": { en: "Cooking tips", it: "Consigli di cottura", fr: "Conseils de cuisson", de: "Kochtipps", es: "Consejos de coccion" },
    "ai.storage": { en: "How to store this recipe?", it: "Come conservo questa ricetta?", fr: "Comment conserver cette recette?", de: "Wie bewahre ich dieses Rezept auf?", es: "Como conservar esta receta?" },
    "ai.wine": { en: "Wine pairing", it: "Abbinamento vini", fr: "Accord vin", de: "Weinempfehlung", es: "Maridaje de vinos" },
    "comments.title": { en: "Comments & Ratings", it: "Commenti e Valutazioni", fr: "Commentaires et Notes", de: "Kommentare & Bewertungen", es: "Comentarios y Valoraciones" },
    "comments.placeholder": { en: "Write a comment...", it: "Scrivi un commento...", fr: "Ecrivez un commentaire...", de: "Schreiben Sie einen Kommentar...", es: "Escriba un comentario..." },
    "comments.submit": { en: "Submit", it: "Invia", fr: "Envoyer", de: "Absenden", es: "Enviar" },
    "comments.loginRequired": { en: "Sign in to comment", it: "Accedi per commentare", fr: "Connectez-vous pour commenter", de: "Melden Sie sich an um zu kommentieren", es: "Inicie sesion para comentar" },
    "comments.noComments": { en: "No comments yet. Be the first!", it: "Nessun commento ancora. Sii il primo!", fr: "Aucun commentaire. Soyez le premier!", de: "Noch keine Kommentare. Seien Sie der Erste!", es: "Sin comentarios aun. Sea el primero!" },
    "comments.deleteConfirm": { en: "Delete this comment?", it: "Eliminare questo commento?", fr: "Supprimer ce commentaire?", de: "Diesen Kommentar loeschen?", es: "Eliminar este comentario?" },
    "comments.added": { en: "Comment added!", it: "Commento aggiunto!", fr: "Commentaire ajoute!", de: "Kommentar hinzugefuegt!", es: "Comentario anadido!" },
    "comments.deleted": { en: "Comment deleted", it: "Commento eliminato", fr: "Commentaire supprime", de: "Kommentar geloescht", es: "Comentario eliminado" },
    "comments.rateFirst": { en: "Please add a rating", it: "Aggiungi una valutazione", fr: "Ajoutez une note", de: "Bitte bewerten Sie", es: "Agregue una valoracion" },
    "units.title": { en: "Unit System", it: "Sistema di misura", fr: "Systeme de mesure", de: "Masseinheiten", es: "Sistema de medidas" },
    "units.metric": { en: "Metric", it: "Metrico", fr: "Metrique", de: "Metrisch", es: "Metrico" },
    "units.imperial": { en: "Imperial", it: "Imperiale", fr: "Imperial", de: "Imperial", es: "Imperial" },
    "nutrition.title": { en: "Nutrition per serving", it: "Valori nutrizionali per porzione", fr: "Nutrition par portion", de: "Naehrwerte pro Portion", es: "Nutricion por porcion" },
    "nutrition.calories": { en: "Calories", it: "Calorie", fr: "Calories", de: "Kalorien", es: "Calorias" },
    "nutrition.fat": { en: "Fat", it: "Grassi", fr: "Lipides", de: "Fett", es: "Grasas" },
    "nutrition.carbs": { en: "Carbs", it: "Carboidrati", fr: "Glucides", de: "Kohlenhydrate", es: "Carbohidratos" },
    "nutrition.protein": { en: "Protein", it: "Proteine", fr: "Proteines", de: "Protein", es: "Proteinas" },
    "nutrition.fiber": { en: "Fiber", it: "Fibre", fr: "Fibres", de: "Ballaststoffe", es: "Fibra" },
    "nutrition.sugar": { en: "Sugar", it: "Zuccheri", fr: "Sucres", de: "Zucker", es: "Azucares" },
    "nutrition.calculating": { en: "Calculating nutrition...", it: "Calcolo valori nutrizionali...", fr: "Calcul des valeurs nutritionnelles...", de: "Naehrwerte werden berechnet...", es: "Calculando valores nutricionales..." },
    "nutrition.estimate": { en: "AI Estimate", it: "Stima AI", fr: "Estimation IA", de: "KI-Schaetzung", es: "Estimacion IA" },
    "nutrition.calculate": { en: "Calculate Nutrition", it: "Calcola Valori Nutrizionali", fr: "Calculer Nutrition", de: "Naehrwerte berechnen", es: "Calcular Nutricion" },
    "nutrition.perServing": { en: "per serving", it: "per porzione", fr: "par portion", de: "pro Portion", es: "por porcion" }
};

// ========================================
// I18N FUNCTIONS
// ========================================

function t(key, replacements) {
    var entry = translations[key];
    if (!entry) return key;
    var text = entry[currentLanguage] || entry["en"] || key;
    if (replacements) {
        for (var rKey in replacements) {
            text = text.replace("{" + rKey + "}", replacements[rKey]);
        }
    }
    return text;
}

function setLanguage(lang) {
    if (["en", "it", "fr", "de", "es"].indexOf(lang) === -1) lang = "en";
    currentLanguage = lang;
    localStorage.setItem(I18N_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    if (typeof applyTranslations === "function") applyTranslations();
}

function getLanguage() {
    return currentLanguage;
}

function getLanguageName(code) {
    var names = { en: "English", it: "Italiano", fr: "Francais", de: "Deutsch", es: "Espanol" };
    return names[code] || code;
}

function getLanguageFlag(code) {
    var flags = { en: "🇬🇧", it: "🇮🇹", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸" };
    return flags[code] || "";
}

function getAllLanguages() {
    return [
        { code: "en", name: "English", flag: "🇬🇧" },
        { code: "it", name: "Italiano", flag: "🇮🇹" },
        { code: "fr", name: "Francais", flag: "🇫🇷" },
        { code: "de", name: "Deutsch", flag: "🇩🇪" },
        { code: "es", name: "Espanol", flag: "🇪🇸" }
    ];
}

// Category name translation helper
function getCategoryName(catKey) {
    var tKey = "cat." + catKey;
    if (translations[tKey]) return t(tKey);
    return catKey;
}

// Difficulty translation helper
function getDifficultyName(level) {
    var keys = ["", "diff.easy", "diff.medium", "diff.hard"];
    return keys[level] ? t(keys[level]) : "";
}

// Build language selector HTML
function buildLanguageSelector() {
    var langs = getAllLanguages();
    var html = '<div class="language-selector">';
    html += '<button class="lang-current" onclick="toggleLangDropdown()" aria-label="Change language">';
    html += getLanguageFlag(currentLanguage) + ' <span class="lang-code">' + currentLanguage.toUpperCase() + '</span>';
    html += ' <i class="fas fa-chevron-down"></i></button>';
    html += '<div class="lang-dropdown" id="langDropdown">';
    for (var i = 0; i < langs.length; i++) {
        var l = langs[i];
        var active = l.code === currentLanguage ? " active" : "";
        html += '<button class="lang-option' + active + '" onclick="changeLanguage(\'' + l.code + '\')">';
        html += l.flag + ' ' + l.name + '</button>';
    }
    html += '</div></div>';
    return html;
}

function toggleLangDropdown() {
    var dd = document.getElementById("langDropdown");
    if (dd) dd.classList.toggle("open");
}

function changeLanguage(code) {
    setLanguage(code);
    var dd = document.getElementById("langDropdown");
    if (dd) dd.classList.remove("open");
    // Reload page to apply all translations
    window.location.reload();
}

// Close dropdown when clicking outside
document.addEventListener("click", function(e) {
    if (!e.target.closest(".language-selector")) {
        var dd = document.getElementById("langDropdown");
        if (dd) dd.classList.remove("open");
    }
});
