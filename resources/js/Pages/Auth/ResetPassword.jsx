import { useForm } from '@inertiajs/react';
import { Button, Form, Spinner } from 'react-bootstrap';
import TextField from '@/Components/TextField';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout title="Nouveau mot de passe">
            <Form onSubmit={submit} className="d-grid gap-3">
                <TextField id="email" label="E-mail" type="email" autoComplete="username" value={data.email}
                    error={errors.email} onChange={(e) => setData('email', e.target.value)} />
                <TextField id="password" label="Nouveau mot de passe" type="password" autoComplete="new-password" autoFocus
                    value={data.password} error={errors.password} onChange={(e) => setData('password', e.target.value)} />
                <TextField id="password_confirmation" label="Confirmation" type="password" autoComplete="new-password"
                    value={data.password_confirmation} error={errors.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)} />
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner size="sm" className="me-2" />}Enregistrer le mot de passe
                </Button>
            </Form>
        </GuestLayout>
    );
}
