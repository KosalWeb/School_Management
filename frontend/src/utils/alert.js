import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});

export const showSuccessToast = (title) => {
    Toast.fire({ icon: 'success', title });
};

export const showErrorToast = (title) => {
    Toast.fire({ icon: 'error', title });
};

export const showInfoToast = (title) => {
    Toast.fire({ icon: 'info', title });
};

export const showConfirmDialog = ({ title = 'តើអ្នកប្រាកដទេ?', text = 'តើអ្នកចង់បន្តទេ?', confirmText = 'យល់ព្រម', cancelText = 'បោះបង់', onConfirm }) => {
    Swal.fire({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1e40af',
        cancelButtonColor: '#dc2626',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) onConfirm();
    });
};
