import React from 'react'
import Modal from 'react-modal'
import './SelectTestModal.css'

interface SelectTestModalProps {
    isOpen: boolean
    selectedCommandSet: string
    groupedEntries: { [key: string]: [string, { name: string; value: string; type: string }][] }
    isTestRunning: boolean
    onRequestClose: () => void
    handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

Modal.setAppElement('#root')

const SelectTestModal: React.FC<SelectTestModalProps> = ({
    selectedCommandSet,
    isOpen,
    groupedEntries,
    isTestRunning,
    onRequestClose,
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
                <h1 className="select-none text-3xl font-semibold">Select a Test</h1>
                <br />
                <div className="test-selector flex gap-2">
                    <div className="flex select-none flex-col items-center justify-center">
                        <select
                            id="test-select"
                            value={selectedCommandSet}
                            onChange={handleSelectChange}
                            className="control-element"
                            disabled={isTestRunning}
                        >
                            <option className="text-left" value="" unselectable="on">
                                Select a Test
                            </option>
                            {Object.keys(groupedEntries).map(type => (
                                <optgroup className="text-left" key={type} label={type.replace(/-/g, ' ')}>
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
                                onClick={onRequestClose}
                                disabled={!selectedCommandSet}
                            >
                                Select Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default SelectTestModal
