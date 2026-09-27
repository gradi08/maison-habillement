import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, ProgressBar } from 'react-bootstrap';
import { formatMb, prepareImages } from '@/lib/imageCompress';
import { formatDuration, readVideoInfo, uploadVideoInChunks, VIDEO_TYPES } from '@/lib/videoUpload';

/**
 * Envoi d'un fichier vidéo : l'envoi démarre dès le choix du fichier (par morceaux, avec reprise),
 * pendant que tu remplis le reste du formulaire. Le format vertical, la durée et une image
 * d'aperçu sont détectés automatiquement.
 *
 * Remonte au formulaire : upload_id, is_vertical, duration, poster (File) et l'état « envoi en cours ».
 */
export default function VideoFileField({ current, maxMb, errors, onUploaded, onPoster, onBusyChange, onVertical }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [posterUrl, setPosterUrl] = useState(current?.thumbnail_url ?? null);
    const [progress, setProgress] = useState(null);
    const [state, setState] = useState(current?.file_url ? 'existing' : 'empty'); // empty | existing | uploading | done | error
    const [message, setMessage] = useState(null);
    const [warning, setWarning] = useState(null);
    const [info, setInfo] = useState(current?.duration ? { duration: current.duration } : null);
    const abort = useRef(null);
    const inputRef = useRef(null);
    const posterInputRef = useRef(null);

    // Quitter la page interrompt un envoi en cours (le serveur nettoie les envois abandonnés).
    useEffect(() => () => abort.current?.abort(), []);
    // Libère l'aperçu local précédent quand on choisit une autre vidéo.
    useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

    const pick = async (selected) => {
        if (!selected) return;
        setMessage(null);
        setWarning(null);

        const typeOk = VIDEO_TYPES.includes(selected.type) || /\.(mp4|m4v|webm|mov)$/i.test(selected.name);
        if (!typeOk) {
            setMessage('Format non accepté : envoyez une vidéo MP4, WebM ou MOV.');
            return;
        }
        if (selected.size > maxMb * 1024 * 1024) {
            setMessage(`La vidéo pèse ${formatMb(selected.size)} : la limite est de ${maxMb} Mo. Raccourcissez-la ou exportez-la en 1080p.`);
            return;
        }

        abort.current?.abort();
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
        onUploaded(null);

        // 1. Informations et aperçu (dans le navigateur, avant même l'envoi)
        const meta = await readVideoInfo(selected);
        setInfo(meta);
        if (meta.playable) {
            onVertical(meta.height > meta.width);
            if (meta.poster) {
                setPosterUrl(URL.createObjectURL(meta.poster));
                onPoster(meta.poster, meta.duration);
            }
        } else {
            setWarning("Ce navigateur ne sait pas lire cette vidéo (souvent un MOV d'iPhone dans Chrome). Elle risque de ne pas être lisible par tous les visiteurs : exportez-la plutôt en MP4. Pensez aussi à choisir une image d'aperçu.");
        }

        // 2. Envoi par morceaux
        const controller = new AbortController();
        abort.current = controller;
        setState('uploading');
        setProgress(0);
        onBusyChange(true);
        try {
            const id = await uploadVideoInChunks(selected, { onProgress: setProgress, signal: controller.signal });
            onUploaded(id);
            setState('done');
        } catch (error) {
            if (controller.signal.aborted) return;
            setState('error');
            setMessage(error.userMessage ?? "L'envoi a échoué. Vérifiez votre connexion puis réessayez.");
        } finally {
            if (abort.current === controller) onBusyChange(false);
        }
    };

    const pickPoster = async (selected) => {
        if (!selected) return;
        const { accepted, rejected } = await prepareImages([selected]);
        if (rejected.length) {
            setMessage(rejected[0]);
            return;
        }
        setPosterUrl(URL.createObjectURL(accepted[0]));
        onPoster(accepted[0], info?.duration ?? null);
    };

    const showVideo = previewUrl ?? current?.file_url;

    return (
        <div className="d-grid gap-3">
            {showVideo ? (
                <div className="d-flex flex-wrap gap-3 align-items-start">
                    <video
                        src={showVideo}
                        poster={posterUrl ?? undefined}
                        controls
                        playsInline
                        preload="metadata"
                        className="rounded bg-black"
                        style={{ width: '14rem', maxHeight: '22rem' }}
                    />
                    <div className="small flex-grow-1" style={{ minWidth: '14rem' }}>
                        <div className="fw-medium text-break">{file?.name ?? 'Vidéo actuelle'}</div>
                        <div className="text-muted-brand mb-2">
                            {[
                                (file?.size ?? current?.file_size) && formatMb(file?.size ?? current.file_size),
                                info?.duration && formatDuration(info.duration),
                                info?.width && `${info.width} × ${info.height}`,
                            ].filter(Boolean).join(' · ')}
                        </div>

                        {state === 'uploading' && (
                            <>
                                <ProgressBar now={progress ?? 0} label={`${progress ?? 0} %`} animated aria-label="Envoi de la vidéo" />
                                <div className="text-muted-brand mt-1">Envoi en cours : vous pouvez remplir le reste du formulaire.</div>
                            </>
                        )}
                        {state === 'done' && <div className="text-success"><i className="bi bi-check-circle me-1" />Vidéo envoyée. Enregistrez pour la publier.</div>}
                        {state === 'existing' && <div className="text-success"><i className="bi bi-check-circle me-1" />Vidéo en place sur le site.</div>}

                        <div className="d-flex flex-wrap gap-2 mt-3">
                            <Button size="sm" variant="outline-secondary" onClick={() => inputRef.current?.click()}>
                                <i className="bi bi-arrow-repeat me-1" />{state === 'error' ? 'Réessayer / choisir une autre vidéo' : 'Remplacer la vidéo'}
                            </Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => posterInputRef.current?.click()}>
                                <i className="bi bi-image me-1" />Choisir l'image d'aperçu
                            </Button>
                        </div>
                        {posterUrl && (
                            <div className="d-flex align-items-center gap-2 mt-2 text-muted-brand">
                                <img src={posterUrl} alt="" className="thumb-sm" /> Image d'aperçu (affichée avant la lecture)
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <button type="button" className="dropzone w-100" onClick={() => inputRef.current?.click()}>
                    <i className="bi bi-camera-video fs-2 text-muted-brand" aria-hidden="true" />
                    <div className="mt-1 fw-medium">Choisir la vidéo</div>
                    <div className="small text-muted-brand">MP4 (recommandé), WebM ou MOV · {maxMb} Mo maximum</div>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov"
                className="visually-hidden"
                onChange={(e) => {
                    pick(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />
            <input
                ref={posterInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                className="visually-hidden"
                onChange={(e) => {
                    pickPoster(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />

            {warning && <Alert variant="warning" className="small mb-0">{warning}</Alert>}
            {(message || errors.upload_id || errors.poster) && (
                <Alert variant="danger" className="small mb-0">{message ?? errors.upload_id ?? errors.poster}</Alert>
            )}
            <Form.Text>
                La vidéo est enregistrée sur le site : elle occupe de l'espace sur l'hébergement. Une vidéo de 30 secondes
                en 1080p pèse environ 10 à 20 Mo.
            </Form.Text>
        </div>
    );
}
