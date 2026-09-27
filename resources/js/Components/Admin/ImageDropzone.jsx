import { useId, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { SERVER_MAX_BYTES } from '@/lib/imageCompress';

// Marge pour les autres champs du formulaire et l'enveloppe multipart.
const REQUEST_OVERHEAD = 256 * 1024;

/** Limite utile pour les fichiers d'une requête (null = pas de limite connue). */
export function usableUploadBytes(postMaxBytes) {
    return postMaxBytes ? Math.max(postMaxBytes - REQUEST_OVERHEAD, SERVER_MAX_BYTES) : null;
}

/** Regroupe les fichiers en lots qui tiennent chacun dans une requête. */
export function splitIntoBatches(files, postMaxBytes) {
    const limit = usableUploadBytes(postMaxBytes);
    if (!limit) return [files];

    const batches = [];
    let current = [];
    let size = 0;
    for (const file of files) {
        if (current.length && size + file.size > limit) {
            batches.push(current);
            current = [];
            size = 0;
        }
        current.push(file);
        size += file.size;
    }
    if (current.length) batches.push(current);
    return batches;
}

/** Zone de dépôt + sélecteur de fichiers (plusieurs photos à la fois). */
export default function ImageDropzone({ onFiles, disabled = false, processing = false, hint, multiple = true, label = 'Ajouter des photos' }) {
    const inputId = useId();
    const inputRef = useRef(null);
    const [over, setOver] = useState(false);
    const inactive = disabled || processing;

    const handle = (files) => {
        if (files?.length) onFiles([...files]);
    };

    return (
        <div
            className={`dropzone${over ? ' over' : ''}`}
            aria-busy={processing}
            onDragOver={(e) => {
                e.preventDefault();
                if (!inactive) setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                if (!inactive) handle(e.dataTransfer.files);
            }}
            onClick={() => !inactive && inputRef.current?.click()}
        >
            {processing ? (
                <div className="py-2" role="status">
                    <Spinner size="sm" className="me-2" />
                    Optimisation des photos…
                </div>
            ) : (
                <>
                    <i className="bi bi-cloud-arrow-up fs-2 text-muted-brand" aria-hidden="true" />
                    <div className="mt-1">
                        <label htmlFor={inputId} className="fw-medium" onClick={(e) => e.stopPropagation()} style={{ cursor: 'pointer' }}>
                            {label}
                        </label>{' '}
                        ou glissez-les ici
                    </div>
                    <div className="small text-muted-brand">
                        {hint ?? 'JPG, PNG, WebP ou photos de téléphone · les photos lourdes sont optimisées automatiquement'}
                    </div>
                </>
            )}
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                multiple={multiple}
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                className="visually-hidden"
                disabled={inactive}
                onChange={(e) => {
                    handle(e.target.files);
                    e.target.value = '';
                }}
            />
        </div>
    );
}
