import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Annonces lecteur d'écran en français (dnd-kit les fournit en anglais par défaut).
const accessibility = {
    screenReaderInstructions: {
        draggable:
            'Pour déplacer une photo, appuyez sur Espace ou Entrée, utilisez les flèches, puis Espace ou Entrée pour la déposer. Échap pour annuler.',
    },
    announcements: {
        onDragStart: ({ active }) => `Photo ${active.data.current?.position} saisie.`,
        onDragOver: ({ over }) => (over ? `Au-dessus de la position ${over.data.current?.position}.` : ''),
        onDragEnd: ({ over }) => (over ? `Photo déposée en position ${over.data.current?.position}.` : 'Photo déposée.'),
        onDragCancel: () => 'Déplacement annulé.',
    },
};

/**
 * Grille de photos réorganisable par glisser-déposer (souris, tactile et clavier).
 * La première photo est la photo principale de la galerie.
 *
 * @param {{ items: Array<{id: string|number, url: string, alt?: string}>, onReorder: (items: any[]) => void, onRemove?: (item) => void, disabled?: boolean }} props
 */
export default function SortableImageGrid({ items, onReorder, onRemove, disabled = false }) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const from = items.findIndex((i) => i.id === active.id);
        const to = items.findIndex((i) => i.id === over.id);
        onReorder(arrayMove(items, from, to));
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={accessibility}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy} disabled={disabled}>
                <div className="sortable-grid">
                    {items.map((item, index) => (
                        <SortableTile key={item.id} item={item} position={index + 1} onRemove={onRemove} disabled={disabled} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableTile({ item, position, onRemove, disabled }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
        data: { position },
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`sortable-item${isDragging ? ' dragging' : ''}`}
        >
            <div className="handle" {...attributes} {...listeners} aria-label={`Photo ${position}, déplacer`}>
                <div className="ratio-portrait">
                    <img src={item.url} alt={item.alt ?? ''} className="object-cover" draggable="false" />
                </div>
                <div className="d-flex align-items-center justify-content-between px-2 py-1 small text-muted-brand">
                    <span><i className="bi bi-grip-vertical" /> Glisser</span>
                    {item.progress !== undefined && item.progress < 100 && <span>{item.progress} %</span>}
                </div>
            </div>
            <span className={`badge position ${position === 1 ? 'text-bg-dark' : 'text-bg-light'}`}>
                {position === 1 ? 'Principale' : position}
            </span>
            {onRemove && (
                <button
                    type="button"
                    className="remove"
                    onClick={() => onRemove(item)}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={`Supprimer la photo ${position}`}
                    disabled={disabled}
                >
                    <i className="bi bi-trash3" />
                </button>
            )}
        </div>
    );
}
