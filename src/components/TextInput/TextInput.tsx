import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './TextInput.css'

interface TextInputParams {
    currentCommand: string
    userInput: string
    onUserInputChange: (input: string, incorrectChars: number, enteredKey?: string) => void
}

interface TextInputRef extends Partial<HTMLInputElement> {
    focus: () => void
}

export const TextInput = forwardRef<TextInputRef, TextInputParams>(
    ({ currentCommand, userInput, onUserInputChange }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null)
        const [incorrectChars, setIncorrectChars] = useState<number>(0)

        useImperativeHandle(ref, () => ({
            focus: () => {
                if (inputRef.current) {
                    inputRef.current.focus()
                }
            },
            ...inputRef.current,
        }))

        useEffect(() => {
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }, [])

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const { key } = e
            if (currentCommand === '') {
                switch (key) {
                    case 'Backspace':
                        e.preventDefault()
                        if (userInput.length > 0) {
                            const newUserInput = userInput.slice(0, -1)
                            onUserInputChange(newUserInput, incorrectChars)
                        }
                        break
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        e.preventDefault()
                        break
                    case 'Enter':
                        e.preventDefault()
                        onUserInputChange('', incorrectChars)
                        break
                    default:
                        if (key.length === 1) {
                            e.preventDefault()
                            const newUserInput = userInput + key
                            onUserInputChange(newUserInput, incorrectChars)
                        }
                        break
                }
            } else {
                switch (key) {
                    case 'Backspace':
                        e.preventDefault()
                        if (userInput.length > 0) {
                            const newUserInput = userInput.slice(0, -1)
                            onUserInputChange(newUserInput, incorrectChars)
                        }
                        break
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        e.preventDefault()
                        break
                    case 'Enter':
                        e.preventDefault()
                        if (userInput.length === currentCommand.length) {
                            onUserInputChange(userInput, incorrectChars, 'Enter')
                        }
                        break
                    default:
                        if (key.length === 1 && userInput.length < currentCommand.length) {
                            e.preventDefault()
                            const newUserInput = userInput + key
                            if (key !== currentCommand[userInput.length]) {
                                setIncorrectChars(prev => prev + 1)
                                onUserInputChange(newUserInput, incorrectChars + 1)
                            } else {
                                onUserInputChange(newUserInput, incorrectChars)
                            }
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

        const renderTextWithCursor = () => {
            const renderedText = []
            for (let i = 0; i < currentCommand.length; i++) {
                const charClass = userInput[i]
                    ? userInput[i] === currentCommand[i]
                        ? 'correct-char'
                        : 'incorrect-char'
                    : 'bg-char'

                renderedText.push(
                    <span key={i} className={`whitespace-pre ${charClass}`}>
                        {currentCommand[i]}
                    </span>
                )
            }

            return renderedText
        }

        useEffect(() => {
            if (userInput === '') {
                setIncorrectChars(0)
            }
        }, [userInput])

        return (
            <div className="text-input-container relative">
                {currentCommand === '' ? null : <div className="text-input-display">{renderTextWithCursor()}</div>}
                <input
                    id="input-area"
                    ref={inputRef}
                    type="text"
                    className={`${
                        currentCommand === ''
                            ? 'flex h-auto w-full border-none text-white outline-none'
                            : 'absolute left-0 top-0 flex h-auto w-full border-none text-transparent outline-none'
                    }`}
                    onKeyDown={handleKeyDown}
                    onMouseDown={handleMouseDown}
                    autoFocus
                    value={userInput}
                    onChange={() => {}}
                />
            </div>
        )
    }
)
