import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import './TextInput.css'

interface TextInputParams {
    currentCommand: string
    userInput: string
    isTestTerminal: boolean
    isTestRunning: boolean
    onUserInputChange: (input: string, mistakeCount?: number, enteredKey?: string) => void
    totalIncorrectChars: number
    uniqueId?: string
}

interface TextInputRef extends Partial<HTMLInputElement> {
    focus: () => void
}

export const TextInput = forwardRef<TextInputRef, TextInputParams>(
    ({ currentCommand, userInput, isTestTerminal, isTestRunning, onUserInputChange, totalIncorrectChars, uniqueId = '' }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null)
        const textDisplayRef = useRef<HTMLDivElement>(null)
        const [mistakes, setMistakes] = useState<boolean[]>([])
        const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; id: number }[]>([])
        const [caretPosition, setCaretPosition] = useState({ left: 0, top: 0 })
        const feedbackIdRef = useRef(0)

        useImperativeHandle(ref, () => ({
            focus: () => {
                if (inputRef.current) {
                    inputRef.current.focus()
                }
            },
            ...inputRef.current,
        }))

        useEffect(() => {
            setMistakes(new Array(currentCommand.length).fill(false))
        }, [currentCommand])

        // Update caret position when user input changes
        useEffect(() => {
            if (isTestTerminal && textDisplayRef.current) {
                const updateCaretPosition = () => {
                    if (isTestRunning) {
                        const spans = textDisplayRef.current?.querySelectorAll('span[data-char-index]')
                        if (spans && spans.length > 0) {
                            let targetSpan: Element
                            if (userInput.length === 0) {
                                // Position at the beginning of the first character
                                targetSpan = spans[0]
                                const rect = targetSpan.getBoundingClientRect()
                                const containerRect = textDisplayRef.current!.getBoundingClientRect()
                                setCaretPosition({
                                    left: rect.left - containerRect.left,
                                    top: rect.top - containerRect.top
                                })
                            } else if (userInput.length < spans.length) {
                                // Position at the beginning of the next character to be typed
                                targetSpan = spans[userInput.length]
                                const rect = targetSpan.getBoundingClientRect()
                                const containerRect = textDisplayRef.current!.getBoundingClientRect()
                                setCaretPosition({
                                    left: rect.left - containerRect.left,
                                    top: rect.top - containerRect.top
                                })
                            } else {
                                // Position at the end of the last character
                                targetSpan = spans[spans.length - 1]
                                const rect = targetSpan.getBoundingClientRect()
                                const containerRect = textDisplayRef.current!.getBoundingClientRect()
                                setCaretPosition({
                                    left: rect.right - containerRect.left,
                                    top: rect.top - containerRect.top
                                })
                            }
                        }
                    } else {
                        // Position caret at the beginning when test is not running
                        setCaretPosition({
                            left: 0,
                            top: 2 // Slight vertical adjustment to align with text baseline
                        })
                    }
                }

                // Use setTimeout to ensure DOM is updated
                setTimeout(updateCaretPosition, 0)
            }
        }, [userInput, isTestRunning, currentCommand, isTestTerminal])

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const { key } = e

            // Regular terminal mode (when currentCommand is empty)
            if (currentCommand === '') {
                switch (key) {
                    case 'Enter':
                        e.preventDefault()
                        onUserInputChange(userInput, undefined, 'Enter')
                        break
                    case 'Escape':
                        e.preventDefault()
                        if (isTestTerminal) {
                            onUserInputChange(userInput, undefined, 'Escape')
                        }
                        break
                    case 'Backspace':
                        e.preventDefault()
                        if (userInput.length > 0) {
                            const newUserInput = userInput.slice(0, -1)
                            onUserInputChange(newUserInput, totalIncorrectChars)
                        }
                        break
                    default:
                        if (key.length === 1) {
                            e.preventDefault()
                            const newUserInput = userInput + key
                            onUserInputChange(newUserInput, totalIncorrectChars)
                        }
                        // Allow other keys (arrows, etc.) to work normally
                        break
                }
            } else {
                switch (key) {
                    case 'Backspace':
                        e.preventDefault()
                        if (userInput.length > 0) {
                            const newUserInput = userInput.slice(0, -1)
                            onUserInputChange(newUserInput, totalIncorrectChars)
                        }
                        break
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        e.preventDefault()
                        break
                    case 'Enter':
                        e.preventDefault()
                        const feedbackType = userInput === currentCommand ? 'correct' : 'incorrect'
                        setFeedback(prev => [...prev, { type: feedbackType, id: feedbackIdRef.current++ }])
                        setTimeout(() => {
                            setFeedback(prev => prev.filter(f => f.id !== feedbackIdRef.current - 1))
                        }, 1000)
                        if (userInput.length === currentCommand.length && userInput === currentCommand) {
                            onUserInputChange(userInput, undefined, 'Enter')
                        }
                        break
                    case 'Escape':
                        e.preventDefault()
                        if (isTestTerminal) {
                            onUserInputChange(userInput, undefined, 'Escape')
                        }
                        break
                    default:
                        if (key.length === 1 && userInput.length < currentCommand.length && isTestRunning) {
                            e.preventDefault()
                            const newUserInput = userInput + key
                            const currentPosition = userInput.length
                            const incorrectChars =
                                key !== currentCommand[currentPosition] && !mistakes[currentPosition]
                                    ? totalIncorrectChars + 1
                                    : totalIncorrectChars
                            const newMistakes = [...mistakes]

                            if (key !== currentCommand[currentPosition]) {
                                newMistakes[currentPosition] = true
                            }
                            setMistakes(newMistakes)
                            onUserInputChange(newUserInput, incorrectChars)
                        }
                        break
                }
            }
        }

        const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
            e.preventDefault()
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }

        const renderInputElements = () => {
            const renderedText: JSX.Element[] = []
            if (!isTestRunning) {
                return []
            }
            for (let i = 0; i < currentCommand.length; i++) {
                const isSpace = currentCommand[i] === ' '
                const charClass = userInput[i]
                    ? userInput[i] === currentCommand[i]
                        ? isSpace
                            ? 'correct-space'
                            : 'correct-char'
                        : isSpace
                          ? 'incorrect-space'
                          : 'incorrect-char'
                    : 'bg-char'

                renderedText.push(
                    <span key={i} className={charClass} data-char-index={i}>
                        {isSpace && userInput[i] ? '\u00A0' : currentCommand[i]}
                    </span>
                )
            }

            return renderedText
        }

        return (
            <div className="text-input-display relative cursor-default font-mono w-full">
                <input
                    id={uniqueId ? `input-area-${uniqueId}` : 'input-area'}
                    ref={inputRef}
                    spellCheck="false"
                    minLength={0}
                    type="text"
                    className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none border-0 outline-0"
                    onKeyDown={handleKeyDown}
                    onMouseDown={handleMouseDown}
                    autoFocus
                    value={userInput}
                    onChange={() => {}}
                />
                <div 
                    ref={textDisplayRef}
                    className="text-white bg-transparent cursor-text word-break-all overflow-wrap-anywhere whitespace-pre-wrap min-h-[1.2em] w-full"
                    onClick={handleMouseDown}
                    style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                >
                    {isTestTerminal ? (
                        isTestRunning ? (
                            <>
                                <div className="word-break-all overflow-wrap-anywhere whitespace-pre-wrap">
                                    {renderInputElements()}
                                </div>
                                <div
                                    id={uniqueId ? `caret-${uniqueId}` : 'caret'}
                                    className="terminal-caret"
                                    style={{
                                        left: `${caretPosition.left}px`,
                                        top: `${caretPosition.top}px`,
                                    }}
                                />
                            </>
                        ) : (
                            <>
                            <div className="word-break-all overflow-wrap-anywhere whitespace-pre-wrap">
                                &nbsp;
                            </div>
                            <div
                                id={uniqueId ? `caret-${uniqueId}` : 'caret'}
                                className="terminal-caret"
                                style={{
                                    left: `${caretPosition.left}px`,
                                    top: `${caretPosition.top}px`,
                                }}
                            />
                            </>
                        )
                    ) : ( 
                        <>
                            <span style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                                {userInput}
                            </span>
                            <span className="terminal-cursor">|</span>
                        </>
                    )}
                </div>
                <div className="relative flex items-end justify-end">
                    {feedback.map(f => (
                        <div key={f.id} className={`feedback ${f.type}`} style={{ left: `1rem` }}>
                            {f.type === 'correct' ? '✓' : '✗'}
                        </div>
                    ))}
                </div>
            </div>
        )
    }
)
