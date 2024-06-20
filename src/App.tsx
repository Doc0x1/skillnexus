import React, { useEffect, useState } from 'react'
import './App.css'
import Terminal from './components/Terminal'
import { Entries } from './types/commandSet'
import commandsJson from './commands.json'

function App() {
    const [selectedCommandSet, setSelectedCommandSet] = useState<string>('')
    const [commandSetName, setCommandSetName] = useState<string>('No Test Selected')
    const [entries, setEntries] = useState<Entries>({})
    const [commandSetMapping, setCommandSetMapping] = useState<{ [key: string]: string }>({})
    const [isTestRunning, setIsTestRunning] = useState<boolean>(false)
    const [results, setResults] = useState<{ accuracy: number; duration: number } | null>(null)

    useEffect(() => {
        const jsonEntries: Entries = commandsJson
        setEntries(jsonEntries as Entries)

        const mapping: { [key: string]: string } = {}
        for (const key in jsonEntries) {
            if (jsonEntries.hasOwnProperty(key)) {
                const value = jsonEntries[key].value
                mapping[value] = key
            }
        }
        setCommandSetMapping(mapping)
    }, [])

    useEffect(() => {
        if (selectedCommandSet !== '') {
            setCommandSetName(entries[commandSetMapping[selectedCommandSet]].name)
        }
    }, [selectedCommandSet, commandSetMapping, entries])

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCommandSet(e.target.value)
    }

    const startTest = () => {
        setIsTestRunning(true)
        //setResults(null) // Reset previous results
    }

    const stopTest = () => {
        setIsTestRunning(false)
    }

    const handleFinishTest = (accuracy: number, duration: number) => {
        setResults({ accuracy, duration })
        setIsTestRunning(false)
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
                    <option value="" unselectable="on">
                        Select Test
                    </option>
                    <option value="" disabled>
                        -----
                    </option>
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
                onStopTest={stopTest}
                onFinishTest={handleFinishTest}
            />
            {results ? (
                <div className="result-modal mt-4">
                    <div className="text-xl font-bold">Previous Results</div>
                    <hr className="border-green-600" />
                    <div className="pb-1 pt-1 text-center text-lg font-bold">{commandSetName}</div>
                    <div className="pl-[10px] text-left text-base font-medium">Accuracy: {results.accuracy}%</div>
                    <div className="pl-[10px] text-left text-base font-medium">Duration: {results.duration}s</div>
                </div>
            ) : (
                <div className="mt-4 text-center">
                    Welcome to Skill Nexus!
                    <br />
                    We will be adding more features as time goes on, but for now, enjoy the Terminal!
                </div>
            )}
        </div>
    )
}

export default App
