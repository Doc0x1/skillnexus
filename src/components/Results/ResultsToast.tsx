import { Toaster, toast } from 'sonner'

interface ResultsToastProps {
    testName: string
    time: number
    accuracy: number
}

export default function ResultsToast({ testName, time, accuracy }: ResultsToastProps) {
    return <Toaster position="top-center" richColors closeButton />;
}