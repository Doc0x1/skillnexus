import React from 'react'
import Modal from 'react-modal'
import './SelectTestModal.css'

interface SelectTestModalProps {
    isOpen: boolean
    selectedCommandSet: string
    groupedEntries: { [key: string]: [string, { name: string; value: string; type: string }][] }
    isTestRunning: boolean
    onRequestClose: () => void
    startTest: () => void
    handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

Modal.setAppElement('#root')

const SelectTestModal: React.FC<SelectTestModalProps> = ({
    selectedCommandSet,
    isOpen,
    groupedEntries,
    isTestRunning,
    onRequestClose,
    startTest,
    handleSelectChange,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnOverlayClick={true}
            className="modal"
            overlayClassName="overlay"
            contentLabel="Select Test"
        >
            <div className="inline-flex flex-col items-center">
                <h1 className="text-3xl font-semibold">Select a Test</h1>
                <br />
                <div className="test-selector flex gap-2">
                    <div className="flex flex-col items-center justify-center">
                        <select
                            id="test-select"
                            value={selectedCommandSet}
                            onChange={handleSelectChange}
                            className="control-element"
                            disabled={isTestRunning}
                        >
                            <option value="" unselectable="on">
                                Select a Test
                            </option>
                            {Object.keys(groupedEntries).map(type => (
                                <optgroup key={type} label={type.replace(/-/g, ' ')}>
                                    {groupedEntries[type].map(([commands, { value }]) => (
                                        <option key={value} value={value}>
                                            {commands}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div>
                            <button
                                className="start-test-button control-element"
                                onClick={() => {
                                    startTest()
                                    onRequestClose()
                                }}
                                disabled={!selectedCommandSet}
                            >
                                Start Test
                            </button>
                        </div>
                    </div>
                </div>
                <br />
                <button
                    className="cursor-pointer rounded-lg border-2 border-blue-600 px-3 py-2 font-mono text-blue-400 hover:bg-blue-600 hover:text-blue-200"
                    onClick={onRequestClose}
                >
                    Close
                </button>
            </div>
        </Modal>
    )
}

export default SelectTestModal
