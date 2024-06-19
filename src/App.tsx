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

    const handleFinishTest = (accuracy: number, duration: number) => {
        setIsTestRunning(false)
        setResults({ accuracy, duration })
    }

    return (
        <div className="App">
            <div className="flex flex-col items-center justify-center gap-2 pt-4 text-center">
                <select id="test-select" value={selectedCommandSet} onChange={handleSelectChange}>
                    <option value="">Select Test</option>
                    {Object.entries(entries).map(([commands, { value }]) => (
                        <option key={value} value={value}>
                            {commands}
                        </option>
                    ))}
                </select>
                <button
                    className="rounded-lg bg-blue-700 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    onClick={startTest}
                    disabled={isTestRunning || !selectedCommandSet}
                >
                    Start Test
                </button>
            </div>
            <Terminal
                selectedCommandSet={entries[commandSetMapping[selectedCommandSet]] || {}}
                isTestRunning={isTestRunning}
                onStartTest={startTest}
                onFinishTest={handleFinishTest}
            />
            {results && (
                <div>
                    <h2>Test Results</h2>
                    <p>Accuracy: {results.accuracy}%</p>
                    <p>Duration: {results.duration} seconds</p>
                </div>
            )}
        </div>
    )
}

export default App
