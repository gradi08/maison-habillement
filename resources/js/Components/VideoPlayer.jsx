import { useState } from 'react';

/**
 * Lecteur vidéo « à la demande » : tant que le visiteur n'a pas cliqué, seule l'image d'aperçu
 * est chargée (quelques Ko). La vidéo n'est téléchargée qu'au clic, que ce soit :
 *  - un fichier du site (balise <video>, rien n'est préchargé) ;
 *  - une vidéo YouTube (iframe youtube-nocookie, rien n'est envoyé à YouTube avant le clic).
 *
 * @param {{ video: object, priority?: boolean }} props
 */
export default function VideoPlayer({ video, priority = false }) {
    const [playing, setPlaying] = useState(false);
    const ratio = video.is_vertical ? 'ratio-vertical' : 'ratio-landscape';
    const isFile = video.source === 'file';

    return (
        <div className={`video-frame ${ratio}${video.is_vertical ? ' vertical' : ''}`}>
            {playing ? (
                isFile ? (
                    <video
                        src={video.file_url}
                        poster={video.thumbnail_url ?? undefined}
                        controls
                        autoPlay
                        playsInline
                        preload="auto"
                        title={video.title}
                    >
                        Votre navigateur ne peut pas lire cette vidéo.
                    </video>
                ) : (
                    <iframe
                        src={video.embed_url}
                        title={video.title}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                )
            ) : (
                <button
                    type="button"
                    className="video-poster"
                    onClick={() => setPlaying(true)}
                    aria-label={`Lire la vidéo : ${video.title}`}
                >
                    {video.thumbnail_url && (
                        <img
                            src={video.thumbnail_url}
                            alt=""
                            {...(priority ? { fetchPriority: 'high' } : { loading: 'lazy' })}
                        />
                    )}
                    <span className="video-play" aria-hidden="true">
                        <i className="bi bi-play-fill" />
                    </span>
                </button>
            )}
        </div>
    );
}
