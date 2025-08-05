import React from 'react'
import DesktopIcon from '../DesktopIcon/DesktopIcon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faList, faTerminal } from '@fortawesome/free-solid-svg-icons'

interface DesktopIconsProps {
    onSpawnTerminal: (testMode: boolean) => void
    onOpenSelectTestModal: () => void
    onStartTest: () => void
    onStopTest: () => void
    isTestRunning: boolean
    selectedCommandSet: string
    testModeTerminalId: string | null
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({
    onSpawnTerminal,
    onOpenSelectTestModal,
    onStartTest,
    onStopTest,
    isTestRunning,
    selectedCommandSet,
    testModeTerminalId
}) => {
    return (
        <>
            <DesktopIcon
                icon={<FontAwesomeIcon icon={faTerminal} />}
                label="Terminal"
                onClick={() => onSpawnTerminal(false)}
                position={{ x: 50, y: 100 }}
            />
            
            <DesktopIcon
                icon={<FontAwesomeIcon icon={faList} />}
                label="Practice Tests"
                onClick={() => {
                    if (!testModeTerminalId) {
                        onSpawnTerminal(true)
                    }
                    onOpenSelectTestModal()
                }}
                position={{ x: 50, y: 200 }}
            />
            
            <DesktopIcon
                icon={<FontAwesomeIcon icon={isTestRunning ? faStop : faPlay} />}
                label={isTestRunning ? "Stop Test" : "Start Test"}
                onClick={isTestRunning ? onStopTest : onStartTest}
                position={{ x: 50, y: 300 }}
                disabled={!isTestRunning && (!selectedCommandSet || !testModeTerminalId)}
            />
        </>
    )
}

export default DesktopIcons