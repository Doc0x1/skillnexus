export interface FilePermissions {
    owner: {
        read: boolean
        write: boolean
        execute: boolean
    }
    group: {
        read: boolean
        write: boolean
        execute: boolean
    }
    other: {
        read: boolean
        write: boolean
        execute: boolean
    }
}

export interface FileMetadata {
    permissions: FilePermissions
    owner: string
    group: string
    size: number
    modified: Date
    created: Date
    linkCount: number
}

export class PermissionManager {
    static parsePermissionString(permStr: string): FilePermissions {
        // Parse permission string like "rwxr-xr-x" or "rw-r--r--"
        if (permStr.length !== 9) {
            throw new Error('Invalid permission string length')
        }
        
        return {
            owner: {
                read: permStr[0] === 'r',
                write: permStr[1] === 'w',
                execute: permStr[2] === 'x'
            },
            group: {
                read: permStr[3] === 'r',
                write: permStr[4] === 'w',
                execute: permStr[5] === 'x'
            },
            other: {
                read: permStr[6] === 'r',
                write: permStr[7] === 'w',
                execute: permStr[8] === 'x'
            }
        }
    }

    static formatPermissionString(permissions: FilePermissions, isDirectory: boolean = false): string {
        const prefix = isDirectory ? 'd' : '-'
        const owner = this.formatPermissionTriple(permissions.owner)
        const group = this.formatPermissionTriple(permissions.group)
        const other = this.formatPermissionTriple(permissions.other)
        
        return prefix + owner + group + other
    }

    private static formatPermissionTriple(perms: { read: boolean; write: boolean; execute: boolean }): string {
        return (perms.read ? 'r' : '-') +
               (perms.write ? 'w' : '-') +
               (perms.execute ? 'x' : '-')
    }

    static getDefaultDirectoryPermissions(): FilePermissions {
        return {
            owner: { read: true, write: true, execute: true },
            group: { read: true, write: false, execute: true },
            other: { read: true, write: false, execute: true }
        }
    }

    static getDefaultFilePermissions(): FilePermissions {
        return {
            owner: { read: true, write: true, execute: false },
            group: { read: true, write: false, execute: false },
            other: { read: true, write: false, execute: false }
        }
    }

    static getExecutableFilePermissions(): FilePermissions {
        return {
            owner: { read: true, write: true, execute: true },
            group: { read: true, write: false, execute: true },
            other: { read: true, write: false, execute: true }
        }
    }

    static getSystemFilePermissions(): FilePermissions {
        return {
            owner: { read: true, write: true, execute: false },
            group: { read: true, write: false, execute: false },
            other: { read: false, write: false, execute: false }
        }
    }

    static formatFileSize(size: number): string {
        if (size < 1024) return size.toString()
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}K`
        if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)}M`
        return `${(size / 1024 / 1024 / 1024).toFixed(1)}G`
    }

    static formatDate(date: Date): string {
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        if (diffDays < 180) {
            // Recent files: show month, day, time
            return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, ' ')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        } else {
            // Older files: show month, day, year
            return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, ' ')} ${date.getFullYear()}`
        }
    }
}