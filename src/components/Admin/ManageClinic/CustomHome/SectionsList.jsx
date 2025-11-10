import React, { useMemo, useState } from "react";
import SectionRow from "./SectionRow";
import { Save } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Utils
 */
function ensureHeroFirst(list) {
  const copy = [...list];
  const heroIdx = copy.findIndex((s) => s.id === "hero");
  if (heroIdx > 0) {
    const [h] = copy.splice(heroIdx, 1);
    copy.unshift({ ...h, locked: true, visible: true });
  }
  return copy;
}

export default function SectionsList({
  sections,
  setSections,
  colors,
  compact = false,
  onSave,
  /** Optionnel: la liste canonique pour corriger les préréglages */
  catalog = [
    { id: "hero", label: "Hero", locked: true, visible: true },
    { id: "invite", label: "Carte connexion", visible: true },
    { id: "about", label: "À propos", visible: true },
    { id: "services", label: "Nos services", visible: true },
    { id: "contact", label: "Nous contacter", visible: true },
    { id: "tarifs", label: "Nos tarifs", visible: true },
    { id: "medecins", label: "Nos médecins", visible: true },
    { id: "faq", label: "FAQ", visible: true },
    { id: "gallery", label: "Galerie d’images", visible: true },
  ],
}) {
  const [dragId, setDragId] = useState(null);

  // dnd-kit sensors (meilleure prise en main sur mobile/souris)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);

  /** Appelle ceci pour appliquer un préréglage “visibilité” tout en gardant l’ordre canonique,
   *  et en ré-affichant bien les items retirés auparavant. */
  const applyPresetVisible = (visibleIds = []) => {
    // 1) Repartir de l’ordre canonique (catalog)
    const ordered = catalog.map((c) => {
      const current = sections.find((s) => s.id === c.id);
      // garder les labels existants si personnalisés
      return {
        ...c,
        ...(current || {}),
        visible: c.id === "hero" ? true : visibleIds.includes(c.id),
        locked: c.id === "hero" ? true : !!current?.locked,
      };
    });
    setSections(ensureHeroFirst(ordered));
  };

  const onDragStart = (e) => setDragId(e.active.id);

  const onDragEnd = (e) => {
    setDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const startIndex = sections.findIndex((s) => s.id === active.id);
    const endIndex = sections.findIndex((s) => s.id === over.id);
    if (startIndex === -1 || endIndex === -1) return;

    // Empêcher déplacer le hero
    if (sections[startIndex]?.id === "hero") return;

    const moved = arrayMove(sections, startIndex, endIndex);
    setSections(ensureHeroFirst(moved));
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragId(null)}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className={compact ? "space-y-1.5" : "space-y-2"}>
            {sections.map((sec, idx) => (
              <SortableRow
                key={sec.id}
                id={sec.id}
                index={idx}
                section={sec}
                colors={colors}
                compact={compact}
                dragging={dragId === sec.id}
                onToggle={() =>
                  setSections((s) =>
                    s.map((it, i) =>
                      i === idx ? { ...it, visible: it.locked ? true : !it.visible } : it
                    )
                  )
                }
                onUp={() => {
                  if (idx <= 1) return;
                  setSections((s) => {
                    const a = [...s];
                    [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
                    return ensureHeroFirst(a);
                  });
                }}
                onDown={() => {
                  if (idx <= 0 || idx >= sections.length - 1 || sections[idx].id === "hero") return;
                  setSections((s) => {
                    const a = [...s];
                    [a[idx + 1], a[idx]] = [a[idx], a[idx + 1]];
                    return ensureHeroFirst(a);
                  });
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="mt-3 flex flex-wrap items-center gap-2 justify-end">
        {/* Exemples d’utilisation du correctif préréglages */}
        <button
          type="button"
          onClick={() =>
            applyPresetVisible(["services", "contact"]) // Minimal
          } 
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          Minimal
        </button>
        <button
          type="button"
          onClick={() =>
            applyPresetVisible(catalog.map((c) => c.id).filter((id) => id !== "hero")) // Tout afficher (hors hero déjà visible)
          }
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          Tout afficher
        </button>

        <button
          type="button"
          onClick={onSave}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow"
          style={{ backgroundColor: colors?.primary || "#3b82f6" }}
        >
          <Save className="w-4 h-4" /> Enregistrer l’ordre
        </button>
      </div>
    </div>
  );
}

//Ligne draggable
function SortableRow({ id, index, section, colors, compact, dragging, ...rowProps }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !!section.locked, // hero non-draggable
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <SectionRow
        index={index}
        section={section}
        colors={colors}
        compact={compact}
        dragging={dragging || isDragging}
        dragHandleProps={{ ...attributes, ...listeners }} // handle sur l’icône
        {...rowProps}
      />
    </li>
  );
}
