import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import TextField from '@/Components/TextField';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AdminLayout title="Mon profil">
            <div className="d-grid gap-4" style={{ maxWidth: '40rem' }}>
                <ProfileInformation mustVerifyEmail={mustVerifyEmail} status={status} />
                <PasswordForm />
            </div>
        </AdminLayout>
    );
}

function ProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    return (
        <section className="admin-card p-3 p-lg-4">
            <h2 className="h5 mb-3" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Informations</h2>
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    patch(route('profile.update'), { preserveScroll: true });
                }}
                className="d-grid gap-3"
            >
                <TextField id="name" label="Nom" value={data.name} error={errors.name} autoComplete="name"
                    onChange={(e) => setData('name', e.target.value)} required />
                <TextField id="email" label="E-mail de connexion" type="email" value={data.email} error={errors.email}
                    autoComplete="username" onChange={(e) => setData('email', e.target.value)} required />

                {mustVerifyEmail && user.email_verified_at === null && (
                    <Alert variant="warning" className="small mb-0">
                        Adresse non vérifiée.{' '}
                        <Link href={route('verification.send')} method="post" as="button" className="btn btn-link btn-sm p-0 align-baseline">
                            Renvoyer l'e-mail de vérification
                        </Link>
                        {status === 'verification-link-sent' && <div className="mt-1">Un nouveau lien a été envoyé.</div>}
                    </Alert>
                )}

                <div className="d-flex align-items-center gap-3">
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner size="sm" className="me-2" />}Enregistrer
                    </Button>
                    {recentlySuccessful && <span className="small text-success" role="status"><i className="bi bi-check2 me-1" />Enregistré</span>}
                </div>
            </Form>
        </section>
    );
}

function PasswordForm() {
    const passwordInput = useRef(null);
    const currentPasswordInput = useRef(null);
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className="admin-card p-3 p-lg-4">
            <h2 className="h5 mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Mot de passe</h2>
            <p className="small text-muted-brand mb-3">Utilisez un mot de passe long et unique (12 caractères ou plus).</p>
            <Form onSubmit={submit} className="d-grid gap-3">
                <TextField id="current_password" label="Mot de passe actuel" type="password" ref={currentPasswordInput}
                    value={data.current_password} error={errors.current_password} autoComplete="current-password"
                    onChange={(e) => setData('current_password', e.target.value)} />
                <TextField id="password" label="Nouveau mot de passe" type="password" ref={passwordInput}
                    value={data.password} error={errors.password} autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)} />
                <TextField id="password_confirmation" label="Confirmation" type="password"
                    value={data.password_confirmation} error={errors.password_confirmation} autoComplete="new-password"
                    onChange={(e) => setData('password_confirmation', e.target.value)} />
                <div className="d-flex align-items-center gap-3">
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner size="sm" className="me-2" />}Changer le mot de passe
                    </Button>
                    {recentlySuccessful && <span className="small text-success" role="status"><i className="bi bi-check2 me-1" />Mot de passe modifié</span>}
                </div>
            </Form>
        </section>
    );
}
