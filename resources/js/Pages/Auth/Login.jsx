import { Link, useForm } from '@inertiajs/react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import TextField from '@/Components/TextField';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout title="Connexion à l'administration">
            {status && <Alert variant="success" className="small">{status}</Alert>}

            <Form onSubmit={submit} className="d-grid gap-3">
                <TextField id="email" label="E-mail" type="email" autoComplete="username" autoFocus
                    value={data.email} error={errors.email} onChange={(e) => setData('email', e.target.value)} />
                <TextField id="password" label="Mot de passe" type="password" autoComplete="current-password"
                    value={data.password} error={errors.password} onChange={(e) => setData('password', e.target.value)} />
                <Form.Check id="remember" label="Rester connecté" checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)} />
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner size="sm" className="me-2" />}Se connecter
                </Button>
                {canResetPassword && (
                    <Link href={route('password.request')} className="small text-center">Mot de passe oublié ?</Link>
                )}
            </Form>
        </GuestLayout>
    );
}
