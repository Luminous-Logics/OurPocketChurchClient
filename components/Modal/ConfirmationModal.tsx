"use client";
import React from "react";
import Modal from "./index";
import Button from "../Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) => {
  const footerContent = (
    <div className="flex justify-end space-x-2">
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
        Confirm
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footerContent}>
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmationModal;
