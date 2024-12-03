"use client";
import { FC } from "react";
import { useModal } from "@/app/context/ModalContext";
import { BatchInfoProvider } from "./studentsComponents/BatchInfo";
import AddNewBatchModal from "./modals/AddNewBatchModal";
import EditBatchDetailsModal from "./modals/EditBatchDetailsModal";
import AddStudentModal from "./modals/AddStudentModal";
import EditStudentDetailsModal from "./modals/EditStudentDetailsModal";
import AddNewSubjectModal from "./modals/AddNewSubjectModal";
import AddNewModuleModal from "./modals/AddNewModuleModal";
import AddNewMaterialModal from "./modals/AddNewMaterialModal";
import SetQuizExpiryModal from "./modals/SetQuizExpiryModal";
import EditSubjectModal from "./modals/EditSubjectModal";
import AssignToBatchModal from "./modals/AssignToBatchModal";
import SetTestExpiryModal from "./modals/SetTestExpiryModal";
import AssignTestToBatchModal from "./modals/AssignTestToBatchModal";

const ModalManager: FC = () => {
    const { modalType, isOpen, closeModal, dataID } = useModal(); // Get the modal state from context

    if (!isOpen) return null; // Don't render the modal if it's not open

    switch (modalType) {
        case "addNewBatch":
            return <AddNewBatchModal isOpen={isOpen} onClose={closeModal} />;
        case "editBatchDetails":
            return (
                <EditBatchDetailsModal
                    isOpen={isOpen}
                    onClose={closeModal}
                    batchID={dataID}
                />
            );
        case "addStudent":
            return (
                <BatchInfoProvider>
                    <AddStudentModal isOpen={isOpen} onClose={closeModal} />
                </BatchInfoProvider>
            );
        case "editStudentModal":
            return (
                <EditStudentDetailsModal
                    isOpen={isOpen}
                    onClose={closeModal}
                    studentID={dataID}
                />
            );
        case "addNewSubject":
            return <AddNewSubjectModal isOpen={isOpen} onClose={closeModal} />;
        case "editSubject":
            return <EditSubjectModal isOpen={isOpen} onClose={closeModal} subjectId={dataID} />;
        case "assignSubjectToBatch":
            return <AssignToBatchModal isOpen={isOpen} onClose={closeModal} subjectId={dataID} />;
        case "addNewModule":
            return <AddNewModuleModal isOpen={isOpen} onClose={closeModal} />;
        case "addNewMaterial":
            return <AddNewMaterialModal isOpen={isOpen} onClose={closeModal} />;
        case "setQuizExpiryModal":
            return <SetQuizExpiryModal isOpen={isOpen} onClose={closeModal} quizId={dataID} />;
        case "setTestExpiryModal":
            return <SetTestExpiryModal isOpen={isOpen} onClose={closeModal} testId={dataID} />;
        case "assignTestToBatch":
            return <AssignTestToBatchModal isOpen={isOpen} onClose={closeModal} testId={dataID} />;
        default:
            return null;
    }
};

export default ModalManager;
