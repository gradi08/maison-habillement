import { Form } from 'react-bootstrap';

/** Champ texte Bootstrap + message d'erreur Laravel. */
export default function TextField({ id, label, error, help, className = '', ...props }) {
    return (
        <Form.Group controlId={id} className={className}>
            <Form.Label>{label}</Form.Label>
            <Form.Control isInvalid={!!error} {...props} />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
            {help && !error && <Form.Text>{help}</Form.Text>}
        </Form.Group>
    );
}
