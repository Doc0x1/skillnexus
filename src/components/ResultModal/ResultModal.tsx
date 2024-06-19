import React from 'react'
import Modal from 'react-modal'
import './ResultModal.css'

interface ResultModalProps {
    testName: string
    isOpen: boolean
    onRequestClose: () => void
    time: number
    accuracy: number
}

Modal.setAppElement('#root')

const ResultModal: React.FC<ResultModalProps> = ({ testName, isOpen, onRequestClose, time, accuracy }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={false}
            className="modal"
            overlayClassName="overlay"
            contentLabel="Test Complete"
        >
            <div className="modal-content">
                <h2 className="">{testName} Complete!</h2>
                <p className="pb-1 text-base font-bold">You finished the test in: {time.toFixed(2)} seconds</p>
                <p className="font-bold">Accuracy: {accuracy.toFixed(2)}%</p>
                <button className="close-button" onClick={onRequestClose}>
                    Close
                </button>
            </div>
        </Modal>
    )
}

export default ResultModal
