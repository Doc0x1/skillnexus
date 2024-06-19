import React, { useEffect, useState } from 'react'
import './App.css'
import Terminal from './components/Terminal'
import { Entries } from './types/commandSet'
import commandsJson from './commands.json'

function App() {
    const [selectedCommandSet, setSelectedCommandSet] = useState<string>('')
    const [entries, setEntries] = useState<Entries>({})
    const [commandSetMapping, setCommandSetMapping] = useState<{ [key: string]: string }>({})
    const [isTestRunning, setIsTestRunning] = useState<boolean>(false)
    const [results, setResults] = useState<{ accuracy: number; duration: number } | null>(null)

    useEffect(() => {
        const jsonEntries: Entries = commandsJson
        setEntries(jsonEntries)

        const mapping: { [key: string]: string } = {}
        for (const key in jsonEntries) {
            if (jsonEntries.hasOwnProperty(key)) {
                const value = jsonEntries[key].value
                mapping[value] = key
            }
        }
        setCommandSetMapping(mapping)
    }, [])

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCommandSet(e.target.value)
    }

    const startTest = () => {
        setIsTestRunning(true)
        setResults(null) // Reset previous results
    }

    const stopTest = () => {
        setIsTestRunning(false)
    }

    const handleFinishTest = (accuracy: number, duration: number) => {
        setIsTestRunning(false)
        setResults({ accuracy, duration })
    }

    return (
        <div className="App">
            <div className="control-panel">
                <select
                    id="test-select"
                    value={selectedCommandSet}
                    onChange={handleSelectChange}
                    className="control-element"
                    disabled={isTestRunning}
                >
                    <option value="">Select Test</option>
                    {Object.entries(entries).map(([commands, { value }]) => (
                        <option key={value} value={value}>
                            {commands}
                        </option>
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
            <Terminal
                selectedCommandSet={entries[commandSetMapping[selectedCommandSet]] || {}}
                isTestRunning={isTestRunning}
                onStartTest={startTest}
                onFinishTest={handleFinishTest}
            />
            {results && (
                <div className="result-modal">
                    <h2>Test Results</h2>
                    <p>Accuracy: {results.accuracy}%</p>
                    <p>Duration: {results.duration} seconds</p>
                </div>
            )}
        </div>
    )
}

export default App
