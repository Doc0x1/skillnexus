import React, { useEffect, useState } from 'react'
import './App.css'
import Terminal from './components/Terminal'
import { Entries } from './types/commandSet'
import commandsJson from './commands.json'

function App() {
    const [selectedCommandSet, setSelectedCommandSet] = useState<string>('')
    const [entries, setEntries] = useState<Entries>({})
    const [commandSetMapping, setCommandSetMapping] = useState<{ [key: string]: string }>({})

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
        setSelectedCommandSet(selectedCommandSet)
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
                >
                    Start Test
                </button>
            </div>
            <Terminal selectedCommandSet={entries[commandSetMapping[selectedCommandSet]] || {}} />
        </div>
    )
}

export default App
