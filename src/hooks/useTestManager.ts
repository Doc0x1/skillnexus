import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Entries } from '../types/commandSet'
import commandsJson from '../commands.json'

export const useTestManager = () => {
    const [selectedCommandSet, setSelectedCommandSet] = useState<string>('')
    const [entries, setEntries] = useState<Entries>({})
    const [commandSetMapping, setCommandSetMapping] = useState<{ [key: string]: string }>({})
    const [isTestRunning, setIsTestRunning] = useState<boolean>(false)
    const [selectTestModalIsOpen, setSelectTestModalIsOpen] = useState<boolean>(false)
    const [elapsedTime, setElapsedTime] = useState<number>(0)
    const [commandsRemaining, setCommandsRemaining] = useState<number>(0)
    const [testModeTerminalId, setTestModeTerminalId] = useState<string | null>(null)

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

    // Add useEffect to track test progress
    useEffect(() => {
        let timer: NodeJS.Timeout
        
        if (isTestRunning) {
            const startTime = Date.now()
            const selectedSet = entries[commandSetMapping[selectedCommandSet]]
            if (selectedSet) {
                setCommandsRemaining(selectedSet.commands.length)
            }
            
            timer = setInterval(() => {
                setElapsedTime((Date.now() - startTime) / 1000)
            }, 100)
        } else {
            setElapsedTime(0)
            setCommandsRemaining(0)
        }
        
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isTestRunning, selectedCommandSet, entries, commandSetMapping])

    const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCommandSet(e.target.value)
    }, [])

    const startTest = useCallback(() => {
        setIsTestRunning(true)
        setSelectTestModalIsOpen(false) // Close the modal when the test starts
    }, [])

    const stopTest = useCallback(() => {
        setIsTestRunning(false)
    }, [])

    const handleFinishTest = useCallback((accuracy: number, duration: number) => {
        const testName = entries[commandSetMapping[selectedCommandSet]].name
        toast.success(`${testName} Complete! Accuracy: ${accuracy.toFixed(2)}%, Duration: ${duration.toFixed(2)}s`, {
            style: {
                borderRadius: '8px',
                background: '#333',
                color: '#fff',
                fontFamily: 'IBM Plex Mono, monospace',
                marginTop: '50px'
            },
            // Make duration infinite
            duration: Infinity
        })
        setIsTestRunning(false)
        setElapsedTime(0)
        setCommandsRemaining(0)
    }, [entries, commandSetMapping, selectedCommandSet])

    const handleCommandProgress = useCallback((remaining: number) => {
        setCommandsRemaining(remaining)
    }, [])

    const openSelectTestModal = useCallback(() => {
        setSelectTestModalIsOpen(true)
    }, [])

    const closeSelectTestModal = useCallback(() => {
        setSelectTestModalIsOpen(false)
    }, [])

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

    return {
        selectedCommandSet,
        entries,
        commandSetMapping,
        isTestRunning,
        selectTestModalIsOpen,
        elapsedTime,
        commandsRemaining,
        testModeTerminalId,
        groupedEntries,
        setTestModeTerminalId,
        handleSelectChange,
        startTest,
        stopTest,
        handleFinishTest,
        handleCommandProgress,
        openSelectTestModal,
        closeSelectTestModal
    }
}