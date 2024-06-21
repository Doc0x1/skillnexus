import React from 'react'

const LoadingIndicator: React.FC = () => {
    return (
        <div className="flex h-screen items-center justify-center bg-black">
            <div className="animate-pulse font-mono text-2xl text-green-400">Loading...</div>
        </div>
    )
}

export default LoadingIndicator
