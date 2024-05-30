import React, { useState, useRef, useEffect } from 'react';
import './Terminal.css';
import commandsJson from '../commands.json'
import { faCircleChevronUp, faMinusCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Terminal() {
    const [input, setInput] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);

    const [commands, setCommands] = useState<any[]>([]);
    const [selectedCommandSet, setSelectedCommandSet] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');

    const terminalRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const command = input.trim();
            if (command) {
                setHistory([...history, `root@kali:~# ${command}`, executeCommand(command)]);
                setInput('');
            }
        }
    };
    const executeCommand = (command: string): string => {
        // Here, you can implement the logic to execute different commands
        // For example, you can have a switch statement to handle different commands
        // or use a library like xterm.js to create a fully-functional terminal

        // For simplicity, let's just echo the command
        return `$ ${command}`;
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCommandSet(e.target.value);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setInitialPosition({ x: e.clientX, y: e.clientY });
        setOffset({ x: currentPosition.x - e.clientX, y: currentPosition.y - e.clientY });
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    function startTest() {
        const selectedTestElement = document.getElementById('test-select') as HTMLElement;
        const selectedTest = selectedTestElement
        console.log(selectedTest)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setCurrentPosition({
                    x: e.clientX + offset.x,
                    y: e.clientY + offset.y,
                });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [currentPosition, initialPosition, isDragging, offset]);

    return (
        <>
            <div>
                <select id="test-select" value={selectedCommandSet} onChange={handleSelectChange}>
                    <option value="">Select a Test to start</option>
                    {Object.entries(commandsJson).map(([commands, { value }]) => (
                        <option key={value} value={value}>
                            {commands}
                        </option>
                    ))}
                </select>
                <button onClick={startTest}>Start Test</button>
            </div>
            <div className='terminal' style={{
                position: 'absolute',
                left: currentPosition.x,
                top: currentPosition.y,
            }} id={selectedCommandSet} ref={terminalRef} onMouseDown={handleMouseDown}>
                <div className="top-bar" id="drag-handle">
                    <div className="title-bar">
                        <p className="title">root@linux:~</p>
                        <ul className="top-btn">
                            <FontAwesomeIcon icon={faMinusCircle} />
                            <FontAwesomeIcon icon={faCircleChevronUp} />
                            <FontAwesomeIcon icon={faTimesCircle} />
                        </ul>
                    </div>
                    <ul className="menu-bar">
                        <li>File</li>
                        <li>Edit</li>
                        <li>View</li>
                        <li>Search</li>
                        <li>Terminal</li>
                        <li>Help</li>
                    </ul>
                </div>
                <div className="terminal-line">Test Line</div>
                <div className="terminal-prompt text-left items-baseline">
                    <span className="terminal-user text-red-500">root</span>
                    <span className='terminal-user-host-seperator'>@</span>
                    <span className="terminal-host text-red-500">kali</span>
                    <span className='text-white'>:</span>
                    <span className="terminal-path">~</span>
                    <span className="terminal-prompt-symbol">$</span>{' '}
                    <div className="terminal-prompt-input terminal-prompt-line-two">
                        <input id='input-area' type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
                    </div>
                </div>
            </div>
        </>
    )
}