import React, { useEffect, useState } from 'react'
import './App.css'
import Terminal from './components/Terminal'
import LoadingIndicator from './components/LoadingIndicator/LoadingIndicator'
import XFCEMenuBar from './components/XFCEMenuBar/XFCEMenuBar'
import { Entries } from './types/commandSet'
import commandsJson from './commands.json'

function App() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [selectedCommandSet, setSelectedCommandSet] = useState<string>('')
    const [entries, setEntries] = useState<Entries>({})
    const [commandSetMapping, setCommandSetMapping] = useState<{ [key: string]: string }>({})
    const [isTestRunning, setIsTestRunning] = useState<boolean>(false)
    const [results, setResults] = useState<{ testName: string; accuracy: number; duration: number }[]>([])

    useEffect(() => {
        const bgImage = new Image()
        bgImage.src = `${process.env.PUBLIC_URL}/background.jpg`
        bgImage.onload = () => {
            setIsLoading(false)
        }
    }, [])

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

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCommandSet(e.target.value)
    }

    const startTest = () => {
        setIsTestRunning(true)
    }

    const stopTest = () => {
        setIsTestRunning(false)
    }

    const handleFinishTest = (accuracy: number, duration: number) => {
        const testName = entries[commandSetMapping[selectedCommandSet]].name
        setResults(prevResults => [...prevResults, { testName, accuracy, duration }])
        setIsTestRunning(false)
    }

    if (isLoading) {
        return <LoadingIndicator />
    }

    const groupedEntries = Object.entries(entries).reduce(
        (acc, [key, value]) => {
            if (!acc[value.type]) {
                acc[value.type] = []
            }
            acc[value.type].push([key, value])
            return acc
        },
        {} as { [key: string]: [string, { name: string; value: string; type: string }][] }
    )

    return (
        <div className="App" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)` }}>
            <div className="w-full text-center">
                <XFCEMenuBar
                    selectedCommandSet={selectedCommandSet}
                    handleSelectChange={handleSelectChange}
                    isTestRunning={isTestRunning}
                    startTest={startTest}
                    stopTest={stopTest}
                    groupedEntries={groupedEntries}
                />
            </div>

            <Terminal
                selectedCommandSet={entries[commandSetMapping[selectedCommandSet]] || {}}
                isTestRunning={isTestRunning}
                onStartTest={startTest}
                onStopTest={stopTest}
                onFinishTest={handleFinishTest}
            />
            {results.length > 0 ? (
                <div className="result-modal mt-4">
                    <div className="text-xl font-bold">Previous Results</div>
                    <hr className="border-green-600" />
                    {results.map((result, index) => (
                        <div key={index} className="result-item mb-2">
                            <div className="pb-1 pt-1 text-center text-lg font-bold">{result.testName}</div>
                            <div className="pl-[10px] text-left text-base font-medium">
                                Accuracy: {result.accuracy}%
                            </div>
                            <div className="pl-[10px] text-left text-base font-medium">
                                Duration: {result.duration}s
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-4 text-center">
                    Welcome to Skill Nexus!
                    <br />
                    We will be adding more features as time goes on, but for now, enjoy the Terminal!
                </div>
            )}

            <div className="bottom-left">
                <a
                    href="https://discord.gg/hacknexus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="corner-button"
                >
                    Join us on Discord
                </a>
            </div>
            <div className="bottom-right">
                <a
                    href="https://www.patreon.com/hacknexus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="corner-button"
                >
                    Support us on Patreon
                </a>
            </div>
        </div>
    )
}

export default App
