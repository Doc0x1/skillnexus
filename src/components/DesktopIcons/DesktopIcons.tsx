import React from 'react'
import DesktopIcon from '../DesktopIcon/DesktopIcon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faTerminal } from '@fortawesome/free-solid-svg-icons'

interface DesktopIconsProps {
    onSpawnTerminal: (testMode: boolean) => void
    onOpenSelectTestModal: () => void
    testModeTerminalId: string | null
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({
    onSpawnTerminal,
    onOpenSelectTestModal,
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
        </>
    )
}

export default DesktopIcons