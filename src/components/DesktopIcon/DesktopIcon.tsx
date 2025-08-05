import React from 'react'
import { motion } from 'motion/react'
import './DesktopIcon.css'

interface DesktopIconProps {
    icon: React.ReactNode
    label: string
    onClick: () => void
    position: { x: number; y: number }
    disabled?: boolean
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick, position, disabled = false }) => {
    return (
        <motion.div
            className={`desktop-icon ${disabled ? 'disabled' : ''}`}
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
            }}
            onClick={disabled ? undefined : onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
            <div className="icon-container">
                {icon}
            </div>
            <div className="icon-label">
                {label}
            </div>
        </motion.div>
    )
}

export default DesktopIcon