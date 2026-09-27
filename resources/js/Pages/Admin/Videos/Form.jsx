import { Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Alert, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import DeleteButton from '@/Components/Admin/DeleteButton';
import VideoFileField from '@/Components/Admin/VideoFileField';
import AdminLayout from '@/Layouts/AdminLayout';
import { parseYoutube, youtubeThumbnail } from '@/lib/youtube';

/** La clé repart d'un formulaire neuf après la création (redirection vers l'édition, même composant). */
export default function VideoFormPage(props) {
    return <VideoForm key={props.video?.id ?? 'new'} {...props} />;
}

function VideoForm({ video, categories, collections, products, timezone, videoMaxMb }) {
    const isEdit = Boolean(video);
    const form = useForm({
        // Nouvelle vidéo : fichier envoyé par défaut ; une vidéo existante garde sa source.
        source: video?.source ?? 'file',
        youtube_url: video?.youtube_url ?? '',
        upload_id: '',
        poster: null,
        duration: video?.duration ?? '',
        title: video?.title ?? '',
        slug: video?.slug ?? '',
        description: video?.description ?? '',
        is_vertical: video?.is_vertical ?? false,
        category_id: video?.category_id ?? '',
        collection_id: video?.collection_id ?? '',
        product_ids: video?.product_ids ?? [],
        is_published: video?.is_published ?? true,
        published_at: video?.published_at ?? '',
        position: video?.position ?? 0,
    });
    const { data, setData, errors, processing } = form;
    const [search, setSearch] = useState('');
    const [uploading, setUploading] = useState(false);
    const isFile = data.source === 'file';
    const hasFile = Boolean(data.upload_id) || Boolean(video?.file_url && video?.source === 'file');

    const parsed = parseYoutube(data.youtube_url);

    const onUrlChange = (value) => {
        const result = parseYoutube(value);
        // Un lien « /shorts/ » est forcément vertical : on coche pour vous (modifiable).
        setData((d) => ({ ...d, youtube_url: value, is_vertical: result?.vertical ? true : d.is_vertical }));
    };

    const selected = data.product_ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
    const candidates = useMemo(() => {
        const q = search.trim().toLowerCase();
        return products.filter((p) =>
            !data.product_ids.includes(p.id)
            && (!q || p.name.toLowerCase().includes(q) || (p.reference ?? '').toLowerCase().includes(q)));
    }, [products, search, data.product_ids]);

    const addProduct = (id) => setData('product_ids', [...data.product_ids, id]);
    const removeProduct = (id) => setData('product_ids', data.product_ids.filter((x) => x !== id));
    const moveProduct = (index, delta) => {
        const next = [...data.product_ids];
        const target = index + delta;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setData('product_ids', next);
    };

    const submit = (e) => {
        e.preventDefault();
        // Toujours en multipart (image d'aperçu) : en modification, POST + _method=put, car PHP ne lit pas le multipart en PUT.
        form.transform((d) => ({
            ...d,
            ...(isEdit ? { _method: 'put' } : {}),
            poster: d.source === 'file' ? d.poster : null,
        }));
        form.post(isEdit ? route('admin.videos.update', video.id) : route('admin.videos.store'), {
            preserveScroll: true,
            forceFormData: true,
            queryStringArrayFormat: 'indices',
            // Le fichier et l'aperçu sont enregistrés : on ne les renverra pas au prochain enregistrement.
            onSuccess: () => form.setData((d) => ({ ...d, upload_id: '', poster: null })),
        });
    };

    const canSubmit = isFile ? hasFile && !uploading : Boolean(parsed);

    const errorCount = Object.keys(errors).length;

    return (
        <AdminLayout
            title={isEdit ? video.title : 'Nouvelle vidéo'}
            actions={isEdit && (
                <a href={video.public_url} target="_blank" rel="noopener" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-eye me-1" />Voir sur le site
                </a>
            )}
        >
            <Form onSubmit={submit} noValidate>
                {errorCount > 0 && (
                    <Alert variant="danger" className="small">
                        Le formulaire contient {errorCount} erreur{errorCount > 1 ? 's' : ''}. Vérifiez les champs signalés en rouge.
                    </Alert>
                )}

                <div className="row g-4">
                    <div className="col-xl-8 d-grid gap-4 align-content-start">
                        <Card title="Vidéo" subtitle="Envoyez le fichier de la vidéo sur le site, ou utilisez une vidéo déjà publiée sur YouTube.">
                            <div className="btn-group mb-3" role="group" aria-label="Source de la vidéo">
                                <Button variant={isFile ? 'primary' : 'outline-secondary'} onClick={() => setData('source', 'file')} aria-pressed={isFile}>
                                    <i className="bi bi-upload me-1" />Fichier vidéo
                                </Button>
                                <Button variant={!isFile ? 'primary' : 'outline-secondary'} onClick={() => setData('source', 'youtube')} aria-pressed={!isFile}>
                                    <i className="bi bi-youtube me-1" />Lien YouTube
                                </Button>
                            </div>
                            {errors.source && <div className="text-danger small mb-2">{errors.source}</div>}

                            {isFile ? (
                                <>
                                    <VideoFileField
                                        current={video?.source === 'file' ? video : null}
                                        maxMb={videoMaxMb}
                                        errors={errors}
                                        onUploaded={(id) => setData('upload_id', id ?? '')}
                                        onPoster={(poster, duration) => setData((d) => ({ ...d, poster, duration: duration ?? d.duration }))}
                                        onVertical={(vertical) => setData('is_vertical', vertical)}
                                        onBusyChange={setUploading}
                                    />
                                    <Form.Check
                                        className="mt-3"
                                        type="switch"
                                        id="v-vertical-file"
                                        checked={data.is_vertical}
                                        onChange={(e) => setData('is_vertical', e.target.checked)}
                                        label="Format vertical (détecté automatiquement)"
                                    />
                                </>
                            ) : (
                            <>
                            <Form.Group controlId="v-url">
                                <Form.Label className="small fw-medium">Lien YouTube <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    value={data.youtube_url}
                                    onChange={(e) => onUrlChange(e.target.value)}
                                    placeholder="https://youtube.com/shorts/… ou https://youtu.be/…"
                                    isInvalid={!!errors.youtube_url || (data.youtube_url !== '' && !parsed)}
                                    isValid={!!parsed && !errors.youtube_url}
                                    autoFocus={!isEdit && !isFile}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.youtube_url ?? "Lien non reconnu. Sur YouTube : bouton « Partager », puis « Copier le lien »."}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {parsed && (
                                <div className="d-flex gap-3 align-items-start mt-3">
                                    <img
                                        src={youtubeThumbnail(parsed.id)}
                                        alt="Aperçu de la vidéo"
                                        className="rounded"
                                        style={{ width: '10rem', aspectRatio: '16 / 9', objectFit: 'cover' }}
                                    />
                                    <div className="small">
                                        <div className="text-success mb-2"><i className="bi bi-check-circle me-1" />Vidéo YouTube reconnue</div>
                                        <Form.Check
                                            type="switch"
                                            id="v-vertical"
                                            checked={data.is_vertical}
                                            onChange={(e) => setData('is_vertical', e.target.checked)}
                                            label="Format vertical (Short, Reel, vidéo filmée au téléphone)"
                                        />
                                        <div className="text-muted-brand mt-1">Détermine la forme du lecteur sur le site.</div>
                                    </div>
                                </div>
                            )}
                            </>
                            )}
                        </Card>

                        <Card title="Présentation">
                            <div className="d-grid gap-3">
                                <Form.Group controlId="v-title">
                                    <Form.Label className="small fw-medium">Titre <span className="text-danger">*</span></Form.Label>
                                    <Form.Control value={data.title} onChange={(e) => setData('title', e.target.value)} isInvalid={!!errors.title} maxLength={150} placeholder="La robe Amani portée" />
                                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="v-description">
                                    <Form.Label className="small fw-medium">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        value={data.description ?? ''}
                                        onChange={(e) => setData('description', e.target.value)}
                                        isInvalid={!!errors.description}
                                        placeholder={"Ce que montre la vidéo : coupe, matière, tailles portées…\nLa première ligne sert aussi de résumé pour Google."}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                                </Form.Group>
                                <div className="row g-3">
                                    <Form.Group className="col-md-6" controlId="v-category">
                                        <Form.Label className="small fw-medium">Catégorie <span className="text-muted-brand fw-normal">(filtre)</span></Form.Label>
                                        <Form.Select value={data.category_id ?? ''} onChange={(e) => setData('category_id', e.target.value)} isInvalid={!!errors.category_id}>
                                            <option value="">Aucune</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="col-md-6" controlId="v-collection">
                                        <Form.Label className="small fw-medium">Collection <span className="text-muted-brand fw-normal">(filtre)</span></Form.Label>
                                        <Form.Select value={data.collection_id ?? ''} onChange={(e) => setData('collection_id', e.target.value)} isInvalid={!!errors.collection_id}>
                                            <option value="">Aucune</option>
                                            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <Form.Group controlId="v-slug">
                                    <Form.Label className="small fw-medium">Adresse de la page (slug)</Form.Label>
                                    <InputGroup size="sm">
                                        <InputGroup.Text>/videos/</InputGroup.Text>
                                        <Form.Control value={data.slug} onChange={(e) => setData('slug', e.target.value)} isInvalid={!!errors.slug} placeholder="genere-automatiquement" />
                                    </InputGroup>
                                    {errors.slug ? <div className="invalid-feedback d-block">{errors.slug}</div> : <Form.Text>Laissez vide : elle est générée à partir du titre.</Form.Text>}
                                </Form.Group>
                            </div>
                        </Card>

                        <Card title="Articles présentés dans la vidéo" subtitle="Ils s'affichent sous la vidéo avec un lien vers leur fiche, et la vidéo apparaît sur la fiche de chaque article.">
                            {selected.length > 0 && (
                                <ol className="list-group list-group-numbered mb-3">
                                    {selected.map((p, index) => (
                                        <li key={p.id} className="list-group-item d-flex align-items-center gap-2">
                                            {p.cover_url ? <img src={p.cover_url} alt="" className="thumb-sm" /> : <div className="thumb-sm" />}
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="text-truncate">{p.name}</div>
                                                <div className="small text-muted-brand">{p.reference}{!p.is_published && ' · brouillon (non affiché)'}</div>
                                            </div>
                                            <Button size="sm" variant="outline-secondary" onClick={() => moveProduct(index, -1)} disabled={index === 0} aria-label={`Monter ${p.name}`}><i className="bi bi-arrow-up" /></Button>
                                            <Button size="sm" variant="outline-secondary" onClick={() => moveProduct(index, 1)} disabled={index === selected.length - 1} aria-label={`Descendre ${p.name}`}><i className="bi bi-arrow-down" /></Button>
                                            <Button size="sm" variant="outline-danger" onClick={() => removeProduct(p.id)} aria-label={`Retirer ${p.name}`}><i className="bi bi-x-lg" /></Button>
                                        </li>
                                    ))}
                                </ol>
                            )}
                            {errors.product_ids && <div className="text-danger small mb-2">{errors.product_ids}</div>}

                            <InputGroup size="sm" className="mb-2">
                                <InputGroup.Text><i className="bi bi-search" /></InputGroup.Text>
                                <Form.Control
                                    type="search"
                                    placeholder="Rechercher un article par nom ou référence"
                                    aria-label="Rechercher un article à associer"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                            <div className="border rounded" style={{ maxHeight: '16rem', overflowY: 'auto' }}>
                                {candidates.length === 0 ? (
                                    <div className="p-3 small text-muted-brand">Aucun article à ajouter.</div>
                                ) : candidates.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className="d-flex align-items-center gap-2 w-100 text-start border-0 border-bottom bg-white px-2 py-1"
                                        onClick={() => addProduct(p.id)}
                                    >
                                        {p.cover_url ? <img src={p.cover_url} alt="" className="thumb-sm" loading="lazy" /> : <div className="thumb-sm" />}
                                        <span className="flex-grow-1 min-w-0">
                                            <span className="d-block text-truncate">{p.name}</span>
                                            <span className="small text-muted-brand">{p.reference}</span>
                                        </span>
                                        <i className="bi bi-plus-circle text-success" aria-hidden="true" />
                                        <span className="visually-hidden">Ajouter {p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="col-xl-4 d-grid gap-4 align-content-start">
                        <Card title="Publication">
                            <div className="d-grid gap-3">
                                <Form.Check type="switch" id="v-published" label="Visible sur le site" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                                <Form.Group controlId="v-published-at">
                                    <Form.Label className="small fw-medium">Programmer la publication</Form.Label>
                                    <Form.Control type="datetime-local" value={data.published_at ?? ''} onChange={(e) => setData('published_at', e.target.value)} isInvalid={!!errors.published_at} />
                                    <Form.Text>Laissez vide pour publier tout de suite. Sinon, la vidéo apparaît automatiquement à cette date (heure du serveur : {timezone}).</Form.Text>
                                </Form.Group>
                                <Form.Group controlId="v-position">
                                    <Form.Label className="small fw-medium">Ordre d'affichage</Form.Label>
                                    <Form.Control type="number" min="0" value={data.position} onChange={(e) => setData('position', e.target.value)} isInvalid={!!errors.position} />
                                    <Form.Text>0 = en premier. À égalité, les plus récentes passent devant.</Form.Text>
                                </Form.Group>
                            </div>
                        </Card>

                        <div className="admin-card p-3 d-grid gap-2">
                            <Button type="submit" disabled={processing || !canSubmit}>
                                {processing && <Spinner size="sm" className="me-2" />}
                                {isEdit ? 'Enregistrer les modifications' : 'Ajouter la vidéo'}
                            </Button>
                            {isFile && uploading && <div className="small text-muted-brand text-center">Attendez la fin de l'envoi de la vidéo…</div>}
                            {isFile && !uploading && !hasFile && <div className="small text-muted-brand text-center">Choisissez d'abord le fichier vidéo.</div>}
                            {form.progress && <div className="small text-muted-brand text-center">Enregistrement… {form.progress.percentage} %</div>}
                            <Link href={route('admin.videos.index')} className="btn btn-link link-body-emphasis btn-sm">Retour à la liste</Link>
                            {isEdit && (
                                <DeleteButton
                                    href={route('admin.videos.destroy', video.id)}
                                    className="btn btn-outline-danger btn-sm"
                                    title={`Retirer « ${video.title} » du site ?`}
                                    message={video.source === 'file'
                                        ? 'Le fichier vidéo et son image d\'aperçu seront supprimés définitivement du serveur.'
                                        : 'La vidéo n\'apparaîtra plus sur le site. Elle reste sur votre chaîne YouTube.'}
                                    confirmLabel="Retirer"
                                >
                                    <i className="bi bi-trash3 me-1" />Retirer la vidéo du site
                                </DeleteButton>
                            )}
                        </div>
                    </div>
                </div>
            </Form>
        </AdminLayout>
    );
}

function Card({ title, subtitle, children }) {
    return (
        <section className="admin-card p-3 p-lg-4">
            <h2 className="h5 mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{title}</h2>
            {subtitle ? <p className="small text-muted-brand mb-3">{subtitle}</p> : <div className="mb-3" />}
            {children}
        </section>
    );
}
