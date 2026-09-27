import { Link, usePage } from '@inertiajs/react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import SocialLinks from '@/Components/SocialLinks';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { APP_NAME as appName } from '@/lib/brand';

export default function PublicLayout({ children }) {
    const { settings, navCategories, auth } = usePage().props;
    const url = usePage().url;
    const whatsapp = buildWhatsAppUrl(settings.whatsapp_number, 'Bonjour, j’ai une question.');
    const isActive = (path) => url === path || url.startsWith(`${path}?`) || url.startsWith(`${path}/`);

    return (
        <div className="d-flex flex-column min-vh-100">
            <a href="#contenu" className="visually-hidden-focusable position-absolute top-0 start-0 p-2 bg-white z-3">
                Aller au contenu
            </a>

            <Navbar expand="xl" sticky="top" className="site-nav py-2" collapseOnSelect>
                <Container>
                    <Navbar.Brand as={Link} href={route('home')} className="brand-gold">
                        {appName}
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="site-menu" aria-label="Ouvrir le menu" />
                    <Navbar.Collapse id="site-menu">
                        <Nav className="me-auto ms-xl-4">
                            <Nav.Link as={Link} href={route('products.index')} active={url === '/catalogue'}>
                                Catalogue
                            </Nav.Link>
                            {navCategories.map((c) => (
                                <Nav.Link
                                    key={c.slug}
                                    as={Link}
                                    href={route('products.index', { category: c.slug })}
                                    active={url.startsWith('/catalogue') && url.includes(`category=${c.slug}`)}
                                >
                                    {c.name}
                                </Nav.Link>
                            ))}
                            <Nav.Link as={Link} href={route('videos.index')} active={isActive('/videos')}>
                                <i className="bi bi-play-circle me-1" aria-hidden="true" />Vidéos
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link as={Link} href={route('about')} active={isActive('/a-propos')}>À propos</Nav.Link>
                            <Nav.Link as={Link} href={route('contact')} active={isActive('/contact')}>Contact</Nav.Link>
                            {auth.user?.is_admin && (
                                <Nav.Link href={route('admin.dashboard')}>
                                    <i className="bi bi-gear me-1" />Admin
                                </Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main id="contenu" className="flex-grow-1">
                {children}
            </main>

            <footer className="bg-sand mt-5 pt-5 pb-4">
                <Container>
                    <div className="row g-4">
                        <div className="col-md-5">
                            <div className="brand-gold fs-3 mb-2">{appName}</div>
                            {settings.about_text && (
                                <p className="text-muted-brand small mb-3" style={{ maxWidth: '28rem' }}>
                                    {settings.about_text.length > 180
                                        ? `${settings.about_text.slice(0, 180).trim()}…`
                                        : settings.about_text}
                                </p>
                            )}
                            <SocialLinks />
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="filter-title mb-3">Boutique</div>
                            <ul className="list-unstyled small d-grid gap-2">
                                <li><Link href={route('products.index')} className="link-body-emphasis">Tout le catalogue</Link></li>
                                {navCategories.map((c) => (
                                    <li key={c.slug}>
                                        <Link href={route('products.index', { category: c.slug })} className="link-body-emphasis">{c.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-6 col-md-4">
                            <div className="filter-title mb-3">Nous contacter</div>
                            <ul className="list-unstyled small d-grid gap-2 text-muted-brand">
                                {whatsapp && (
                                    <li><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="link-body-emphasis"><i className="bi bi-whatsapp me-2" />WhatsApp</a></li>
                                )}
                                {settings.contact_email && (
                                    <li><a href={`mailto:${settings.contact_email}`} className="link-body-emphasis"><i className="bi bi-envelope me-2" />{settings.contact_email}</a></li>
                                )}
                                {settings.contact_phone && <li><i className="bi bi-telephone me-2" />{settings.contact_phone}</li>}
                                {settings.contact_address && <li><i className="bi bi-geo-alt me-2" />{settings.contact_address}</li>}
                                <li><Link href={route('contact')} className="link-body-emphasis">Page contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <p className="small text-muted-brand mb-0">© {new Date().getFullYear()} {appName}</p>
                </Container>
            </footer>
        </div>
    );
}
