import { Link, useForm } from '@inertiajs/react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    return (
        <GuestLayout title="Vérifiez votre adresse e-mail">
            <p className="small text-muted-brand">
                Cliquez sur le lien reçu par e-mail pour confirmer votre adresse. Rien reçu ? Nous pouvons vous en renvoyer un.
            </p>
            {status === 'verification-link-sent' && (
                <Alert variant="success" className="small">Un nouveau lien vient d'être envoyé.</Alert>
            )}
            <div className="d-flex justify-content-between align-items-center">
                <Button onClick={() => post(route('verification.send'))} disabled={processing}>
                    {processing && <Spinner size="sm" className="me-2" />}Renvoyer le lien
                </Button>
                <Link href={route('logout')} method="post" as="button" className="btn btn-link btn-sm">Déconnexion</Link>
            </div>
        </GuestLayout>
    );
}
