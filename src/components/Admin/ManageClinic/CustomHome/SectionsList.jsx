import React, { useMemo, useState, useEffect } from "react";
import SectionRow from "./SectionRow";
import { Save, Loader } from "lucide-react";
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
import { useClinic } from "../../../../context/clinicContext";
import api from "../../../../api/axios";
import toast from "react-hot-toast";
import { default_sections } from "../../../../utils/clinicDefaults";


// Pour que le hero reste premier
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
  colors,
  compact = true,

}) {
  const [dragId, setDragId] = useState(null);
  const { clinic, setClinic } = useClinic();
  const [sections, setSections] = useState([]); 
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    if (clinic?.sections && clinic.sections.length) {
      setSections(clinic.sections);
    } else {
      setSections(
        ensureHeroFirst(default_sections.map((c) => ({ ...c, visible: c.id === "hero" ? true : !!c.visible })))
      );
    }
  }, [clinic]);

  // Pour dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // use the controlled props when provided, otherwise use local state
  const currentSections = sections;
  const currentSetSections = setSections;

  const ids = useMemo(() => (currentSections || []).map((s) => s.id), [currentSections]);

  const onDragStart = (e) => setDragId(e.active.id);

  const onDragEnd = (e) => {
    setDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const startIndex = (currentSections || []).findIndex((s) => s.id === active.id);
    const endIndex = (currentSections || []).findIndex((s) => s.id === over.id);
    if (startIndex === -1 || endIndex === -1) return;

    // Empêcher déplacer le hero
    if ((currentSections || [])[startIndex]?.id === "hero") return;

    const moved = arrayMove(currentSections, startIndex, endIndex);
    currentSetSections(ensureHeroFirst(moved));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { sections: currentSections };
      const response = await api.patch(`/api/clinics/${clinic.id}/`, payload);
      if (response.status === 200 && response.data) {
        setClinic(response.data.data);
        toast.success("Ordre des sections sauvegardé");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde sections:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => () => {
    setSections(
      ensureHeroFirst(default_sections.map((c) => ({ ...c, visible: c.id === "hero" ? true : !!c.visible })))
    ).then(() => {
          // Then save
    handleSave();
    });

 

   
  }

  return (
    <>
         <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-slate-500">Activez/masquez et ré-ordonnez. Le Hero reste toujours en premier.</p>
          <button
            type="button"
            onClick={handleReset()}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
            disabled={loading}
          >
            Réinitialiser
          </button>
        </div>

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
            {(currentSections || []).map((sec, idx) => (
              <SortableRow
                key={sec.id}
                id={sec.id}
                index={idx}
                section={sec}
                colors={colors}
                compact={compact}
                dragging={dragId === sec.id}
                onToggle={() =>
                    currentSetSections((s) =>
                      s.map((it, i) =>
                        i === idx ? { ...it, visible: it.locked ? true : !it.visible } : it
                      )
                    )
                }
                onUp={() => {
                  if (idx <= 1) return;
                    currentSetSections((s) => {
                      const a = [...s];
                      [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
                      return ensureHeroFirst(a);
                    });
                }}
                onDown={() => {
                  if (idx <= 0 || idx >= (currentSections || []).length - 1 || (currentSections || [])[idx].id === "hero") return;
                    currentSetSections((s) => {
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
        <button
          type="button"
          onClick={handleSave}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow"
          style={{ backgroundColor: colors?.primary || "#3b82f6" }}
          disabled={loading}
        >
          {!loading ? (
            <>
              <Save className="w-4 h-4" /> Enregistrer l’ordre
            </>
          ) : (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Sauvegarde...
            </>
          )}
        </button>
      </div>
    </div>
    </>
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
