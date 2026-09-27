import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import DeleteButton from '@/Components/Admin/DeleteButton';
import ImageDropzone, { usableUploadBytes } from '@/Components/Admin/ImageDropzone';
import ImageManager from '@/Components/Admin/ImageManager';
import PriceVisibilityControl from '@/Components/Admin/PriceVisibilityControl';
import SortableImageGrid from '@/Components/Admin/SortableImageGrid';
import VariantsEditor, { newVariant } from '@/Components/Admin/VariantsEditor';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatMb, optimizedSummary, prepareImages } from '@/lib/imageCompress';

/**
 * Création et édition d'un produit (même composant).
 * - Création : les photos sont choisies, triées puis envoyées avec le formulaire (multipart).
 * - Édition : les photos sont gérées en direct par <ImageManager> (Axios), le formulaire n'envoie que le texte.
 */
/**
 * Après la création, Laravel redirige vers la page d'édition, qui utilise le même composant :
 * la clé garantit un formulaire neuf (sinon l'état de la création serait conservé).
 */
export default function ProductFormPage(props) {
    return <ProductForm key={props.product?.id ?? 'new'} {...props} />;
}

function ProductForm({ product, categories, collections, globalShowPrices }) {
    const isEdit = Boolean(product);
    const { settings, uploadLimit } = usePage().props;

    const form = useForm({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        reference: product?.reference ?? '',
        description: product?.description ?? '',
        category_id: product?.category_id ?? '',
        collection_id: product?.collection_id ?? '',
        price: product?.price ?? '',
        price_visibility: product?.price_visibility ?? 'inherit',
        is_published: product?.is_published ?? true,
        is_featured: product?.is_featured ?? false,
        variants: product?.variants?.length
            ? product.variants.map((v) => newVariant({
                size: v.size ?? '', color: v.color ?? '', color_hex: v.color_hex ?? '', stock: v.stock, sku: v.sku ?? '',
            }))
            : [newVariant()],
        images: [],
    });
    const { data, setData, errors, processing, isDirty } = form;

    const submit = (event) => {
        event.preventDefault();

        form.transform((d) => {
            const payload = {
                ...d,
                variants: d.variants.map(({ key, ...v }) => ({ ...v, color_hex: v.color ? v.color_hex : '' })),
            };
            if (isEdit) delete payload.images;
            return payload;
        });

        if (isEdit) {
            form.put(route('admin.products.update', product.id), {
                preserveScroll: true,
                onSuccess: () => form.setDefaults(),
            });
        } else {
            form.post(route('admin.products.store'), {
                forceFormData: true,
                // variants[0][size] (et non variants[][size]) pour que PHP reconstruise bien le tableau
                queryStringArrayFormat: 'indices',
            });
        }
    };

    // Création : toutes les photos partent dans la même requête que le formulaire.
    const imagesBytes = data.images.reduce((sum, f) => sum + f.size, 0);
    const maxBytes = usableUploadBytes(uploadLimit);
    const imagesTooHeavy = !isEdit && maxBytes !== null && imagesBytes > maxBytes;

    const imageErrors = Object.entries(errors).filter(([k]) => k === 'images' || k.startsWith('images.'));
    const errorCount = Object.keys(errors).length;

    // Avertit avant de quitter la page avec des modifications non enregistrées.
    useEffect(() => {
        const warn = (e) => {
            if (isDirty && !processing) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [isDirty, processing]);

    return (
        <AdminLayout
            title={isEdit ? product.name : 'Nouveau produit'}
            actions={
                isEdit && (
                    <a href={product.public_url} target="_blank" rel="noopener" className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-eye me-1" />Voir la fiche
                    </a>
                )
            }
        >
            <Form onSubmit={submit} noValidate>
                {errorCount > 0 && (
                    <Alert variant="danger" className="small">
                        <i className="bi bi-exclamation-triangle me-1" />
                        Le formulaire contient {errorCount} erreur{errorCount > 1 ? 's' : ''}. Vérifiez les champs signalés en rouge.
                    </Alert>
                )}

                <div className="row g-4">
                    <div className="col-xl-8 d-grid gap-4 align-content-start">
                        <Section title="Informations">
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <Field label="Nom de l'article" error={errors.name} required>
                                        {(id) => (
                                            <Form.Control id={id} value={data.name} onChange={(e) => setData('name', e.target.value)} isInvalid={!!errors.name} required maxLength={150} />
                                        )}
                                    </Field>
                                </div>
                                <div className="col-md-4">
                                    <Field label="Référence" error={errors.reference}>
                                        {(id) => (
                                            <Form.Control id={id} value={data.reference} onChange={(e) => setData('reference', e.target.value)} isInvalid={!!errors.reference} maxLength={50} />
                                        )}
                                    </Field>
                                </div>
                                <div className="col-md-6">
                                    <Field label="Catégorie" error={errors.category_id} required>
                                        {(id) => (
                                            <Form.Select id={id} value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} isInvalid={!!errors.category_id} required>
                                                <option value="">Choisir…</option>
                                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </Form.Select>
                                        )}
                                    </Field>
                                </div>
                                <div className="col-md-6">
                                    <Field label="Collection" error={errors.collection_id}>
                                        {(id) => (
                                            <Form.Select id={id} value={data.collection_id ?? ''} onChange={(e) => setData('collection_id', e.target.value)} isInvalid={!!errors.collection_id}>
                                                <option value="">Aucune</option>
                                                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </Form.Select>
                                        )}
                                    </Field>
                                </div>
                                <div className="col-12">
                                    <Field label="Description" error={errors.description} help="Texte simple ; les retours à la ligne sont conservés sur la fiche.">
                                        {(id) => (
                                            <Form.Control as="textarea" rows={5} id={id} value={data.description} onChange={(e) => setData('description', e.target.value)} isInvalid={!!errors.description} />
                                        )}
                                    </Field>
                                </div>
                                <div className="col-12">
                                    <Field label="Adresse de la fiche (slug)" error={errors.slug} help={isEdit ? 'Modifier ce champ casse les liens déjà partagés.' : 'Laissez vide : il sera généré à partir du nom.'}>
                                        {(id) => (
                                            <InputGroup size="sm">
                                                <InputGroup.Text>/produits/</InputGroup.Text>
                                                <Form.Control id={id} value={data.slug} onChange={(e) => setData('slug', e.target.value)} isInvalid={!!errors.slug} placeholder="genere-automatiquement" />
                                            </InputGroup>
                                        )}
                                    </Field>
                                </div>
                            </div>
                        </Section>

                        <Section title="Photos" subtitle="La première photo est la photo principale. Glissez les vignettes pour changer l'ordre.">
                            {isEdit ? (
                                <ImageManager productId={product.id} initialImages={product.images} />
                            ) : (
                                <>
                                    <NewImagesField files={data.images} onChange={(files) => setData('images', files)} />
                                    {imagesTooHeavy && (
                                        <Alert variant="warning" className="small mt-3 mb-0">
                                            Les photos pèsent {formatMb(imagesBytes)} au total, mais le serveur accepte {formatMb(maxBytes)} par envoi.
                                            Gardez 2 ou 3 photos pour créer le produit : vous ajouterez les autres juste après, depuis la page d'édition.
                                        </Alert>
                                    )}
                                </>
                            )}
                            {imageErrors.length > 0 && (
                                <div className="text-danger small mt-2">
                                    {imageErrors.map(([k, msg]) => <div key={k}>{msg}</div>)}
                                </div>
                            )}
                        </Section>

                        <Section title="Tailles, couleurs et stock">
                            <VariantsEditor variants={data.variants} onChange={(v) => setData('variants', v)} errors={errors} />
                        </Section>
                    </div>

                    <div className="col-xl-4 d-grid gap-4 align-content-start">
                        <Section title="Publication">
                            <div className="d-grid gap-2">
                                <Form.Check type="switch" id="is_published" label="Visible sur le site" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                                <Form.Check type="switch" id="is_featured" label="Mettre en avant (coups de cœur)" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} />
                            </div>
                        </Section>

                        <Section title="Prix">
                            <Field label="Prix" error={errors.price}>
                                {(id) => (
                                    <InputGroup>
                                        <Form.Control id={id} type="number" min="0" step="0.01" inputMode="decimal" value={data.price ?? ''} onChange={(e) => setData('price', e.target.value)} isInvalid={!!errors.price} />
                                        <InputGroup.Text>{settings.currency}</InputGroup.Text>
                                    </InputGroup>
                                )}
                            </Field>
                            <PriceVisibilityControl
                                value={data.price_visibility}
                                onChange={(v) => setData('price_visibility', v)}
                                globalShowPrices={globalShowPrices}
                            />
                            {errors.price_visibility && <div className="text-danger small">{errors.price_visibility}</div>}
                        </Section>

                        <div className="admin-card p-3 d-grid gap-2 sticky-xl-top" style={{ top: '1rem' }}>
                            <Button type="submit" variant="primary" disabled={processing || imagesTooHeavy}>
                                {processing && <Spinner size="sm" className="me-2" />}
                                {isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
                            </Button>
                            {!isEdit && form.progress && (
                                <div className="small text-muted-brand text-center">Envoi des photos… {form.progress.percentage} %</div>
                            )}
                            <Link href={route('admin.products.index')} className="btn btn-link link-body-emphasis btn-sm">
                                Retour à la liste
                            </Link>
                            {isEdit && (
                                <DeleteButton
                                    href={route('admin.products.destroy', product.id)}
                                    className="btn btn-outline-danger btn-sm"
                                    title={`Supprimer « ${product.name} » ?`}
                                    message="Le produit, ses variantes et toutes ses photos seront supprimés définitivement."
                                >
                                    <i className="bi bi-trash3 me-1" />Supprimer le produit
                                </DeleteButton>
                            )}
                        </div>
                    </div>
                </div>
            </Form>
        </AdminLayout>
    );
}

/** Photos d'un nouveau produit : aperçus locaux, tri par glisser-déposer, envoyées avec le formulaire. */
function NewImagesField({ files, onChange }) {
    const [rejected, setRejected] = useState([]);
    const [info, setInfo] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Un aperçu (URL blob) par fichier, libéré quand il n'est plus affiché.
    const items = useMemo(
        () => files.map((file) => ({ id: `${file.name}-${file.size}-${file.lastModified}`, url: URL.createObjectURL(file), alt: file.name, file })),
        [files],
    );
    useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.url)), [items]);

    const add = async (list) => {
        setProcessing(true);
        try {
            const { accepted, rejected: refused, optimized } = await prepareImages(list);
            setRejected(refused);
            setInfo(optimizedSummary(optimized));
            const known = new Set(items.map((i) => i.id));
            onChange([...files, ...accepted.filter((f) => !known.has(`${f.name}-${f.size}-${f.lastModified}`))]);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="d-grid gap-3">
            {items.length > 0 && (
                <SortableImageGrid
                    items={items}
                    onReorder={(next) => onChange(next.map((i) => i.file))}
                    onRemove={(item) => onChange(files.filter((f) => f !== item.file))}
                />
            )}
            <ImageDropzone
                onFiles={add}
                processing={processing}
                hint="Au moins une photo · JPG, PNG, WebP ou photos de téléphone, optimisées automatiquement"
            />
            {info && <div className="small text-success"><i className="bi bi-magic me-1" />{info}</div>}
            {rejected.length > 0 && (
                <Alert variant="warning" className="small mb-0" dismissible onClose={() => setRejected([])}>
                    <ul className="mb-0 ps-3">{rejected.map((r) => <li key={r}>{r}</li>)}</ul>
                </Alert>
            )}
        </div>
    );
}

function Section({ title, subtitle, children }) {
    return (
        <section className="admin-card p-3 p-lg-4">
            <h2 className="h5 mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{title}</h2>
            {subtitle && <p className="small text-muted-brand mb-3">{subtitle}</p>}
            <div className={subtitle ? '' : 'mt-3'}>{children}</div>
        </section>
    );
}

let fieldId = 0;
function Field({ label, error, help, required = false, children }) {
    const [id] = useState(() => `field-${++fieldId}`);
    return (
        <Form.Group className="mb-0">
            <Form.Label htmlFor={id} className="small fw-medium mb-1">
                {label}{required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
            </Form.Label>
            {children(id)}
            {error && <div className="invalid-feedback d-block">{error}</div>}
            {help && !error && <Form.Text className="d-block">{help}</Form.Text>}
        </Form.Group>
    );
}
