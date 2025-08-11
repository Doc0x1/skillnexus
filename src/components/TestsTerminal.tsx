import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './Terminal.css'
import { CommandSet } from '../types/commandSet'
import { TextInput } from './TextInput/TextInput'
import ResultModal from './ResultModal/ResultModal'
import TerminalTopBar from './TerminalTopBar'
import { TerminalInstance } from './Terminal'

interface TestsTerminalProps {
    instance: TerminalInstance
    selectedCommandSet?: CommandSet
    isTestRunning: boolean
    onStopTest: () => void
    onStartTest: () => void
    onFinishTest: (accuracy: number, duration: number) => void
    openSelectTestModal: () => void
    onCommandProgress?: (remaining: number) => void
    onInstanceUpdate: (instance: TerminalInstance) => void
    onMinimize: (terminalId: string) => void
    onMaximize: (terminalId: string) => void
    onClose: (terminalId: string) => void
    onFocus: (terminalId: string) => void
    isModalOpen?: boolean
}

export default function TestsTerminal({
    instance,
    selectedCommandSet,
    isTestRunning,
    onStopTest,
    onStartTest,
    onFinishTest,
    onCommandProgress,
    onInstanceUpdate,
    onMinimize,
    onMaximize,
    onClose,
    onFocus,
    isModalOpen = false,
}: TestsTerminalProps) {
    const [input, setInput] = useState<string>('')
    const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(0)
    const [currentCommand, setCurrentCommand] = useState<string>('')
    const [currentDescription, setCurrentDescription] = useState<string>('')
    const [startTime, setStartTime] = useState<number | null>(null)
    const [totalIncorrectChars, setTotalIncorrectChars] = useState<number>(0)
    const [totalCommandsAttempted, setTotalCommandsAttempted] = useState<number>(0)
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
    const [testDuration, setTestDuration] = useState<number>(0)
    const [testAccuracy, setTestAccuracy] = useState<number>(0)
    const [completedTestName, setCompletedTestName] = useState<string>('')
    const [commandHistory, setCommandHistory] = useState<string[]>([])

    const textInputRef = useRef<HTMLInputElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isResizing, setIsResizing] = useState(false)
    const [resizeHandle, setResizeHandle] = useState('')

    const isDebugOn = process.env.REACT_APP_DEBUG ?? false

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isTestRunning) {
            setStartTime(Date.now())
            setInput('')
            setTotalIncorrectChars(0)
            setTotalCommandsAttempted(0)
            setCurrentCommandIndex(0)
            setCommandHistory([])
            if (selectedCommandSet && selectedCommandSet.commands.length > 0) {
                setCurrentCommand(selectedCommandSet.commands[0].command)
                setCurrentDescription(selectedCommandSet.commands[0].description)
            }
            if (textInputRef.current) {
                textInputRef.current.focus()
            }
            timer = setInterval(() => {
                // Timer for potential future use
            }, 10)
        } else {
            cleanupInputLine()
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isTestRunning, selectedCommandSet, startTime])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX + offset.x
                const newY = e.clientY + offset.y

                const terminalElement = terminalRef.current
                if (terminalElement) {
                    const terminalWidth = terminalElement.offsetWidth
                    const terminalHeight = terminalElement.offsetHeight
                    const screenWidth = window.innerWidth
                    const screenHeight = window.innerHeight
                    
                    // Define boundaries: top bar is ~40px, dock is ~60px from bottom
                    const topBoundary = 40
                    const bottomBoundary = screenHeight - 60
                    const leftBoundary = 0
                    const rightBoundary = screenWidth
                    
                    // Constrain position within boundaries
                    const constrainedX = Math.max(leftBoundary, Math.min(newX, rightBoundary - terminalWidth))
                    const constrainedY = Math.max(topBoundary, Math.min(newY, bottomBoundary - terminalHeight))

                    onInstanceUpdate({
                        ...instance,
                        position: { x: constrainedX, y: constrainedY }
                    })
                }
            } else if (isResizing) {
                const terminalElement = terminalRef.current
                if (terminalElement) {
                    const rect = terminalElement.getBoundingClientRect()
                    const screenWidth = window.innerWidth
                    const screenHeight = window.innerHeight
                    
                    // Define boundaries: top bar is ~40px, dock is ~60px from bottom
                    const topBoundary = 40
                    const bottomBoundary = screenHeight - 60
                    const leftBoundary = 0
                    const rightBoundary = screenWidth
                    
                    let newWidth = instance.size.width
                    let newHeight = instance.size.height
                    let newX = instance.position.x
                    let newY = instance.position.y

                    if (resizeHandle.includes('right')) {
                        // Constrain right edge to screen boundary
                        const maxWidth = rightBoundary - instance.position.x
                        newWidth = Math.max(400, Math.min(e.clientX - rect.left, maxWidth))
                    }
                    if (resizeHandle.includes('left')) {
                        const deltaX = rect.left - e.clientX
                        const proposedWidth = instance.size.width + deltaX
                        const proposedX = e.clientX
                        
                        // Ensure we don't go past left boundary
                        if (proposedX >= leftBoundary && proposedWidth >= 400) {
                            newWidth = proposedWidth
                            newX = proposedX
                        }
                    }
                    if (resizeHandle.includes('bottom')) {
                        // Constrain bottom edge to dock boundary
                        const maxHeight = bottomBoundary - instance.position.y
                        newHeight = Math.max(300, Math.min(e.clientY - rect.top, maxHeight))
                    }
                    if (resizeHandle.includes('top')) {
                        const deltaY = rect.top - e.clientY
                        const proposedHeight = instance.size.height + deltaY
                        const proposedY = e.clientY
                        
                        // Ensure we don't go past top boundary
                        if (proposedY >= topBoundary && proposedHeight >= 300) {
                            newHeight = proposedHeight
                            newY = proposedY
                        }
                    }

                    onInstanceUpdate({
                        ...instance,
                        size: { width: newWidth, height: newHeight },
                        position: { x: newX, y: newY }
                    })
                }
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, isResizing, offset, resizeHandle, instance, onInstanceUpdate])

    const checkCommandInput = (updatedInput: string) => {
        const commands = selectedCommandSet?.commands || []
        if (currentCommandIndex < commands.length) {
            const expectedCommand = commands[currentCommandIndex].command
            setTotalCommandsAttempted(prev => prev + 1)
            
            if (updatedInput === expectedCommand) {
                const newIndex = currentCommandIndex + 1
                setCurrentCommandIndex(newIndex)
                
                const remaining = commands.length - newIndex
                onCommandProgress?.(remaining)
                
                if (newIndex < commands.length && isTestRunning) {
                    setCurrentCommand(commands[newIndex].command)
                    setCurrentDescription(commands[newIndex].description)
                    setCommandHistory(prev => [...prev, input])
                    if (commandHistory.length > 2) {
                        commandHistory.shift()
                    }
                } else {
                    setCurrentCommand('')
                    setCurrentDescription('')
                    handleFinishTest()
                }
            } else {
                // Count incorrect characters only when Enter is pressed with wrong command
                const incorrectChars = calculateIncorrectCharsInCommand(updatedInput, expectedCommand)
                setTotalIncorrectChars(prev => prev + incorrectChars)
            }
        }
    }

    const calculateIncorrectCharsInCommand = (userCommand: string, expectedCommand: string) => {
        let incorrectCount = 0
        for (let i = 0; i < userCommand.length; i++) {
            if (userCommand[i] !== expectedCommand[i]) {
                incorrectCount++
            }
        }
        // Also count missing characters if user command is shorter
        if (userCommand.length < expectedCommand.length) {
            incorrectCount += expectedCommand.length - userCommand.length
        }
        return incorrectCount
    }

    const cleanupInputLine = () => {
        setCommandHistory([])
        setStartTime(0)
        setCurrentCommandIndex(0)
        setCurrentCommand('')
        setCurrentDescription('')
        setInput('')
        setTotalIncorrectChars(0)
        setTotalCommandsAttempted(0)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        setIsResizing(false)
        setResizeHandle('')
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        const terminalElement = terminalRef.current
        if (terminalElement) {
            const rect = terminalElement.getBoundingClientRect()
            setOffset({ x: rect.left - e.clientX, y: rect.top - e.clientY })
        }
    }

    const handleResizeStart = (handle: string) => (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsResizing(true)
        setResizeHandle(handle)
    }

    const handleUserInputChange = (newInput: string, _mistakes = 0, enteredKey = '') => {
        setInput(newInput)
        
        if (enteredKey === 'Enter') {
            if (isTestRunning) {
                checkCommandInput(newInput)
                setInput('')
            } else if (selectedCommandSet && !isTestRunning) {
                // Start test when Enter is pressed and test is selected but not running
                onStartTest()
            }
        } else if (enteredKey === 'Escape') {
            if (isTestRunning) {
                // Stop test when ESC is pressed during test
                onStopTest()
            }
        }
        // No longer track mistakes during typing - only on Enter key press
    }

    const handleTerminalClick = () => {
        if (textInputRef.current) {
            textInputRef.current.focus()
        }
    }

    const handleFinishTest = () => {
        const endTime = Date.now()
        const duration = ((endTime - (startTime || 0)) / 1000).toFixed(2)
        const accuracy = calculateAccuracy()
        setTestDuration(Number(duration))
        setTestAccuracy(Number(accuracy))
        setCompletedTestName(selectedCommandSet?.name || 'Test')
        onFinishTest(Number(accuracy), Number(duration))
        setModalIsOpen(true)
    }

    const calculateAccuracy = () => {
        if (!selectedCommandSet || totalCommandsAttempted === 0) return 100
        
        // Calculate total expected characters across all commands in the test
        const totalExpectedChars = selectedCommandSet.commands.reduce((sum, cmd) => sum + cmd.command.length, 0)
        
        // Calculate accuracy based on incorrect characters vs total expected characters
        const correctChars = totalExpectedChars - totalIncorrectChars
        const accuracy = Math.max(0, (correctChars / totalExpectedChars) * 100)
        
        return accuracy.toFixed(2)
    }

    if (instance.isMinimized) {
        return null
    }

    const getInitialState = () => {
        if (instance.isMinimized) {
            return { scale: 1, opacity: 1 }
        }
        if (instance.isMaximized) {
            return { scale: 0.8 }
        }
        return { scale: 0.8, opacity: 0, y: 50 }
    }

    const getAnimateState = () => {
        if (instance.isMinimized) {
            return { 
                scale: 0.3, 
                opacity: 0,
                y: window.innerHeight - 100
            }
        }
        if (instance.isMaximized) {
            return { 
                scale: 1,
                x: 0,
                y: 40
            }
        }
        return { 
            scale: 1, 
            opacity: 1, 
            y: 0
        }
    }

    const getExitState = () => {
        return { 
            scale: 0.8, 
            opacity: 0, 
            y: -50
        }
    }

    const getTransition = () => {
        if (instance.isMinimized) {
            return { duration: 0.3, ease: "easeInOut" as const }
        }
        if (instance.isMaximized) {
            return { duration: 0.4, ease: "easeInOut" as const }
        }
        return { duration: 0.3, ease: "easeOut" as const }
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {!instance.isMinimized && (
                    <motion.div
                        className={`terminal ${isModalOpen ? 'dimmed' : ''}`}
                        ref={terminalRef}
                        initial={getInitialState()}
                        animate={getAnimateState()}
                        exit={getExitState()}
                        transition={getTransition()}
                        style={{
                            position: 'absolute',
                            left: instance.position.x,
                            top: instance.position.y,
                            width: instance.size.width,
                            height: instance.size.height,
                            zIndex: instance.zIndex,
                        }}
                        onMouseDown={() => onFocus(instance.id)}
                    >
                    <div className="top-bar" id="drag-handle" onMouseDown={handleMouseDown}>
                        <TerminalTopBar
                            selectedCommandSet={selectedCommandSet}
                            onMinimize={() => onMinimize(instance.id)}
                            onMaximize={() => onMaximize(instance.id)}
                            onClose={() => onClose(instance.id)}
                        />
                    </div>
                    <div className="terminal-content" onClick={handleTerminalClick}>
                        <div className="terminal-description">
                            <div
                                className={`select-none text-lg font-extrabold text-green-400 opacity-100 p-4 ${isTestRunning ? 'text-left' : 'text-center'}`}
                            >
                                {isTestRunning ? (
                                    currentDescription
                                ) : (
                                    <div>
                                        {selectedCommandSet ? 
                                            "Press Enter to start the test!" :
                                            "Select a test from the desktop icons to begin!"
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-baseline gap-2 pb-2 pl-4 text-left">
                            {/* Test mode command history */}
                            <div className="terminal-history flex select-none flex-col gap-2">
                                {commandHistory.map((cmd, index) => (
                                    <div key={index} className="terminal-command flex items-baseline text-left">
                                        <p className="terminal-user text-red-500">root@linux:~$&nbsp;</p>
                                        <div className="flex place-items-baseline">{cmd}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Current input line */}
                            <div className="terminal-command flex select-none items-baseline text-left">
                                <p className="terminal-user text-red-500">root@linux:~$&nbsp;</p>
                                <div className="terminal-prompt-input flex place-items-baseline">
                                    <TextInput
                                        ref={textInputRef}
                                        currentCommand={currentCommand}
                                        isTestTerminal={true}
                                        isTestRunning={isTestRunning}
                                        userInput={input}
                                        onUserInputChange={handleUserInputChange}
                                        totalIncorrectChars={totalIncorrectChars}
                                        uniqueId={instance.id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
            
                    {/* Resize handles */}
                    <div className="resize-handle resize-handle-n" onMouseDown={handleResizeStart('top')} />
                    <div className="resize-handle resize-handle-s" onMouseDown={handleResizeStart('bottom')} />
                    <div className="resize-handle resize-handle-w" onMouseDown={handleResizeStart('left')} />
                    <div className="resize-handle resize-handle-e" onMouseDown={handleResizeStart('right')} />
                    <div className="resize-handle resize-handle-nw" onMouseDown={handleResizeStart('top-left')} />
                    <div className="resize-handle resize-handle-ne" onMouseDown={handleResizeStart('top-right')} />
                    <div className="resize-handle resize-handle-sw" onMouseDown={handleResizeStart('bottom-left')} />
                    <div className="resize-handle resize-handle-se" onMouseDown={handleResizeStart('bottom-right')} />
                    </motion.div>
                )}
            </AnimatePresence>
            <>
                <ResultModal
                    testName={completedTestName}
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    time={testDuration}
                    accuracy={testAccuracy}
                />
                {isDebugOn && (
                    <div className="debug-info">
                        <h1>DEBUG</h1>
                        <div>{selectedCommandSet?.name || 'No test selected'}</div>
                        <div>Total incorrect chars: {totalIncorrectChars}</div>
                        <div>Current Test Accuracy: {testAccuracy}</div>
                    </div>
                )}
            </>
        </>
    )
}