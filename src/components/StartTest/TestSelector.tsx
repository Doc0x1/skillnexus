import React from 'react'

interface TestSelectorProps {
    selectedCommandSet: string
    groupedEntries: { [key: string]: [string, { name: string; value: string; type: string }][] }
    isTestRunning: boolean
    handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    startTest: () => void
    stopTest: () => void
}

export const TestSelector: React.FC<TestSelectorProps> = ({
    selectedCommandSet,
    groupedEntries,
    isTestRunning,
    handleSelectChange,
    startTest,
    stopTest,
}) => {
    return (
        <div className="test-selector flex gap-2">
            <select
                id="test-select"
                value={selectedCommandSet}
                onChange={handleSelectChange}
                className="control-element"
                disabled={isTestRunning}
            >
                <option value="" unselectable="on">
                    Select Test
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
            {isTestRunning ? (
                <button className="stop-test-button control-element" onClick={stopTest}>
                    Stop Test
                </button>
            ) : (
                <button
                    className="start-test-button control-element"
                    onClick={startTest}
                    disabled={!selectedCommandSet}
                >
                    Start Test
                </button>
            )}
        </div>
    )
}
