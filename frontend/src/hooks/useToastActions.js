import { toast } from 'sonner';

export const useToastActions = () => {
    const showSuccess = (message, description) => {
        toast.success(message, {
            description,
            duration: 3000,
        });
    };

    const showError = (message, description) => {
        toast.error(message, {
            description,
            duration: 4000,
        });
    };

    const showLoading = (message) => {
        return toast.loading(message);
    };

    const showInfo = (message, description) => {
        toast.info(message, {
            description,
            duration: 3000,
        });
    };

    const dismissToast = (toastId) => {
        toast.dismiss(toastId);
    };

    return {
        showSuccess,
        showError,
        showLoading,
        showInfo,
        dismissToast,
    };
};
