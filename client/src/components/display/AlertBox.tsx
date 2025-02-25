import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertType } from '@/types';

export default function AlertBox({
    type,
    message,
}: {
    type: AlertType;
    message: string;
}) {
    return (
        <Alert variant={type} className="bg-white min-w-[250px]">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{type == 'default' ? 'Info' : 'Error'}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
