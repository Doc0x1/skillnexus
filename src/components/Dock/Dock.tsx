import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './Dock.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTerminal, faMinimize, faMaximize, faTimes, faBars } from '@fortawesome/free-solid-svg-icons'

export interface DockApp {
    id: string
    name: string
    icon: React.ReactNode
    isMinimized: boolean
    isActive: boolean
}

interface DockProps {
    apps: DockApp[]
    onAppClick: (appId: string) => void
    onAppMinimize: (appId: string) => void
    onAppMaximize: (appId: string) => void
    onAppClose: (appId: string) => void
}

const Dock: React.FC<DockProps> = ({
    apps,
    onAppClick,
    onAppMinimize,
    onAppMaximize,
    onAppClose
}) => {
    const [showControls, setShowControls] = React.useState<string | null>(null)
    const [currentTime, setCurrentTime] = React.useState(new Date())

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="xfce-taskbar">
            {/* Left side - Applications menu button */}
            <div className="taskbar-left">
                <div className="menu-button">
                    <FontAwesomeIcon icon={faBars} />
                    <span>Applications</span>
                </div>
            </div>

            {/* Center - Application buttons */}
            <div className="taskbar-center">
                <AnimatePresence>
                    {apps.map((app) => (
                        <motion.div
                            key={app.id}
                            className={`taskbar-app ${app.isActive ? 'active' : ''} ${app.isMinimized ? 'minimized' : ''}`}
                            onClick={() => onAppClick(app.id)}
                            onMouseEnter={() => setShowControls(app.id)}
                            onMouseLeave={() => setShowControls(null)}
                            initial={{ scale: 0, opacity: 0, x: -20 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            exit={{ scale: 0, opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                        <div className="taskbar-app-content">
                            <div className="taskbar-app-icon">
                                {app.icon}
                            </div>
                            <span className="taskbar-app-name">{app.name}</span>
                        </div>
                        
                        {/* Controls appear on hover */}
                        {showControls === app.id && (
                            <div className="taskbar-app-controls">
                                <button
                                    className="taskbar-control-btn minimize"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAppMinimize(app.id)
                                    }}
                                    title="Minimize"
                                >
                                    <FontAwesomeIcon icon={faMinimize} />
                                </button>
                                <button
                                    className="taskbar-control-btn maximize"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAppMaximize(app.id)
                                    }}
                                    title="Maximize"
                                >
                                    <FontAwesomeIcon icon={faMaximize} />
                                </button>
                                <button
                                    className="taskbar-control-btn close"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAppClose(app.id)
                                    }}
                                    title="Close"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Right side - System tray area */}
            <div className="taskbar-right">
                <div className="system-tray">
                    <span className="time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    )
}

export default Dock