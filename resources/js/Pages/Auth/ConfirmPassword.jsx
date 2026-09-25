import { useForm } from '@inertiajs/react';
import { Button, Form, Spinner } from 'react-bootstrap';
import TextField from '@/Components/TextField';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout title="Confirmer votre mot de passe">
            <p className="small text-muted-brand">Zone sécurisée : confirmez votre mot de passe pour continuer.</p>
            <Form onSubmit={submit} className="d-grid gap-3">
                <TextField id="password" label="Mot de passe" type="password" autoFocus value={data.password}
                    error={errors.password} onChange={(e) => setData('password', e.target.value)} />
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner size="sm" className="me-2" />}Confirmer
                </Button>
            </Form>
        </GuestLayout>
    );
}
