import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './Terminal.css'
import { TextInput } from './TextInput/TextInput'
import TerminalTopBar from './TerminalTopBar'
import { CommandEmulator } from '../utils/commandEmulator'

export interface TerminalInstance {
    id: string
    isMinimized: boolean
    isMaximized: boolean
    position: { x: number; y: number }
    size: { width: number; height: number }
    originalPosition?: { x: number; y: number }
    originalSize?: { width: number; height: number }
    zIndex: number
}

interface TerminalProps {
    instance: TerminalInstance
    onInstanceUpdate: (instance: TerminalInstance) => void
    onMinimize: (terminalId: string) => void
    onMaximize: (terminalId: string) => void
    onClose: (terminalId: string) => void
    onFocus: (terminalId: string) => void
    isModalOpen?: boolean
}

export default function Terminal({
    instance,
    onInstanceUpdate,
    onMinimize,
    onMaximize,
    onClose,
    onFocus,
    isModalOpen = false,
}: TerminalProps) {
    const [input, setInput] = useState<string>('')
    const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output' | 'error'; content: string; prompt?: string }>>([])
    const [commandEmulator] = useState(() => new CommandEmulator())

    const textInputRef = useRef<HTMLInputElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)
    const terminalContentRef = useRef<HTMLDivElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isResizing, setIsResizing] = useState(false)
    const [resizeHandle, setResizeHandle] = useState('')

    // Focus input when terminal is clicked
    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.focus()
        }
    }, [])

    // Scroll to bottom when terminalHistory updates
    useEffect(() => {
        if (terminalContentRef.current) {
            terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight
        }
    }, [terminalHistory])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX + offset.x
                const newY = e.clientY + offset.y

                // Constrain the terminal within usable bounds (between top bar and dock)
                const terminalElement = terminalRef.current
                if (terminalElement) {
                    const terminalWidth = terminalElement.offsetWidth
                    const terminalHeight = terminalElement.offsetHeight
                    const screenWidth = window.innerWidth
                    const screenHeight = window.innerHeight
                    
                    // Define boundaries: top bar is ~40px, dock is ~60px from bottom
                    const topBoundary = 40
                    const bottomBoundary = screenHeight - 40
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
                    const bottomBoundary = screenHeight - 40
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
        
        // Scroll to bottom if not already there when typing
        if (terminalContentRef.current && enteredKey !== 'Enter') {
            const { scrollTop, scrollHeight, clientHeight } = terminalContentRef.current
            if (scrollTop + clientHeight < scrollHeight - 5) { // Small threshold to avoid jitter
                terminalContentRef.current.scrollTop = scrollHeight
            }
        }
        
        if (enteredKey === 'Enter') {
            executeCommand(newInput)
            setInput('')
        }
    }

    const executeCommand = (command: string) => {
        const currentPath = commandEmulator.getCurrentPath()
        const prompt = `root@hacknexus:${currentPath}$`
        
        // Add the input to history
        setTerminalHistory(prev => [...prev, {
            type: 'input',
            content: command,
            prompt: prompt
        }])

        // Check if the command is clear
        if (command.trim() === 'clear') {
            setTerminalHistory([])
            return
        }

        // Execute the command
        const result = commandEmulator.executeCommand(command)
        
        // Add output to history
        if (result.output) {
            setTerminalHistory(prev => [...prev, {
                type: 'output',
                content: result.output
            }])
        }
        
        // Add error to history if present
        if (result.error) {
            setTerminalHistory(prev => [...prev, {
                type: 'error',
                content: result.error || 'Unknown error'
            }])
        }
    }

    const handleTerminalClick = () => {
        if (textInputRef.current) {
            textInputRef.current.focus()
        }
    }

    if (instance.isMinimized) {
        return null
    }

    const currentPath = commandEmulator.getCurrentPath()
    const prompt = `root@hacknexus:${currentPath}$`

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
                y: 0
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
                            selectedCommandSet={undefined}
                            onMinimize={() => onMinimize(instance.id)}
                            onMaximize={() => onMaximize(instance.id)}
                            onClose={() => onClose(instance.id)}
                        />
                    </div>
                    <div 
                        className="terminal-content" 
                        ref={terminalContentRef}
                        onClick={handleTerminalClick}
                        style={{ overflowY: 'auto' }}
                    >
                        <div className="flex flex-col items-stretch gap-2 pb-2 pl-4 pr-4 text-left w-full">
                            {/* Regular terminal history */}
                            <div className="terminal-history flex select-none flex-col gap-2 w-full">
                                {terminalHistory.map((entry, index) => (
                                    <div key={index} className="w-full">
                                        {entry.type === 'input' && (
                                            <div className="terminal-command flex items-baseline text-left w-full">
                                                <p className="terminal-user text-red-500 flex-shrink-0">{entry.prompt}&nbsp;</p>
                                                <div className="flex-1 min-w-0 break-words overflow-wrap-anywhere">{entry.content}</div>
                                            </div>
                                        )}
                                        {entry.type === 'output' && (
                                            <div className="terminal-output text-white whitespace-pre-wrap break-words overflow-wrap-anywhere w-full">
                                                {entry.content}
                                            </div>
                                        )}
                                        {entry.type === 'error' && (
                                            <div className="terminal-error text-red-400 break-words overflow-wrap-anywhere w-full">
                                                {entry.content}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Current input line */}
                            <div className="terminal-command flex select-none items-start text-left w-full">
                                <p className="terminal-user text-red-500 flex-shrink-0">{prompt}&nbsp;</p>
                                <div className="flex-1 min-w-0">
                                    <TextInput
                                        ref={textInputRef}
                                        currentCommand=""
                                        isTestTerminal={false}
                                        isTestRunning={false}
                                        userInput={input}
                                        onUserInputChange={handleUserInputChange}
                                        totalIncorrectChars={0}
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
        </>
    )
}