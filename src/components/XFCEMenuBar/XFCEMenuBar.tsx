import React from 'react'
import './XFCEMenuBar.css'

interface XFCEMenuBarProps {
    selectedCommandSet: string
    groupedEntries: { [key: string]: [string, { name: string; value: string; type: string }][] }
    handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    isTestRunning: boolean
    startTest: () => void
    stopTest: () => void
}

const XFCEMenuBar: React.FC<XFCEMenuBarProps> = ({
    selectedCommandSet,
    groupedEntries,
    handleSelectChange,
    isTestRunning,
    startTest,
    stopTest,
}) => {
    return (
        <div className="xfce-menubar">
            <div className="menu-bar justify-center">
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
        </div>
    )
}

export default XFCEMenuBar
