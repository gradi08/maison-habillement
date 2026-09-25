import { Link, useForm } from '@inertiajs/react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import TextField from '@/Components/TextField';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout title="Mot de passe oublié">
            <p className="small text-muted-brand">
                Indiquez votre adresse e-mail : vous recevrez un lien pour choisir un nouveau mot de passe.
            </p>
            {status && <Alert variant="success" className="small">{status}</Alert>}
            <Form onSubmit={submit} className="d-grid gap-3">
                <TextField id="email" label="E-mail" type="email" autoFocus value={data.email}
                    error={errors.email} onChange={(e) => setData('email', e.target.value)} />
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner size="sm" className="me-2" />}Envoyer le lien
                </Button>
                <Link href={route('login')} className="small text-center">Retour à la connexion</Link>
            </Form>
        </GuestLayout>
    );
}
