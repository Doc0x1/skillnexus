import React from 'react'
import './XFCEMenuBar.css'
import Logo from '../logo.png'

interface XFCEMenuBarProps {
    commandsRemaining?: number
    elapsedTime?: number
    isTestRunning?: boolean
    selectedTestName?: string
}

const XFCEMenuBar: React.FC<XFCEMenuBarProps> = ({
    commandsRemaining = 0,
    elapsedTime = 0,
    isTestRunning = false,
    selectedTestName = ''
}) => {
    return (
        <div className="w-full bg-gray-900 px-4 grid grid-cols-3 items-center font-mono border-b border-gray-700 h-12 select-none">
            <div className="flex items-center gap-4">
                <a href="https://hacknexus.io">
                    <img src={Logo} alt="Skill Nexus Logo" width={32} height={32} />
                </a>
                <span className="font-sourcecode font-bold text-green-400">Skill Nexus</span>
            </div>
            
            <div className="flex justify-center">
                <span className="text-cyan-400 text-sm font-medium">
                    {selectedTestName || ''}
                </span>
            </div>
            
            <div className="flex justify-end items-center gap-4 min-h-[24px]">
                {isTestRunning && (
                    <>
                        <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/30">
                            Commands: {commandsRemaining}
                        </span>
                        <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/30">
                            Time: {elapsedTime.toFixed(2)}s
                        </span>
                    </>
                )}
            </div>
        </div>
    )
}

export default XFCEMenuBar
