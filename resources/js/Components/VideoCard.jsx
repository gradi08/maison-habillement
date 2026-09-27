import { Link } from '@inertiajs/react';
import { formatDuration } from '@/lib/videoUpload';

/** Vignette d'une vidéo dans la liste. Même format (portrait) pour toutes, afin d'aligner la grille. */
export default function VideoCard({ video }) {
    // Seules les miniatures YouTube des vidéos verticales ont des bandes noires à masquer (zoom CSS).
    const youtubeVertical = video.source !== 'file' && video.is_vertical;

    return (
        <Link href={video.url} className="video-card">
            <div className={`thumb ratio-portrait mb-2${youtubeVertical ? ' vertical' : ''}`}>
                {video.thumbnail_url && <img src={video.thumbnail_url} alt="" loading="lazy" />}
                <span className="video-play" aria-hidden="true">
                    <i className="bi bi-play-fill" />
                </span>
                {video.is_vertical && (
                    <span className="format badge text-bg-dark"><i className="bi bi-phone me-1" />Court</span>
                )}
                {video.duration > 0 && (
                    <span className="badge text-bg-dark position-absolute bottom-0 end-0 m-2">{formatDuration(video.duration)}</span>
                )}
            </div>
            <div className="fw-medium">{video.title}</div>
            <div className="small text-muted-brand">
                {[video.category?.name, video.collection && `Collection ${video.collection.name}`].filter(Boolean).join(' · ')}
            </div>
            {video.description && (
                <p className="small text-muted-brand line-clamp-2 mb-0 mt-1">{video.description}</p>
            )}
            {video.products_count > 0 && (
                <div className="small mt-1">
                    <i className="bi bi-bag me-1" />
                    {video.products_count} article{video.products_count > 1 ? 's' : ''} présenté{video.products_count > 1 ? 's' : ''}
                </div>
            )}
        </Link>
    );
}
