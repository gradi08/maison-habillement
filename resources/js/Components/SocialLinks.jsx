import { usePage } from '@inertiajs/react';

const NETWORKS = [
    { key: 'instagram_url', icon: 'bi-instagram', label: 'Instagram' },
    { key: 'facebook_url', icon: 'bi-facebook', label: 'Facebook' },
    { key: 'tiktok_url', icon: 'bi-tiktok', label: 'TikTok' },
];

export default function SocialLinks({ className = '' }) {
    const { settings } = usePage().props;
    const links = NETWORKS.filter((n) => settings[n.key]);

    if (links.length === 0) return null;

    return (
        <ul className={`list-inline mb-0 ${className}`}>
            {links.map((n) => (
                <li key={n.key} className="list-inline-item me-3">
                    <a href={settings[n.key]} target="_blank" rel="noopener noreferrer" className="link-body-emphasis fs-5" aria-label={n.label}>
                        <i className={`bi ${n.icon}`} />
                    </a>
                </li>
            ))}
        </ul>
    );
}
