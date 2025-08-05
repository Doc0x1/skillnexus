import { useState, useCallback } from 'react'
import { TerminalInstance } from '../components/Terminal'

export const useTerminalManager = () => {
    const [terminals, setTerminals] = useState<TerminalInstance[]>([])
    const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null)
    const [highestZIndex, setHighestZIndex] = useState<number>(100)

    const spawnTerminal = useCallback((testMode: boolean = false): string => {
        const id = `terminal-${Date.now()}`
        const newZIndex = highestZIndex + 1
        
        // Ensure spawn position respects boundaries
        const topBoundary = 40
        const bottomBoundary = window.innerHeight - 40
        const terminalHeight = 600
        const maxY = bottomBoundary - terminalHeight
        const spawnY = Math.max(topBoundary, Math.min(100 + terminals.length * 30, maxY))
        
        const newTerminal: TerminalInstance = {
            id,
            isMinimized: false,
            isMaximized: false,
            position: { x: window.innerWidth / 2 - 400, y: spawnY },
            size: { width: 800, height: 600 },
            zIndex: newZIndex
        }
        
        setTerminals(prev => [...prev, newTerminal])
        setActiveTerminalId(id)
        setHighestZIndex(newZIndex)
        
        return id
    }, [terminals.length, highestZIndex])

    const closeTerminal = useCallback((terminalId: string) => {
        setTerminals(prev => prev.filter(t => t.id !== terminalId))
        if (activeTerminalId === terminalId) {
            setActiveTerminalId(null)
        }
    }, [activeTerminalId])

    const minimizeTerminal = useCallback((terminalId: string) => {
        setTerminals(prev => prev.map(t => 
            t.id === terminalId ? { ...t, isMinimized: true } : t
        ))
    }, [])

    const maximizeTerminal = useCallback((terminalId: string) => {
        setTerminals(prev => prev.map(t => {
            if (t.id !== terminalId) return t
            
            if (t.isMaximized) {
                // Restore to original position and size
                return {
                    ...t,
                    isMinimized: false,
                    isMaximized: false,
                    position: t.originalPosition || { x: 100, y: 100 },
                    size: t.originalSize || { width: 800, height: 600 }
                }
            } else {
                // Maximize - store current position and size as original
                // Account for menu bar (40px) and dock (40px) to prevent scrollbars
                // Also account for terminal border (1px) to prevent overflow
                const availableWidth = window.innerWidth - 1 // Subtract 1px for border
                const availableHeight = window.innerHeight - 80 // 40px menu + 40px dock
                
                return {
                    ...t,
                    isMinimized: false,
                    isMaximized: true,
                    originalPosition: t.position,
                    originalSize: t.size,
                    position: { x: 0, y: 40 },
                    size: { width: availableWidth, height: availableHeight }
                }
            }
        }))
    }, [])

    const focusTerminal = useCallback((terminalId: string) => {
        const newZIndex = highestZIndex + 1
        setTerminals(prev => prev.map(t => 
            t.id === terminalId ? { ...t, isMinimized: false, zIndex: newZIndex } : t
        ))
        setActiveTerminalId(terminalId)
        setHighestZIndex(newZIndex)
    }, [highestZIndex])

    const handleTerminalFocus = useCallback((terminalId: string) => {
        const newZIndex = highestZIndex + 1
        setTerminals(prev => prev.map(t => 
            t.id === terminalId ? { ...t, zIndex: newZIndex } : t
        ))
        setActiveTerminalId(terminalId)
        setHighestZIndex(newZIndex)
    }, [highestZIndex])

    const updateTerminalInstance = useCallback((instance: TerminalInstance) => {
        setTerminals(prev => prev.map(t => 
            t.id === instance.id ? instance : t
        ))
    }, [])

    return {
        terminals,
        activeTerminalId,
        spawnTerminal,
        closeTerminal,
        minimizeTerminal,
        maximizeTerminal,
        focusTerminal,
        handleTerminalFocus,
        updateTerminalInstance
    }
}