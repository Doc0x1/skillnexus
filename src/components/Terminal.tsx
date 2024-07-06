import React, { useState, useRef, useEffect } from 'react'
import './Terminal.css'
import { CommandSet } from '../types/commandSet'
import { TextInput } from './TextInput/TextInput'
import ResultModal from './ResultModal/ResultModal'
import TerminalTopBar from './TerminalTopBar'

interface TerminalProps {
    selectedCommandSet: CommandSet
    isTestRunning: boolean
    onStopTest: () => void
    onFinishTest: (accuracy: number, duration: number) => void
    openSelectTestModal: () => void
}

export default function Terminal({
    selectedCommandSet,
    isTestRunning,
    onStopTest,
    onFinishTest,
    openSelectTestModal,
}: TerminalProps) {
    const [input, setInput] = useState<string>('')
    const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(0)
    const [currentCommand, setCurrentCommand] = useState<string>('')
    const [currentDescription, setCurrentDescription] = useState<string>('')
    const [startTime, setStartTime] = useState<number | null>(null)
    const [totalIncorrectChars, setTotalIncorrectChars] = useState<number>(0)
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
    const [testDuration, setTestDuration] = useState<number>(0)
    const [testAccuracy, setTestAccuracy] = useState<number>(0)
    const [completedTestName, setCompletedTestName] = useState<string>('')

    const [elapsedTime, setElapsedTime] = useState<number>(0)
    const [commandHistory, setCommandHistory] = useState<string[]>([])

    const textInputRef = useRef<HTMLInputElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 })
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    const isDebugOn = process.env.REACT_APP_DEBUG ?? false

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isTestRunning) {
            setStartTime(Date.now())
            setInput('')
            setTotalIncorrectChars(0)
            setCurrentCommandIndex(0)
            setCommandHistory([])
            if (selectedCommandSet.commands.length > 0) {
                setCurrentCommand(selectedCommandSet.commands[0].command)
                setCurrentDescription(selectedCommandSet.commands[0].description)
            }
            if (textInputRef.current) {
                textInputRef.current.focus()
            }
            timer = setInterval(() => {
                setElapsedTime((Date.now() - (startTime || 0)) / 1000)
            }, 10)
        } else {
            cleanupInputLine()
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isTestRunning, selectedCommandSet, testDuration, testAccuracy, startTime])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX + offset.x
                const newY = e.clientY + offset.y

                // Constrain the terminal within window bounds
                const terminalElement = terminalRef.current
                if (terminalElement) {
                    const terminalWidth = terminalElement.offsetWidth
                    const terminalHeight = terminalElement.offsetHeight
                    const screenWidth = window.innerWidth
                    const screenHeight = window.innerHeight

                    const constrainedX = Math.max(0, Math.min(newX, screenWidth - terminalWidth))
                    const constrainedY = Math.max(0, Math.min(newY, screenHeight - terminalHeight))

                    setCurrentPosition({ x: constrainedX, y: constrainedY })
                }
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, offset])

    useEffect(() => {
        centerTerminal()
        window.addEventListener('resize', centerTerminal)
        return () => {
            window.removeEventListener('resize', centerTerminal)
        }
    }, [])

    const centerTerminal = () => {
        const terminalElement = terminalRef.current
        if (terminalElement) {
            const terminalWidth = terminalElement.offsetWidth
            const terminalHeight = terminalElement.offsetHeight
            const screenWidth = window.innerWidth
            const screenHeight = window.innerHeight
            const centerX = (screenWidth - terminalWidth) / 2
            const centerY = (screenHeight - terminalHeight) / 2
            setCurrentPosition({ x: centerX, y: centerY })
        }
    }

    const checkCommandInput = (updatedInput: string) => {
        const commands = selectedCommandSet?.commands || []
        if (currentCommandIndex < commands.length) {
            const expectedCommand = commands[currentCommandIndex].command
            if (updatedInput === expectedCommand) {
                setCurrentCommandIndex(prev => prev + 1)
                // The part below handles switching to the next command
                if (currentCommandIndex + 1 < commands.length && isTestRunning) {
                    setCurrentCommand(commands[currentCommandIndex + 1].command)
                    setCurrentDescription(commands[currentCommandIndex + 1].description)
                    setCommandHistory(prev => [...prev, input])
                    if (commandHistory.length > 2) {
                        commandHistory.shift()
                    }
                } else {
                    // This handles the test completion
                    setCurrentCommand('')
                    setCurrentDescription('')
                    handleFinishTest(totalIncorrectChars)
                }
            }
        }
    }

    const cleanupInputLine = () => {
        setCommandHistory([])
        setStartTime(0)
        setElapsedTime(0)
        setCurrentCommandIndex(0)
        setCurrentCommand('')
        setCurrentDescription('')
        setInput('')
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        const terminalElement = terminalRef.current
        if (terminalElement) {
            const rect = terminalElement.getBoundingClientRect()
            setOffset({ x: rect.left - e.clientX, y: rect.top - e.clientY })
        }
    }

    const handleUserInputChange = (newInput: string, mistakes = 0, enteredKey = '') => {
        setInput(newInput)
        setTotalIncorrectChars(prev => prev + mistakes)
        if (enteredKey === 'Enter' && isTestRunning) {
            checkCommandInput(newInput)
            setInput('')
        } else {
            setTotalIncorrectChars(mistakes)
        }
    }

    const handleTerminalClick = () => {
        if (textInputRef.current) {
            textInputRef.current.focus()
        }
    }

    const handleFinishTest = (totalIncorrectChars: number) => {
        const endTime = Date.now()
        const duration = ((endTime - (startTime || 0)) / 1000).toFixed(2) // in seconds
        const accuracy = calculateAccuracy(totalIncorrectChars)
        setTestDuration(Number(duration))
        setTestAccuracy(Number(accuracy))
        setCompletedTestName(selectedCommandSet.name) // Save the completed test name
        onFinishTest(Number(accuracy), Number(duration))
        setModalIsOpen(true)
    }

    const calculateAccuracy = (totalIncorrectChars: number) => {
        const totalCharsTyped = input.length + totalIncorrectChars
        const correctChars = input.split('').filter((char, index) => char === currentCommand[index]).length
        return ((correctChars / totalCharsTyped) * 100).toFixed(2) // percentage
    }

    return (
        <>
            <div
                className="terminal"
                ref={terminalRef}
                style={{
                    position: 'absolute',
                    left: currentPosition.x,
                    top: currentPosition.y,
                }}
            >
                <div className="top-bar" id="drag-handle" onMouseDown={handleMouseDown}>
                    <TerminalTopBar />
                </div>
                <div className="flex flex-col place-content-between" onClick={handleTerminalClick}>
                    <div className="select-none">
                        <div className="mx-2 my-2 grid select-none columns-3 grid-cols-3 items-center">
                            <div className="text-start text-lg font-bold text-sky-400">
                                <span>
                                    Command Progress:&nbsp;
                                    {(isTestRunning && selectedCommandSet.commands.length - currentCommandIndex) || 0}
                                </span>
                            </div>
                            <div className="justify-self-center whitespace-pre text-center text-lg font-bold text-red-500">
                                {isTestRunning ? (
                                    <button className="stop-test-button control-element" onClick={onStopTest}>
                                        Stop Test
                                    </button>
                                ) : (
                                    <button className="start-test-button control-element" onClick={openSelectTestModal}>
                                        Start Test
                                    </button>
                                )}
                            </div>
                            <div className="terminal-timer text-end text-lg font-bold text-sky-400">
                                <span>Timer: {elapsedTime.toFixed(2)}</span>
                            </div>
                        </div>
                        <hr />
                        <div className="terminal-line">
                            <div
                                className={`col-start-2 select-none text-lg font-extrabold text-green-400 opacity-100 ${isTestRunning ? 'text-left' : ''}`}
                            >
                                {isTestRunning ? (
                                    currentDescription
                                ) : (
                                    <div>
                                        Information about each command you are typing will be displayed here as you
                                        progress.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-baseline gap-2 pb-2 pl-4 text-left">
                        {
                            // ? Below handles the command history being displayed
                        }
                        <div className="terminal-history flex select-none flex-col gap-2">
                            {commandHistory.map((cmd, index) => (
                                <div key={index} className="terminal-command flex items-baseline text-left">
                                    <p className="terminal-user text-red-500">root@linux:~$&nbsp;</p>
                                    <div className="flex place-items-baseline">{cmd}</div>
                                </div>
                            ))}
                        </div>
                        {
                            // ? Below handles displaying user input as they type the commands
                        }
                        <div className="terminal-command flex select-none items-baseline text-left">
                            <p className="terminal-user text-red-500">root@linux:~$&nbsp;</p>
                            <div className="terminal-prompt-input flex place-items-baseline">
                                <TextInput
                                    ref={textInputRef}
                                    currentCommand={currentCommand}
                                    isTestRunning={isTestRunning}
                                    userInput={input}
                                    onUserInputChange={handleUserInputChange}
                                    totalIncorrectChars={totalIncorrectChars}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ResultModal
                testName={completedTestName}
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                time={testDuration}
                accuracy={testAccuracy}
            />

            {isDebugOn && (
                <div>
                    <h1>DEBUG</h1>
                    <div>Total incorrect chars: {totalIncorrectChars}</div>
                    <div>Current Test Accuracy: {testAccuracy}</div>
                </div>
            )}
        </>
    )
}
