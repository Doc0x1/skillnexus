import React from 'react'
import { AnimatePresence } from 'motion/react'
import Terminal, { TerminalInstance } from '../Terminal'
import TestsTerminal from '../TestsTerminal'
import { CommandSet } from '../../types/commandSet'

interface TerminalRendererProps {
    terminals: TerminalInstance[]
    testModeTerminalId: string | null
    selectedCommandSet?: CommandSet
    isTestRunning: boolean
    onStopTest: () => void
    onStartTest: () => void
    onFinishTest: (accuracy: number, duration: number) => void
    onOpenSelectTestModal: () => void
    onCommandProgress: (remaining: number) => void
    onInstanceUpdate: (instance: TerminalInstance) => void
    onMinimize: (terminalId: string) => void
    onMaximize: (terminalId: string) => void
    onClose: (terminalId: string) => void
    onFocus: (terminalId: string) => void
    isModalOpen: boolean
}

const TerminalRenderer: React.FC<TerminalRendererProps> = ({
    terminals,
    testModeTerminalId,
    selectedCommandSet,
    isTestRunning,
    onStopTest,
    onStartTest,
    onFinishTest,
    onOpenSelectTestModal,
    onCommandProgress,
    onInstanceUpdate,
    onMinimize,
    onMaximize,
    onClose,
    onFocus,
    isModalOpen
}) => {
    return (
        <AnimatePresence>
            {terminals.map(terminal => 
                terminal.id === testModeTerminalId ? (
                    <TestsTerminal
                        key={terminal.id}
                        instance={terminal}
                        selectedCommandSet={selectedCommandSet}
                        isTestRunning={isTestRunning}
                        onStopTest={onStopTest}
                        onStartTest={onStartTest}
                        onFinishTest={onFinishTest}
                        openSelectTestModal={onOpenSelectTestModal}
                        onCommandProgress={onCommandProgress}
                        onInstanceUpdate={onInstanceUpdate}
                        onMinimize={onMinimize}
                        onMaximize={onMaximize}
                        onClose={onClose}
                        onFocus={onFocus}
                        isModalOpen={isModalOpen}
                    />
                ) : (
                    <Terminal
                        key={terminal.id}
                        instance={terminal}
                        onInstanceUpdate={onInstanceUpdate}
                        onMinimize={onMinimize}
                        onMaximize={onMaximize}
                        onClose={onClose}
                        onFocus={onFocus}
                        isModalOpen={isModalOpen}
                    />
                )
            )}
        </AnimatePresence>
    )
}

export default TerminalRenderer