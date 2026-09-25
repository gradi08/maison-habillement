import { Link } from '@inertiajs/react';

/** Pagination Laravel (`meta.links` d'une ResourceCollection paginée). */
export default function Pagination({ meta, label = 'Pagination' }) {
    if (!meta || meta.last_page <= 1) return null;

    const links = meta.links ?? [];

    return (
        <nav aria-label={label} className="d-flex justify-content-center mt-5">
            <ul className="pagination mb-0">
                {links.map((link, index) => {
                    const isPrev = index === 0;
                    const isNext = index === links.length - 1;
                    const text = isPrev ? (
                        <><i className="bi bi-chevron-left" /><span className="visually-hidden">Page précédente</span></>
                    ) : isNext ? (
                        <><i className="bi bi-chevron-right" /><span className="visually-hidden">Page suivante</span></>
                    ) : (
                        link.label
                    );

                    return (
                        <li
                            key={`${index}-${link.label}`}
                            className={`page-item${link.active ? ' active' : ''}${!link.url ? ' disabled' : ''}`}
                        >
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    className="page-link"
                                    preserveState
                                    aria-current={link.active ? 'page' : undefined}
                                >
                                    {text}
                                </Link>
                            ) : (
                                <span className="page-link">{text}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
