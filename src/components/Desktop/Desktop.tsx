import React from 'react'
import { Toaster } from 'sonner'
import XFCEMenuBar from '../XFCEMenuBar/XFCEMenuBar'
import DesktopIcons from '../DesktopIcons/DesktopIcons'
import TerminalRenderer from '../TerminalRenderer/TerminalRenderer'
import Dock from '../Dock/Dock'
import SelectTestModal from '../SelectTestModal/SelectTestModal'
import { TerminalInstance } from '../Terminal'
import { CommandSet } from '../../types/commandSet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTerminal } from '@fortawesome/free-solid-svg-icons'

interface DesktopProps {
    // Terminal management
    terminals: TerminalInstance[]
    activeTerminalId: string | null
    onSpawnTerminal: (testMode: boolean) => string
    onCloseTerminal: (terminalId: string) => void
    onMinimizeTerminal: (terminalId: string) => void
    onMaximizeTerminal: (terminalId: string) => void
    onFocusTerminal: (terminalId: string) => void
    onHandleTerminalFocus: (terminalId: string) => void
    onUpdateTerminalInstance: (instance: TerminalInstance) => void
    
    // Test management
    testModeTerminalId: string | null
    setTestModeTerminalId: (id: string | null) => void
    selectedCommandSet: string
    selectedCommandSetObject?: CommandSet
    isTestRunning: boolean
    selectTestModalIsOpen: boolean
    elapsedTime: number
    commandsRemaining: number
    groupedEntries: { [key: string]: [string, { name: string; value: string; type: string }][] }
    selectedTestName: string
    onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onStartTest: () => void
    onStopTest: () => void
    onFinishTest: (accuracy: number, duration: number) => void
    onCommandProgress: (remaining: number) => void
    onOpenSelectTestModal: () => void
    onCloseSelectTestModal: () => void
}

const Desktop: React.FC<DesktopProps> = ({
    terminals,
    activeTerminalId,
    onSpawnTerminal,
    onCloseTerminal,
    onMinimizeTerminal,
    onMaximizeTerminal,
    onFocusTerminal,
    onHandleTerminalFocus,
    onUpdateTerminalInstance,
    testModeTerminalId,
    setTestModeTerminalId,
    selectedCommandSet,
    selectedCommandSetObject,
    isTestRunning,
    selectTestModalIsOpen,
    elapsedTime,
    commandsRemaining,
    groupedEntries,
    selectedTestName,
    onSelectChange,
    onStartTest,
    onStopTest,
    onFinishTest,
    onCommandProgress,
    onOpenSelectTestModal,
    onCloseSelectTestModal
}) => {
    const handleSpawnTerminal = (testMode: boolean) => {
        const id = onSpawnTerminal(testMode)
        if (testMode) {
            setTestModeTerminalId(id)
        }
        return id
    }

    const handleCloseTerminal = (terminalId: string) => {
        if (testModeTerminalId === terminalId) {
            setTestModeTerminalId(null)
            onStopTest()
        }
        onCloseTerminal(terminalId)
    }

    return (
        <div className="desktop-only">
            <Toaster position="top-center" richColors closeButton />
            
            <div className="w-full text-center">
                <XFCEMenuBar 
                    commandsRemaining={commandsRemaining}
                    elapsedTime={elapsedTime}
                    isTestRunning={isTestRunning}
                    selectedTestName={selectedTestName}
                />
            </div>
            
            <DesktopIcons
                onSpawnTerminal={handleSpawnTerminal}
                onOpenSelectTestModal={onOpenSelectTestModal}
                onStartTest={onStartTest}
                onStopTest={onStopTest}
                isTestRunning={isTestRunning}
                selectedCommandSet={selectedCommandSet}
                testModeTerminalId={testModeTerminalId}
            />
            
            <TerminalRenderer
                terminals={terminals}
                testModeTerminalId={testModeTerminalId}
                selectedCommandSet={selectedCommandSetObject}
                isTestRunning={isTestRunning}
                onStopTest={onStopTest}
                onStartTest={onStartTest}
                onFinishTest={onFinishTest}
                onOpenSelectTestModal={onOpenSelectTestModal}
                onCommandProgress={onCommandProgress}
                onInstanceUpdate={onUpdateTerminalInstance}
                onMinimize={onMinimizeTerminal}
                onMaximize={onMaximizeTerminal}
                onClose={handleCloseTerminal}
                onFocus={onHandleTerminalFocus}
                isModalOpen={selectTestModalIsOpen}
            />
            
            <Dock
                apps={terminals.map(terminal => ({
                    id: terminal.id,
                    name: terminal.id === testModeTerminalId ? 'Practice Terminal' : 'Terminal',
                    icon: <FontAwesomeIcon icon={faTerminal} />,
                    isMinimized: terminal.isMinimized,
                    isActive: terminal.id === activeTerminalId
                }))}
                onAppClick={onFocusTerminal}
                onAppMinimize={onMinimizeTerminal}
                onAppMaximize={onMaximizeTerminal}
                onAppClose={handleCloseTerminal}
            />
            
            <SelectTestModal
                isOpen={selectTestModalIsOpen}
                groupedEntries={groupedEntries}
                isTestRunning={isTestRunning}
                selectedCommandSet={selectedCommandSet}
                onRequestClose={onCloseSelectTestModal}
                handleSelectChange={onSelectChange}
            />
            
            <div className="bottom-left">
                <a
                    href="https://discord.gg/6tSbqvn7K6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="corner-button"
                >
                    Join us on Discord
                </a>
            </div>
            
            <div className="bottom-right">
                <a
                    href="https://www.patreon.com/hacknexus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="corner-button"
                >
                    Support us on Patreon
                </a>
            </div>
        </div>
    )
}

export default Desktop