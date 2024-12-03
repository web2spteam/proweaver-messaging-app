"use client";
import React, { createContext, useContext, useState } from "react";

interface ModalContextProps {
  openModal: (
    type: string,
    dataID?: string | number,
    onClose?: () => void,
  ) => void; // Add onClose to openModal
  closeModal: () => void;
  modalType: string;
  isOpen: boolean;
  dataID?: string | number;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modalType, setModalType] = useState<string>("");
  const [isOpen, setIsModalOpen] = useState<boolean>(false);
  const [dataID, setDataID] = useState<string | number | undefined>(undefined);
  const [onCloseCallback, setOnCloseCallback] = useState<
    (() => void) | undefined
  >(undefined);

  const openModal = (
    type: string,
    id?: string | number,
    onClose?: () => void,
  ) => {
    setModalType(type);
    setDataID(id);
    setIsModalOpen(true);
    setOnCloseCallback(() => onClose); // Store the onClose callback
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setDataID(undefined);

    if (onCloseCallback) {
      onCloseCallback(); // Trigger the onClose callback if it exists
      setOnCloseCallback(undefined); // Reset the callback
    }
  };

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, modalType, isOpen, dataID }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
