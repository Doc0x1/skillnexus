import React from 'react'
import './XFCEMenuBar.css'

interface XFCEMenuBarProps {}

const XFCEMenuBar: React.FC<XFCEMenuBarProps> = () => {
    return (
        <div className="xfce-menubar select-none">
            <div className="menu-bar justify-center py-2">
                Welcome to Skill Nexus!
                <br />
                We will be adding more features as time goes on, but for now, enjoy the Terminal!
            </div>
        </div>
    )
}

export default XFCEMenuBar
