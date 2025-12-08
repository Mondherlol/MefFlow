import { Pill, FileDown, X, Plus, Sparkles, Edit2, Save } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { searchMedicaments, formatMedicamentSuggestion } from "../../../data/medicaments";

export default function OrdonnanceEditor({ value, onChange, editMode, patientName, onEdit, onSave, onCancel, saving }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentLine, setCurrentLine] = useState("");
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Extraire le mot actuel à partir de la position du curseur
  const getCurrentWord = (text, position) => {
    const beforeCursor = text.substring(0, position);
    const lines = beforeCursor.split('\n');
    const currentLineText = lines[lines.length - 1];
    
    // Extraire le texte après le numéro de ligne (ex: "1. Para" -> "Para")
    const match = currentLineText.match(/^\d+\.\s*(.*)$/);
    if (match) {
      return match[1];
    }
    
    return currentLineText.trim();
  };

  // Calculer la position du curseur pour afficher les suggestions
  const updateSuggestionPosition = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const { selectionStart } = textarea;
    const text = textarea.value.substring(0, selectionStart);
    const lines = text.split('\n');
    
    // Créer un élément temporaire pour mesurer la position
    const tempDiv = document.createElement('div');
    const styles = window.getComputedStyle(textarea);
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      font: ${styles.font};
      padding: ${styles.padding};
      border: ${styles.border};
      width: ${textarea.clientWidth}px;
      line-height: ${styles.lineHeight};
    `;
    tempDiv.textContent = text;
    document.body.appendChild(tempDiv);
    
    const height = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    
    // Position relative au textarea
    const rect = textarea.getBoundingClientRect();
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    
    setSuggestionPosition({
      top: Math.min(height, textarea.scrollHeight - 50), // Position du curseur dans le textarea
      left: 0
    });
  };

  // Gérer les changements de texte
  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(position);
    
    // Rechercher des suggestions
    const currentWord = getCurrentWord(newValue, position);
    setCurrentLine(currentWord);
    
    if (currentWord.length >= 2) {
      const results = searchMedicaments(currentWord);
      setSuggestions(results);
      setSelectedIndex(0);
      updateSuggestionPosition();
    } else {
      setSuggestions([]);
    }
  };

  // Gérer la touche Entrée
  const handleKeyDown = (e) => {
    // Navigation dans les suggestions avec les flèches
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        if (suggestions.length > 0 && selectedIndex >= 0) {
          e.preventDefault();
          insertSuggestion(suggestions[selectedIndex]);
          return;
        }
      }
    }

    // Créer un nouveau point numéroté à l'entrée
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      
      const lines = value.split('\n');
      const lastLineNumber = lines.length > 0 
        ? parseInt(lines[lines.length - 1].match(/^(\d+)\./)?.[1] || '0') 
        : 0;
      
      const newLineNumber = lastLineNumber + 1;
      const newLine = `\n${newLineNumber}. `;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = value.substring(0, start) + newLine + value.substring(end);
      onChange(newValue);
      
      // Placer le curseur après le nouveau numéro
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + newLine.length;
        textarea.focus();
      }, 0);
    }
  };

  // Insérer une suggestion
  const insertSuggestion = (medicament) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Trouver le début de la ligne actuelle
    const lines = beforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLineText = lines[currentLineIndex];
    
    // Vérifier si la ligne commence par un numéro
    const match = currentLineText.match(/^(\d+\.\s*)/);
    const prefix = match ? match[1] : "";
    
    // Construire la nouvelle ligne avec le médicament formaté
    const suggestion = formatMedicamentSuggestion(medicament, true);
    const newLine = prefix + suggestion;
    
    // Remplacer la ligne actuelle
    const beforeLines = lines.slice(0, -1);
    const newValue = [...beforeLines, newLine].join('\n') + afterCursor;
    
    onChange(newValue);
    setSuggestions([]);
    
    // Placer le curseur à la fin de la suggestion
    setTimeout(() => {
      const newPosition = beforeLines.join('\n').length + (beforeLines.length > 0 ? 1 : 0) + newLine.length;
      textarea.selectionStart = textarea.selectionEnd = newPosition;
      textarea.focus();
    }, 0);
  };

  // Ajouter une ligne vide numérotée
  const addEmptyLine = () => {
    const lines = value.split('\n').filter(l => l.trim());
    const lastLineNumber = lines.length > 0 
      ? parseInt(lines[lines.length - 1].match(/^(\d+)\./)?.[1] || '0') 
      : 0;
    
    const newLineNumber = lastLineNumber + 1;
    const newValue = value + (value ? '\n' : '') + `${newLineNumber}. `;
    
    onChange(newValue);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newValue.length;
      }
    }, 0);
  };

  // Gérer le focus sur le textarea
  const handleFocus = () => {
    // Si l'ordonnance est vide, ajouter automatiquement "1. "
    if (!value || value.trim() === '') {
      onChange('1. ');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = 3;
        }
      }, 0);
    }
  };

  // Effacer tout
  const clearAll = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer toute l'ordonnance ?")) {
      onChange("");
      setSuggestions([]);
    }
  };

  const handleGeneratePDF = () => {
    // TODO: Implement PDF generation
    console.log("Generate PDF for:", patientName);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-900">Ordonnance</h2>
          {editMode && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Assistant actif
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={addEmptyLine}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition"
                title="Ajouter une ligne"
              >
                <Plus className="w-3 h-3" />
                Ligne
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                title="Tout effacer"
              >
                <X className="w-3 h-3" />
                Effacer
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </>
          ) : (
            <>
              {value && (
                <button
                  onClick={handleGeneratePDF}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition"
                >
                  <FileDown className="w-4 h-4" />
                  Générer PDF
                </button>
              )}
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            </>
          )}
        </div>
      </div>

      {editMode ? (
        <div className="space-y-3 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder="Commencez à taper le nom d'un médicament...&#10;&#10;💡 Astuces:&#10;• Appuyez sur Entrée pour ajouter une nouvelle ligne numérotée&#10;• Tapez 2+ lettres pour voir les suggestions&#10;• Utilisez ↑↓ pour naviguer, Tab/Entrée pour sélectionner"
              className="w-full h-64 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
              style={{ lineHeight: '1.8' }}
            />
            
            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-50 w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                style={{ 
                  top: `${suggestionPosition.top - 10}px`,
                  left: '12px',
                }}
              >
                <div className="p-2 bg-slate-50 border-b border-slate-200">
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Suggestions ({suggestions.length})
                  </div>
                </div>
                {suggestions.map((med, index) => (
                  <button
                    key={index}
                    onClick={() => insertSuggestion(med)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-3 py-2 hover:bg-sky-50 transition border-b border-slate-100 last:border-b-0 ${
                      index === selectedIndex ? 'bg-sky-50 border-l-2 border-l-sky-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {med.nom}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {med.dosages.join(', ')} • {med.frequences.join(', ')}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {med.categorie}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      {formatMedicamentSuggestion(med, true)}
                    </div>
                  </button>
                ))}
                <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
                  ↑↓ pour naviguer • Tab/Entrée pour sélectionner
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-slate-500">
              <span>{value.split('\n').filter(l => l.trim()).length} ligne(s)</span>
              {currentLine && (
                <span className="text-sky-600">
                  🔍 Recherche: "{currentLine}"
                </span>
              )}
            </div>
            <div className="text-slate-400">
              💡 Entrée = nouvelle ligne • Tab = accepter suggestion
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 min-h-40 font-mono whitespace-pre-wrap leading-relaxed">
          {value || (
            <div className="flex flex-col items-center justify-center h-32 font-sans">
              <Pill className="w-8 h-8 text-slate-300 mb-2" />
              <span className="text-slate-400">Aucune ordonnance rédigée</span>
            </div>
          )}
        </div>
      )}

      {!editMode && value && (
        <div className="mt-4 p-3 bg-slate-100 rounded-lg">
          <div className="text-xs text-slate-600">
            <strong>Note :</strong> L'ordonnance peut être générée en PDF pour impression ou envoi au patient
          </div>
        </div>
      )}
    </div>
  );
}
