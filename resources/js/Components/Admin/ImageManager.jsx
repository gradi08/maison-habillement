import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Alert, ProgressBar } from 'react-bootstrap';
import { useConfirm } from '@/Components/ConfirmDialog';
import http from '@/lib/http';
import ImageDropzone, { checkFiles, splitIntoBatches } from './ImageDropzone';
import SortableImageGrid from './SortableImageGrid';

/**
 * Galerie d'un produit EXISTANT : chaque action est enregistrée immédiatement (Axios).
 * - upload multiple (ajout en fin de galerie)
 * - réorganisation par glisser-déposer (mise à jour optimiste, annulée en cas d'erreur)
 * - suppression (le serveur refuse de supprimer la dernière photo)
 */
export default function ImageManager({ productId, initialImages }) {
    const { uploadLimit } = usePage().props;
    const confirm = useConfirm();
    const [images, setImages] = useState(initialImages);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(null);
    const [errors, setErrors] = useState([]);
    const [saved, setSaved] = useState(false);

    const flashSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const upload = async (files) => {
        const { accepted, rejected } = checkFiles(files);
        setErrors(rejected);
        if (accepted.length === 0) return;

        // Plusieurs requêtes si besoin, pour rester sous la limite post_max_size du serveur.
        const batches = splitIntoBatches(accepted, uploadLimit);
        const totalBytes = accepted.reduce((sum, f) => sum + f.size, 0);
        let sentBytes = 0;

        setBusy(true);
        setProgress(0);
        try {
            for (const batch of batches) {
                const data = new FormData();
                batch.forEach((file) => data.append('images[]', file));
                const batchBytes = batch.reduce((sum, f) => sum + f.size, 0);

                const response = await http.post(route('admin.products.images.store', productId), data, {
                    onUploadProgress: (e) =>
                        e.total && setProgress(Math.round(((sentBytes + (e.loaded / e.total) * batchBytes) / totalBytes) * 100)),
                });
                sentBytes += batchBytes;
                setImages(response.data);
            }
            flashSaved();
        } catch (error) {
            setErrors((current) => [...current, error.userMessage]);
        } finally {
            setBusy(false);
            setProgress(null);
        }
    };

    const reorder = async (next) => {
        const previous = images;
        setImages(next); // optimiste : l'ordre change tout de suite à l'écran
        setErrors([]);
        try {
            const response = await http.put(route('admin.products.images.reorder', productId), {
                ids: next.map((i) => i.id),
            });
            setImages(response.data);
            flashSaved();
        } catch (error) {
            setImages(previous);
            setErrors([error.userMessage]);
        }
    };

    const remove = async (image) => {
        if (images.length <= 1) {
            setErrors(['Un produit doit conserver au moins une photo. Ajoutez-en une autre avant de supprimer celle-ci.']);
            return;
        }
        const confirmed = await confirm({
            title: 'Supprimer cette photo ?',
            message: (
                <div className="d-flex gap-3 align-items-center">
                    <img src={image.url} alt="" className="thumb-sm" />
                    <span>La photo est retirée de la galerie et effacée du serveur.</span>
                </div>
            ),
            confirmLabel: 'Supprimer la photo',
        });
        if (!confirmed) return;

        setBusy(true);
        setErrors([]);
        try {
            const response = await http.delete(route('admin.products.images.destroy', [productId, image.id]));
            setImages(response.data);
            flashSaved();
        } catch (error) {
            setErrors([error.userMessage]);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="d-grid gap-3">
            <div className="d-flex justify-content-between align-items-center small text-muted-brand">
                <span>
                    {images.length} photo{images.length > 1 ? 's' : ''} · glissez pour changer l'ordre d'affichage
                </span>
                <span aria-live="polite" className={saved ? 'text-success' : ''}>
                    {saved && (<><i className="bi bi-check2 me-1" />Enregistré</>)}
                </span>
            </div>

            <SortableImageGrid items={images} onReorder={reorder} onRemove={remove} disabled={busy} />

            {progress !== null && <ProgressBar now={progress} label={`${progress} %`} animated aria-label="Envoi des photos" />}

            <ImageDropzone onFiles={upload} disabled={busy} />

            {errors.length > 0 && (
                <Alert variant="danger" className="mb-0 small" onClose={() => setErrors([])} dismissible>
                    <ul className="mb-0 ps-3">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
                </Alert>
            )}
        </div>
    );
}
