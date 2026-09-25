import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { normalizeImages } from '@/lib/format';

const prefersReducedMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Galerie de la fiche produit.
 *
 * - ≥ 768 px : grande image + bande de miniatures (sous l'image, sur le côté à partir de 992 px).
 * - < 768 px : carousel au doigt (scroll-snap natif) avec points indicateurs.
 * - Clic sur l'image : lightbox plein écran (flèches, clavier, swipe, zoom).
 *
 * @param {{ images: Array<string | {id?: number, url: string, alt?: string}>, productName?: string }} props
 */
export default function ProductGallery({ images, productName = '' }) {
    const items = useMemo(() => normalizeImages(images, productName), [images, productName]);
    const [current, setCurrent] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Si la liste change (nouveau produit), on revient à la première photo.
    useEffect(() => setCurrent(0), [items]);

    if (items.length === 0) {
        return (
            <div className="ratio-portrait bg-sand d-grid text-muted-brand" style={{ placeItems: 'center' }}>
                <span><i className="bi bi-image me-2" />Photo à venir</span>
            </div>
        );
    }

    const active = items[Math.min(current, items.length - 1)];
    const openLightbox = () => setLightboxOpen(true);

    return (
        <div className="product-gallery">
            {/* Tablette / desktop */}
            <div className="d-none d-md-flex flex-column flex-lg-row-reverse gap-3">
                <button
                    type="button"
                    className="gallery-main ratio-portrait flex-grow-1"
                    onClick={openLightbox}
                    aria-label={`Agrandir la photo ${current + 1} sur ${items.length}`}
                >
                    <img
                        src={active.url}
                        alt={active.alt}
                        className="object-cover"
                        // Photo principale = candidate LCP de la page.
                        fetchPriority={current === 0 ? 'high' : undefined}
                        decoding="async"
                    />
                    <span className="zoom-hint" aria-hidden="true">
                        <i className="bi bi-arrows-fullscreen" />
                    </span>
                </button>

                {items.length > 1 && (
                    <div className="gallery-thumbs" role="group" aria-label="Photos de l'article">
                        {items.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                className="gallery-thumb ratio-portrait"
                                aria-current={index === current}
                                aria-label={`Afficher la photo ${index + 1}`}
                                onClick={() => setCurrent(index)}
                            >
                                <img src={image.url} alt="" loading="lazy" className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile */}
            <div className="d-md-none">
                <MobileCarousel
                    items={items}
                    current={current}
                    onChange={setCurrent}
                    onOpen={openLightbox}
                />
            </div>

            <Lightbox
                open={lightboxOpen}
                items={items}
                index={current}
                onIndexChange={setCurrent}
                onClose={() => setLightboxOpen(false)}
            />
        </div>
    );
}

/* ------------------------------------------------------------------------------------------ */

function MobileCarousel({ items, current, onChange, onOpen }) {
    const trackRef = useRef(null);
    const [pending, setPending] = useState(null);
    const currentRef = useRef(current);
    const onChangeRef = useRef(onChange);
    const syncedFromScroll = useRef(false);

    currentRef.current = current;
    onChangeRef.current = onChange;

    // Index choisi ailleurs (points, lightbox) → on fait défiler le carousel jusqu'à la bonne photo.
    useLayoutEffect(() => {
        if (syncedFromScroll.current) {
            syncedFromScroll.current = false;
            return;
        }
        const track = trackRef.current;
        const slide = track?.children[current];
        if (!track || !slide || track.clientWidth === 0) return;

        if (Math.abs(track.scrollLeft - slide.offsetLeft) > 2) {
            track.scrollTo({
                left: slide.offsetLeft,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            });
        }
    }, [current]);

    // Swipe de l'utilisateur → mise à jour des points en temps réel, puis de l'index.
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return undefined;

        const slides = () => [...track.children];
        const closestIndex = () => {
            const center = track.scrollLeft + track.clientWidth / 2;
            let best = 0;
            let min = Infinity;
            slides().forEach((slide, index) => {
                const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
                if (distance < min) {
                    min = distance;
                    best = index;
                }
            });
            return best;
        };
        const commit = (index) => {
            setPending(null);
            if (index >= 0 && index !== currentRef.current) {
                syncedFromScroll.current = true;
                onChangeRef.current(index);
            }
        };

        // Événements Scroll Snap natifs (Chrome/Edge 129+) : retour visuel pendant le geste.
        if ('onscrollsnapchanging' in Element.prototype) {
            const onChanging = (event) => setPending(slides().indexOf(event.snapTargetInline));
            const onSnapped = (event) => commit(slides().indexOf(event.snapTargetInline));
            track.addEventListener('scrollsnapchanging', onChanging);
            track.addEventListener('scrollsnapchange', onSnapped);
            return () => {
                track.removeEventListener('scrollsnapchanging', onChanging);
                track.removeEventListener('scrollsnapchange', onSnapped);
            };
        }

        // Repli (Safari, Firefox) : calcul géométrique pendant le scroll + validation en fin de geste.
        let frame = null;
        let timeout = null;
        const onScroll = () => {
            if (!frame) {
                frame = requestAnimationFrame(() => {
                    frame = null;
                    setPending(closestIndex());
                });
            }
            clearTimeout(timeout);
            timeout = setTimeout(() => commit(closestIndex()), 120);
        };
        const onScrollEnd = () => {
            clearTimeout(timeout);
            commit(closestIndex());
        };
        track.addEventListener('scroll', onScroll, { passive: true });
        track.addEventListener('scrollend', onScrollEnd);
        return () => {
            track.removeEventListener('scroll', onScroll);
            track.removeEventListener('scrollend', onScrollEnd);
            cancelAnimationFrame(frame);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div>
            <div
                ref={trackRef}
                className="gallery-track"
                role="region"
                aria-roledescription="carrousel"
                aria-label="Photos de l'article — faites glisser pour naviguer"
            >
                {items.map((image, index) => (
                    <button
                        key={image.id}
                        type="button"
                        className="gallery-slide ratio-portrait"
                        onClick={onOpen}
                        aria-label={`Agrandir la photo ${index + 1} sur ${items.length}`}
                    >
                        <img
                            src={image.url}
                            alt={image.alt}
                            className="object-cover"
                            draggable="false"
                            {...(index === 0
                                ? { fetchPriority: 'high' }
                                : { loading: 'lazy', fetchPriority: 'low' })}
                        />
                    </button>
                ))}
            </div>

            {items.length > 1 && (
                <div className="gallery-dots" role="group" aria-label="Choisir une photo">
                    {items.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            className={`gallery-dot${pending === index && pending !== current ? ' pending' : ''}`}
                            aria-current={index === current}
                            aria-label={`Photo ${index + 1} sur ${items.length}`}
                            onClick={() => onChange(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------------------------------ */

function Lightbox({ open, items, index, onIndexChange, onClose }) {
    const dialogRef = useRef(null);
    const stageRef = useRef(null);
    const [zoom, setZoom] = useState(null); // { x, y } en % = point zoomé, ou null
    const swipe = useRef(null);
    const lastGestureWasSwipe = useRef(false);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const count = items.length;
    const image = items[Math.min(index, count - 1)];
    const go = (delta) => {
        setZoom(null);
        onIndexChange((index + delta + count) % count);
    };

    // Ouverture / fermeture pilotées par l'état React, via l'API native (focus piégé, Échap).
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
            document.documentElement.style.overflow = 'hidden';
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Fermeture native (Échap, clic à l'extérieur) → on resynchronise l'état.
    useEffect(() => {
        const dialog = dialogRef.current;
        const handleClose = () => {
            document.documentElement.style.overflow = '';
            setZoom(null);
            onCloseRef.current();
        };
        dialog.addEventListener('close', handleClose);

        // Repli pour les navigateurs sans `closedby` (Safari) : clic sur le fond = fermeture.
        const handleClick = (event) => {
            if (!('closedBy' in HTMLDialogElement.prototype) && event.target === dialog) {
                dialog.close();
            }
        };
        dialog.addEventListener('click', handleClick);

        return () => {
            dialog.removeEventListener('close', handleClose);
            dialog.removeEventListener('click', handleClick);
            document.documentElement.style.overflow = '';
        };
    }, []);

    const onKeyDown = (event) => {
        if (event.key === 'ArrowRight') go(1);
        if (event.key === 'ArrowLeft') go(-1);
    };

    const zoomAt = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
            x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
            y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
        };
    };

    const onPointerDown = (event) => {
        swipe.current = { x: event.clientX, y: event.clientY, moved: false };
    };
    const onPointerMove = (event) => {
        if (swipe.current && Math.abs(event.clientX - swipe.current.x) > 10) {
            swipe.current.moved = true;
        }
        // En mode zoom, le point zoomé suit la souris / le doigt (effet "loupe").
        if (zoom && event.target.tagName === 'IMG') {
            setZoom(zoomAt(event));
        }
    };
    const onPointerUp = (event) => {
        const start = swipe.current;
        swipe.current = null;
        lastGestureWasSwipe.current = Boolean(start?.moved);
        if (!start || zoom || count < 2) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            go(dx < 0 ? 1 : -1);
        }
    };

    const onImageClick = (event) => {
        event.stopPropagation();
        if (lastGestureWasSwipe.current) return; // fin d'un swipe, pas un clic
        setZoom(zoom ? null : zoomAt(event));
    };

    // Clic dans la zone vide autour de la photo = fermeture (même comportement que le fond).
    const onStageClick = (event) => {
        if (event.target === stageRef.current) dialogRef.current?.close();
    };

    return (
        <dialog
            ref={dialogRef}
            className="lightbox"
            closedby="any"
            aria-label="Photos en plein écran"
            onKeyDown={onKeyDown}
        >
            {open && image && (
                <>
                    <div className="lightbox-bar">
                        <span className="small" aria-live="polite">
                            {index + 1} / {count}
                        </span>
                        <button
                            type="button"
                            className="lightbox-btn"
                            onClick={() => dialogRef.current?.close()}
                            aria-label="Fermer"
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>

                    <div
                        ref={stageRef}
                        className={`lightbox-stage${zoom ? ' zoomed' : ''}`}
                        onClick={onStageClick}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => (swipe.current = null)}
                    >
                        <img
                            key={image.id}
                            src={image.url}
                            alt={image.alt}
                            draggable="false"
                            onClick={onImageClick}
                            style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                            title={zoom ? 'Cliquer pour dézoomer' : 'Cliquer pour zoomer'}
                        />
                    </div>

                    {count > 1 && (
                        <>
                            <button
                                type="button"
                                className="lightbox-btn lightbox-prev"
                                onClick={() => go(-1)}
                                aria-label="Photo précédente"
                            >
                                <i className="bi bi-chevron-left" />
                            </button>
                            <button
                                type="button"
                                className="lightbox-btn lightbox-next"
                                onClick={() => go(1)}
                                aria-label="Photo suivante"
                            >
                                <i className="bi bi-chevron-right" />
                            </button>

                            <div className="lightbox-thumbs">
                                {items.map((thumb, i) => (
                                    <button
                                        key={thumb.id}
                                        type="button"
                                        aria-current={i === index}
                                        aria-label={`Photo ${i + 1}`}
                                        onClick={() => {
                                            setZoom(null);
                                            onIndexChange(i);
                                        }}
                                    >
                                        <img src={thumb.url} alt="" className="object-cover" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </dialog>
    );
}
