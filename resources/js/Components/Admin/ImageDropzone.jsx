import { useId, useRef, useState } from 'react';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_SIZE = 2 * 1024 * 1024; // identique à la règle Laravel max:2048

/** Sépare les fichiers acceptés des refusés (même règles que le serveur, pour un retour immédiat). */
export function checkFiles(fileList) {
    const accepted = [];
    const rejected = [];
    for (const file of fileList) {
        if (!ACCEPTED_TYPES.includes(file.type)) rejected.push(`${file.name} : format non accepté (JPG, PNG ou WebP)`);
        else if (file.size > MAX_SIZE) rejected.push(`${file.name} : fichier trop lourd (2 Mo maximum)`);
        else accepted.push(file);
    }
    return { accepted, rejected };
}

// Marge pour les autres champs du formulaire et l'enveloppe multipart.
const REQUEST_OVERHEAD = 256 * 1024;

/** Limite utile pour les fichiers d'une requête (null = pas de limite connue). */
export function usableUploadBytes(postMaxBytes) {
    return postMaxBytes ? Math.max(postMaxBytes - REQUEST_OVERHEAD, MAX_SIZE) : null;
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

export const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;

/** Zone de dépôt + sélecteur de fichiers (plusieurs photos à la fois). */
export default function ImageDropzone({ onFiles, disabled = false, hint }) {
    const inputId = useId();
    const inputRef = useRef(null);
    const [over, setOver] = useState(false);

    const handle = (files) => {
        if (files?.length) onFiles([...files]);
    };

    return (
        <div
            className={`dropzone${over ? ' over' : ''}`}
            onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                if (!disabled) handle(e.dataTransfer.files);
            }}
            onClick={() => !disabled && inputRef.current?.click()}
        >
            <i className="bi bi-cloud-arrow-up fs-2 text-muted-brand" aria-hidden="true" />
            <div className="mt-1">
                <label htmlFor={inputId} className="fw-medium" onClick={(e) => e.stopPropagation()} style={{ cursor: 'pointer' }}>
                    Ajouter des photos
                </label>{' '}
                ou glissez-les ici
            </div>
            <div className="small text-muted-brand">{hint ?? 'JPG, PNG ou WebP · 2 Mo maximum par photo'}</div>
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                className="visually-hidden"
                disabled={disabled}
                onChange={(e) => {
                    handle(e.target.files);
                    e.target.value = '';
                }}
            />
        </div>
    );
}
