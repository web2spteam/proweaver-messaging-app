"use client";
import React, { ReactNode } from "react";
import { useModal } from "@/app/context/ModalContext";

interface ModalButtonProps {
  modalType: string; // The type of modal to open
  dataID?: string | number; // Optional data ID to pass to the modal
  children: React.ReactNode; // Children prop for custom button content
  className?: string; // Optional className prop for customization
  onClose?: () => void; // Optional onClose handler
}

const ModalButton: React.FC<ModalButtonProps> = ({
  modalType,
  dataID,
  children,
  className = "",
  onClose,
}) => {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(modalType, dataID);

    // Call onClose if provided
    if (onClose) {
      onClose();
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export default ModalButton;
