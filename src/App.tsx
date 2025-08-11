import { useEffect, useState } from 'react'
import './App.css'
import './styles/fonts.css'
import LoadingIndicator from './components/LoadingIndicator/LoadingIndicator'
import Desktop from './components/Desktop/Desktop'
import { useTerminalManager } from './hooks/useTerminalManager'
import { useTestManager } from './hooks/useTestManager'

function App() {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    
    // Use custom hooks
    const terminalManager = useTerminalManager()
    const testManager = useTestManager()

    useEffect(() => {
        const bgImage = new Image()
        bgImage.src = `${process.env.PUBLIC_URL}/background.jpg`
        bgImage.onload = () => {
            setIsLoading(false)
        }
    }, [])

    const goBack = () => {
        window.history.back()
    }

    if (isLoading) {
        return <LoadingIndicator />
    }

    return (
        <div className="App" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)` }}>
            <Desktop
                // Terminal management props
                terminals={terminalManager.terminals}
                activeTerminalId={terminalManager.activeTerminalId}
                onSpawnTerminal={terminalManager.spawnTerminal}
                onCloseTerminal={terminalManager.closeTerminal}
                onMinimizeTerminal={terminalManager.minimizeTerminal}
                onMaximizeTerminal={terminalManager.maximizeTerminal}
                onFocusTerminal={terminalManager.focusTerminal}
                onHandleTerminalFocus={terminalManager.handleTerminalFocus}
                onUpdateTerminalInstance={terminalManager.updateTerminalInstance}
                
                // Test management props
                testModeTerminalId={testManager.testModeTerminalId}
                setTestModeTerminalId={testManager.setTestModeTerminalId}
                selectedCommandSet={testManager.selectedCommandSet}
                selectedCommandSetObject={testManager.entries[testManager.commandSetMapping[testManager.selectedCommandSet]]}
                isTestRunning={testManager.isTestRunning}
                selectTestModalIsOpen={testManager.selectTestModalIsOpen}
                elapsedTime={testManager.elapsedTime}
                commandsRemaining={testManager.commandsRemaining}
                groupedEntries={testManager.groupedEntries}
                selectedTestName={testManager.entries[testManager.commandSetMapping[testManager.selectedCommandSet]]?.name || ''}
                onSelectChange={testManager.handleSelectChange}
                onStartTest={testManager.startTest}
                onStopTest={testManager.stopTest}
                onFinishTest={testManager.handleFinishTest}
                onCommandProgress={testManager.handleCommandProgress}
                onOpenSelectTestModal={testManager.openSelectTestModal}
                onCloseSelectTestModal={testManager.closeSelectTestModal}
            />
            
            <div className="mobile-warning">
                <div>
                    This site is meant to be viewed on a computer browser, not on mobile. <br /> <br /> If you'd like to
                    use this site, we recommend you do so on a computer rather than a mobile device.
                </div>
                <button className="back-button font-bold" onClick={goBack}>
                    Go back
                </button>
            </div>
        </div>
    )
}

export default App
