import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import './TextInput.css'

interface TextInputParams {
    currentCommand: string
    userInput: string
    isTestRunning: boolean
    onUserInputChange: (input: string, mistakeCount?: number, enteredKey?: string) => void
    totalIncorrectChars: number
}

interface TextInputRef extends Partial<HTMLInputElement> {
    focus: () => void
}

export const TextInput = forwardRef<TextInputRef, TextInputParams>(
    ({ currentCommand, userInput, isTestRunning, onUserInputChange, totalIncorrectChars }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null)
        const [mistakes, setMistakes] = useState<boolean[]>([])

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

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const { key } = e

            if (currentCommand === '') {
                switch (key) {
                    default:
                        e.preventDefault()
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
                        if (userInput.length === currentCommand.length && userInput === currentCommand) {
                            onUserInputChange(userInput, undefined, 'Enter')
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
                let charClassCssVar = 'char'
                if (currentCommand[i] === ' ') charClassCssVar = 'space'
                else charClassCssVar = 'char'
                const charClass = userInput[i]
                    ? userInput[i] === currentCommand[i]
                        ? `correct-${charClassCssVar}`
                        : `incorrect-${charClassCssVar}`
                    : 'bg-char'

                renderedText.push(
                    <span key={i} className={`whitespace-pre ${charClass}`}>
                        {currentCommand[i]}
                    </span>
                )
            }

            return renderedText
        }

        return (
            <div className="text-input-display relative whitespace-pre font-mono">
                <input
                    id="input-area"
                    ref={inputRef}
                    spellCheck="false"
                    minLength={0}
                    type="text"
                    className={`flex border-none text-transparent
                        outline-none ${isTestRunning ? 'absolute w-full' : 'w-4'}`}
                    onKeyDown={handleKeyDown}
                    onMouseDown={handleMouseDown}
                    autoFocus
                    value={userInput}
                    onChange={() => {}}
                />
                {isTestRunning && renderInputElements()}
            </div>
        )
    }
)
