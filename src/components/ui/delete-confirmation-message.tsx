interface DeleteConfirmationMessageProps {
    label: string;
  }
  
  export function DeleteConfirmationMessage({ label }: DeleteConfirmationMessageProps) {
    return (
      <p>
        Are you sure you want to delete <strong>{label}</strong>? This action will permanently remove the data.
      </p>
    );
  }
  