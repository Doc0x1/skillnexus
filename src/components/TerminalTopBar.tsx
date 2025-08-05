import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FiMaximize2 } from 'react-icons/fi'
import { VscChromeClose, VscChromeMinimize } from 'react-icons/vsc'
import { CommandSet } from '../types/commandSet'

interface TerminalTopBarProps {
    selectedCommandSet?: CommandSet
    onMinimize?: () => void
    onMaximize?: () => void
    onClose?: () => void
}

export default function TerminalTopBar({ 
    selectedCommandSet, 
    onMinimize, 
    onMaximize, 
    onClose 
}: TerminalTopBarProps) {
    return (
        <>
            <ul className="top-btn-left w-14 items-center justify-start">
                <li className="menu-icon">
                    <FontAwesomeIcon icon={faBars} />
                </li>
            </ul>
            {selectedCommandSet?.name ? (
                <p className="flex select-none items-center justify-center font-bold font-sourcecode text-sm">
                    Terminal - {selectedCommandSet.name}
                </p>
            ) : (
                <p className="flex select-none items-center justify-center font-bold font-sourcecode text-sm">Terminal</p>
            )}
            <ul className="top-btn-right flex w-14 items-center justify-end">
                <li 
                    className="circle yellow cursor-auto rounded-lg" 
                    onClick={(e) => {
                        e.stopPropagation()
                        onMinimize?.()
                    }}
                >
                    <VscChromeMinimize size={14} />
                </li>
                <li 
                    className="circle green cursor-auto rounded-lg" 
                    onClick={(e) => {
                        e.stopPropagation()
                        onMaximize?.()
                    }}
                >
                    <FiMaximize2 size={14} />
                </li>
                <li 
                    className="circle red cursor-auto rounded-lg" 
                    onClick={(e) => {
                        e.stopPropagation()
                        onClose?.()
                    }}
                >
                    <VscChromeClose size={14} />
                </li>
            </ul>
        </>
    )
}
