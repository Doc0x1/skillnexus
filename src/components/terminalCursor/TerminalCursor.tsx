import React, { useState, useEffect } from 'react';
import './TerminalCursor.css'; // Create this CSS file for styling

const TerminalCursor: React.FC = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setVisible((prev) => !prev);
        }, 500); // Blinking interval in milliseconds

        return () => clearInterval(intervalId);
    }, []);

    return <span className={`cursor ${visible ? 'visible' : 'hidden'}`}>|</span>;
};

export default TerminalCursor;
