import React, { useState, useRef, useEffect } from 'react'
import './Terminal.css'
import { faCircleChevronUp, faMinusCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CommandSet } from '../types/commandSet'
import { TextInput } from './TextInput/TextInput'

interface TerminalProps {
    selectedCommandSet: CommandSet
    isTestRunning: boolean
    onStartTest: () => void
    onFinishTest: (accuracy: number, duration: number) => void
}

export default function Terminal({ selectedCommandSet, isTestRunning, onStartTest, onFinishTest }: TerminalProps) {
    const [input, setInput] = useState<string>('')
    const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(0)
    const [currentCommand, setCurrentCommand] = useState<string>('')
    const [currentDescription, setCurrentDescription] = useState<string>('')
    const [startTime, setStartTime] = useState<number | null>(null)
    const [totalIncorrectChars, setTotalIncorrectChars] = useState<number>(0)

    const textInputRef = useRef<HTMLInputElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 })
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (isTestRunning) {
            setStartTime(Date.now())
            setInput('')
            setTotalIncorrectChars(0)
            setCurrentCommandIndex(0)
            if (selectedCommandSet?.commands?.length > 0) {
                setCurrentCommand(selectedCommandSet.commands[0].command)
                setCurrentDescription(selectedCommandSet.commands[0].description)
            }
        }
    }, [isTestRunning, selectedCommandSet])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setCurrentPosition({
                    x: e.clientX + offset.x,
                    y: e.clientY + offset.y,
                })
            }
        }
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, offset.x, offset.y])

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

    const checkCommandInput = (updatedInput: string, incorrectChars: number) => {
        const commands = selectedCommandSet?.commands || []
        if (currentCommandIndex < commands.length) {
            const expectedCommand = commands[currentCommandIndex].command
            if (updatedInput === expectedCommand) {
                setCurrentCommandIndex(prev => prev + 1)
                if (currentCommandIndex + 1 < commands.length) {
                    setCurrentCommand(commands[currentCommandIndex + 1].command)
                    setCurrentDescription(commands[currentCommandIndex + 1].description)
                } else {
                    setCurrentCommand('')
                    setCurrentDescription('Select a Test to begin.')
                    handleFinishTest()
                }
                setInput('')
                setTotalIncorrectChars(prev => prev + incorrectChars)
                return true
            } else {
                setCurrentCommand(expectedCommand)
                setCurrentDescription(commands[currentCommandIndex].description)
                setTotalIncorrectChars(prev => prev + incorrectChars)
                return false
            }
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        setOffset({ x: currentPosition.x - e.clientX, y: currentPosition.y - e.clientY })
    }

    const handleUserInputChange = (newInput: string, incorrectChars: number, enteredKey = '') => {
        setInput(newInput)
        if (enteredKey === 'Enter') {
            checkCommandInput(newInput, incorrectChars)
        } else {
            setTotalIncorrectChars(incorrectChars)
        }
    }

    const handleTerminalClick = () => {
        if (textInputRef.current) {
            textInputRef.current.focus()
        }
    }

    const handleFinishTest = () => {
        const endTime = Date.now()
        const duration = ((endTime - (startTime || 0)) / 1000).toFixed(2) // in seconds
        const accuracy = calculateAccuracy()
        onFinishTest(Number(accuracy), Number(duration))
    }

    const calculateAccuracy = () => {
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
                    <div className="title-bar">
                        <p className="title">root@linux:~</p>
                        <ul className="top-btn">
                            <FontAwesomeIcon icon={faMinusCircle} />
                            <FontAwesomeIcon icon={faCircleChevronUp} />
                            <FontAwesomeIcon icon={faTimesCircle} />
                        </ul>
                    </div>
                    <ul className="menu-bar">
                        <li>File</li>
                        <li>Edit</li>
                        <li>View</li>
                        <li>Search</li>
                        <li>Terminal</li>
                        <li>Help</li>
                    </ul>
                </div>
                <div className="flex flex-col place-content-between" onClick={handleTerminalClick}>
                    <div className="terminal-line">
                        <div className="col-start-2">
                            {currentDescription !== '' ? currentDescription : 'Select a Test to begin'}
                        </div>
                    </div>
                    <div className="items-baseline text-left">
                        <div className="terminal-prompt flex items-baseline text-left">
                            <span className="terminal-user text-red-500">root@linux:~$&nbsp;</span>
                            <div className="terminal-prompt-input flex place-items-baseline">
                                <TextInput
                                    ref={textInputRef}
                                    currentCommand={currentCommand}
                                    userInput={input}
                                    onUserInputChange={handleUserInputChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                DEBUG
                <div>{input}</div>
                <div>{currentCommand}</div>
                <div>{currentCommandIndex}</div>
                <div>Total Incorrect Chars: {totalIncorrectChars}</div>
            </div>
        </>
    )
}
