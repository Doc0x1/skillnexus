import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FiMaximize2 } from 'react-icons/fi'
import { VscChromeClose, VscChromeMinimize } from 'react-icons/vsc'
import { CommandSet } from '../types/commandSet'

interface TerminalTopBarProps {
    selectedCommandSet: CommandSet
}

export default function TerminalTopBar({ selectedCommandSet }: TerminalTopBarProps) {
    return (
        <>
            <ul className="top-btn-left w-14 items-center justify-start">
                <li className="menu-icon">
                    <FontAwesomeIcon icon={faBars} />
                </li>
            </ul>
            {selectedCommandSet.name ? (
                <p className="flex select-none justify-center text-lg font-bold">
                    Terminal - {selectedCommandSet.name}
                </p>
            ) : (
                <p className="flex select-none justify-center text-lg font-bold">Terminal</p>
            )}
            <ul className="top-btn-right flex w-14 items-center justify-end">
                <li className="circle yellow">
                    <VscChromeMinimize />
                </li>
                <li className="circle green">
                    <FiMaximize2 />
                </li>
                <li className="circle red">
                    <VscChromeClose />
                </li>
            </ul>
        </>
    )
}
