import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import FlashToasts from '@/Components/FlashToasts';
import { APP_NAME as appName } from '@/lib/brand';

const NAV = [
    { route: 'admin.dashboard', match: 'admin.dashboard', icon: 'bi-speedometer2', label: 'Tableau de bord' },
    { route: 'admin.products.index', match: 'admin.products.*', icon: 'bi-bag', label: 'Produits' },
    { route: 'admin.categories.index', match: 'admin.categories.*', icon: 'bi-diagram-3', label: 'Catégories' },
    { route: 'admin.collections.index', match: 'admin.collections.*', icon: 'bi-collection', label: 'Collections' },
    { route: 'admin.settings.edit', match: 'admin.settings.*', icon: 'bi-sliders', label: 'Réglages' },
];

export default function AdminLayout({ title, actions = null, children }) {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="admin-shell d-lg-flex">
            <Head title={title ? `${title} · Admin` : 'Admin'} />

            <Offcanvas
                show={menuOpen}
                onHide={() => setMenuOpen(false)}
                responsive="lg"
                className="admin-sidebar"
                aria-labelledby="admin-menu-title"
            >
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title id="admin-menu-title" className="brand-gold on-dark">{appName}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column p-3 w-100">
                    <div className="d-none d-lg-block brand-gold on-dark fs-4 px-2 mb-4">{appName}</div>
                    <Nav className="flex-column gap-1" as="ul">
                        {NAV.map((item) => (
                            <Nav.Item as="li" key={item.route}>
                                <Nav.Link
                                    as={Link}
                                    href={route(item.route)}
                                    active={route().current(item.match)}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <i className={`bi ${item.icon} me-2`} />
                                    {item.label}
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                    <Nav className="flex-column gap-1 mt-auto pt-4 border-top border-secondary" as="ul">
                        <Nav.Item as="li">
                            <Nav.Link href={route('home')} target="_blank" rel="noopener">
                                <i className="bi bi-box-arrow-up-right me-2" />Voir le site
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Nav.Link as={Link} href={route('profile.edit')} active={route().current('profile.*')}>
                                <i className="bi bi-person-circle me-2" />{auth.user.name}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link href={route('logout')} method="post" as="button" className="nav-link w-100 text-start">
                                <i className="bi bi-box-arrow-right me-2" />Déconnexion
                            </Link>
                        </Nav.Item>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>

            <div className="flex-grow-1 min-w-0">
                <header className="bg-white border-bottom">
                    <div className="container-fluid px-3 px-lg-4 py-3 d-flex flex-wrap align-items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary d-lg-none"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Ouvrir le menu"
                        >
                            <i className="bi bi-list" />
                        </button>
                        <h1 className="h3 mb-0 me-auto">{title}</h1>
                        {actions}
                    </div>
                </header>
                <main className="container-fluid px-3 px-lg-4 py-4">{children}</main>
            </div>

            <FlashToasts />
        </div>
    );
}
