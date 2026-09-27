import { Link } from '@inertiajs/react';
import { Badge, Table } from 'react-bootstrap';
import DeleteButton from '@/Components/Admin/DeleteButton';
import AdminLayout from '@/Layouts/AdminLayout';

export default function VideosIndex({ videos }) {
    return (
        <AdminLayout
            title="Vidéos"
            actions={
                <Link href={route('admin.videos.create')} className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1" />Nouvelle vidéo
                </Link>
            }
        >
            <div className="admin-card">
                {videos.length === 0 ? (
                    <div className="p-4 text-muted-brand">
                        <p className="mb-2">Aucune vidéo pour le moment.</p>
                        <p className="small mb-0">
                            Publiez d'abord la vidéo sur YouTube (un Short convient très bien), puis cliquez sur
                            « Nouvelle vidéo » et collez son lien.
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                            <thead className="small text-muted-brand">
                                <tr>
                                    <th scope="col" style={{ width: '5.5rem' }}><span className="visually-hidden">Aperçu</span></th>
                                    <th scope="col">Vidéo</th>
                                    <th scope="col">Articles</th>
                                    <th scope="col">Statut</th>
                                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.map((v) => (
                                    <tr key={v.id}>
                                        <td>
                                            <img src={v.thumbnail_url} alt="" className="rounded" style={{ width: '5rem', height: '2.8rem', objectFit: 'cover' }} loading="lazy" />
                                        </td>
                                        <td>
                                            <Link href={route('admin.videos.edit', v.id)} className="fw-medium link-body-emphasis">{v.title}</Link>
                                            <div className="small text-muted-brand">
                                                {[v.is_vertical ? 'Format vertical' : 'Format horizontal', v.category_name, v.collection_name && `Collection ${v.collection_name}`]
                                                    .filter(Boolean).join(' · ')}
                                            </div>
                                        </td>
                                        <td>{v.products_count}</td>
                                        <td>
                                            {!v.is_published ? (
                                                <Badge bg="secondary">Brouillon</Badge>
                                            ) : v.is_scheduled ? (
                                                <Badge bg="info" text="dark" title={new Date(v.published_at).toLocaleString('fr-FR')}>Programmée</Badge>
                                            ) : (
                                                <Badge bg="success">En ligne</Badge>
                                            )}
                                        </td>
                                        <td className="text-end text-nowrap">
                                            <a href={v.public_url} target="_blank" rel="noopener" className="btn btn-sm btn-outline-secondary me-1" aria-label={`Voir ${v.title} sur le site`}>
                                                <i className="bi bi-eye" />
                                            </a>
                                            <Link href={route('admin.videos.edit', v.id)} className="btn btn-sm btn-outline-secondary me-1" aria-label={`Modifier ${v.title}`}>
                                                <i className="bi bi-pencil" />
                                            </Link>
                                            <DeleteButton
                                                href={route('admin.videos.destroy', v.id)}
                                                aria-label={`Retirer ${v.title}`}
                                                title={`Retirer « ${v.title} » du site ?`}
                                                message="La vidéo n'apparaîtra plus sur le site. Elle reste sur votre chaîne YouTube."
                                                confirmLabel="Retirer"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
