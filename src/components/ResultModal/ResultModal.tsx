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
            <div className="inline-flex select-none flex-col items-center">
                <h1 className="flex-nowrap text-3xl font-semibold">{testName} Complete!</h1>
                <br />
                <div className="font-mono text-lg font-medium">Completion Time: {time.toFixed(2)} seconds</div>
                <div className="font-mono text-lg font-medium">Accuracy Percentage: {accuracy.toFixed(2)}%</div>
                <br />
                <button
                    className="cursor-pointer rounded-lg border-2 border-red-600 px-3 py-2 font-mono text-red-400 hover:bg-red-600 hover:text-red-200"
                    onClick={onRequestClose}
                >
                    Close Results
                </button>
            </div>
        </Modal>
    )
}

export default ResultModal
