import { useState } from 'react';

/**
 * Lecteur YouTube « à la demande » : tant que le visiteur n'a pas cliqué, seule l'image d'aperçu
 * est chargée (quelques Ko). Le lecteur YouTube (≈ 1 Mo de scripts, cookies tiers) n'est chargé
 * qu'au clic : la page reste rapide et rien n'est envoyé à YouTube sans action du visiteur.
 *
 * @param {{ video: { youtube_id: string, title: string, is_vertical: boolean, thumbnail_url: string, embed_url: string }, priority?: boolean }} props
 */
export default function VideoPlayer({ video, priority = false }) {
    const [playing, setPlaying] = useState(false);
    const ratio = video.is_vertical ? 'ratio-vertical' : 'ratio-landscape';

    return (
        <div className={`video-frame ${ratio}${video.is_vertical ? ' vertical' : ''}`}>
            {playing ? (
                <iframe
                    src={video.embed_url}
                    title={video.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            ) : (
                <button
                    type="button"
                    className="video-poster"
                    onClick={() => setPlaying(true)}
                    aria-label={`Lire la vidéo : ${video.title}`}
                >
                    <img
                        src={video.thumbnail_url}
                        alt=""
                        {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })}
                    />
                    <span className="video-play" aria-hidden="true">
                        <i className="bi bi-play-fill" />
                    </span>
                </button>
            )}
        </div>
    );
}
