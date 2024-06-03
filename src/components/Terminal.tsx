import React, { useState, useRef, useEffect } from 'react'
import './Terminal.css'
import { faCircleChevronUp, faMinusCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TerminalCursor from './terminalCursor/TerminalCursor'
import { CommandSet } from '../types/commandSet'

interface TerminalProps {
    selectedCommandSet: CommandSet
}

export default function Terminal({ selectedCommandSet }: TerminalProps) {
    const [input, setInput] = useState<string>('')
    const inputRef = useRef<HTMLInputElement>(null)
    const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(0)
    const [currentCommand, setCurrentCommand] = useState<string>('')
    const [currentDescription, setCurrentDescription] = useState<string>('')

    const terminalRef = useRef<HTMLDivElement>(null)

    const [isDragging, setIsDragging] = useState(false)
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 })
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    const checkCommandInput = (updatedInput: string) => {
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
                }
                setInput('')
            } else {
                setCurrentCommand(expectedCommand)
                setCurrentDescription(commands[currentCommandIndex].description)
            }
        }
    }

    const executeCommand = (command: string): string => {
        return `$ ${command}`
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { key } = e

        // Check the length of e.key, if it's larger than 1, it's a control key
        if (key.length > 1) {
            switch (key) {
                case 'Backspace':
                    e.preventDefault()
                    setInput(prev => prev.slice(0, -1))
                    break
                case 'Enter':
                    const command = input.trim()
                    if (command) {
                        executeCommand(command)
                        setInput('')
                        e.preventDefault()
                    }
                    break
                default:
                    e.preventDefault()
                    break
            }
        } else {
            const updatedInput = input + key
            setInput(updatedInput)
            checkCommandInput(updatedInput)
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        if (!initialPosition) setInitialPosition({ x: e.clientX, y: e.clientY })
        setOffset({ x: currentPosition.x - e.clientX, y: currentPosition.y - e.clientY })
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setCurrentPosition({
                    x: e.clientX + offset.x,
                    y: e.clientY + offset.y
                })
            }
        }

        if (inputRef.current) {
            inputRef.current.focus()
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, offset.x, offset.y])

    useEffect(() => {
        setCurrentCommandIndex(0)

        if (selectedCommandSet?.commands?.length > 0) {
            setCurrentCommand(selectedCommandSet.commands[0].command)
            setCurrentDescription(selectedCommandSet.commands[0].description)
        } else {
            setCurrentCommand('')
            setCurrentDescription('')
        }
        setInput('')
    }, [selectedCommandSet])

    return (
        <>
            <div
                className="terminal"
                style={{
                    position: 'absolute',
                    left: currentPosition.x,
                    top: currentPosition.y
                }}
                ref={terminalRef}
                onClick={handleClick}
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
                <div className="terminal-line">
                    {currentDescription !== '' ? currentDescription : 'Select a Test to begin'}
                </div>
                <div className="items-baseline self-end text-left">
                    <div className="">
                        {currentCommand && (
                            <div className="command-info">
                                <p className="command">{currentCommand}</p>
                            </div>
                        )}
                    </div>
                    <div className="terminal-prompt items-baseline text-left">
                        <span className="terminal-user text-red-500">root@linux</span>
                        <span className="text-white">:</span>
                        <span className="terminal-path">~</span>
                        <span className="text-white">$</span>{' '}
                        <div className="terminal-prompt-input relative">
                            {input}
                            <TerminalCursor />
                            <input
                                id="input-area"
                                style={{
                                    caretColor: 'transparent'
                                }}
                                ref={inputRef}
                                type="text"
                                className="absolute left-0 top-0 h-full w-full border-none opacity-0 outline-none"
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
