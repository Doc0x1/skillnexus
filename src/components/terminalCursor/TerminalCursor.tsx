import React from 'react'
import './TerminalCursor.css'

interface TerminalCursorProps {
    className?: string
}

const TerminalCursor: React.FC<TerminalCursorProps> = props => {
    return <span className={`terminal-cursor ${props.className || ''}`}>|</span>
}

export default TerminalCursor
