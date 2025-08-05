import filesystemData from '../filesystem.json'
import { FilePermissions, FileMetadata, PermissionManager } from './permissions'

export interface FileSystemNode {
    type: 'file' | 'directory'
    content?: string
    children?: { [key: string]: FileSystemNode }
    metadata?: FileMetadata
}

export interface CommandResult {
    output: string
    error?: string
    exitCode: number
}

export class CommandEmulator {
    private currentPath: string[] = ['root']
    private fileSystem: { [key: string]: FileSystemNode }

    constructor() {
        this.fileSystem = filesystemData['/'].children as { [key: string]: FileSystemNode }
        this.initializeMetadata(this.fileSystem)
    }

    private initializeMetadata(nodes: { [key: string]: FileSystemNode }, parentPath: string = ''): void {
        for (const [name, node] of Object.entries(nodes)) {
            const fullPath = parentPath + '/' + name
            
            if (!node.metadata) {
                const isExecutable = this.isExecutableFile(name, fullPath)
                const isSystemFile = this.isSystemFile(fullPath)
                
                let permissions: FilePermissions
                if (node.type === 'directory') {
                    permissions = PermissionManager.getDefaultDirectoryPermissions()
                } else if (isExecutable) {
                    permissions = PermissionManager.getExecutableFilePermissions()
                } else if (isSystemFile) {
                    permissions = PermissionManager.getSystemFilePermissions()
                } else {
                    permissions = PermissionManager.getDefaultFilePermissions()
                }

                const now = new Date()
                const modifiedDate = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 30) // Random date within last 30 days
                
                node.metadata = {
                    permissions,
                    owner: this.getFileOwner(fullPath),
                    group: this.getFileGroup(fullPath),
                    size: node.type === 'directory' ? 4096 : (node.content?.length || 0),
                    modified: modifiedDate,
                    created: modifiedDate,
                    linkCount: 1
                }
            }
            
            if (node.children) {
                this.initializeMetadata(node.children, fullPath)
            }
        }
    }

    private isExecutableFile(name: string, path: string): boolean {
        // Files in /bin, /sbin, /usr/bin, /usr/sbin are executable
        return path.includes('/bin/') || path.includes('/sbin/') || 
               name === 'bash' || name === 'sh' || name === 'python' || name === 'python3'
    }

    private isSystemFile(path: string): boolean {
        // Files in /etc, /proc, /sys are system files with restricted permissions
        return path.startsWith('/etc/') || path.startsWith('/proc/') || path.startsWith('/sys/')
    }

    private getFileOwner(path: string): string {
        if (path.startsWith('/root/')) return 'root'
        if (path.startsWith('/home/')) return 'user'
        return 'root'
    }

    private getFileGroup(path: string): string {
        if (path.startsWith('/root/')) return 'root'
        if (path.startsWith('/home/')) return 'user'
        return 'root'
    }

    private parseFlags(args: string[]): Set<string> {
        const flags = new Set<string>()
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1) {
                // Handle both single flags (-l) and combined flags (-la, -al, etc.)
                const flagChars = arg.slice(1) // Remove the '-' prefix
                for (const char of flagChars) {
                    flags.add(char)
                }
            }
        }
        
        return flags
    }

    private getCurrentDirectory(): FileSystemNode | null {
        let current: FileSystemNode = { 
            type: 'directory', 
            children: this.fileSystem,
            metadata: {
                permissions: PermissionManager.getDefaultDirectoryPermissions(),
                owner: 'root',
                group: 'root',
                size: 4096,
                modified: new Date(),
                created: new Date(),
                linkCount: 1
            }
        }
        
        for (const part of this.currentPath) {
            if (current.children && current.children[part]) {
                current = current.children[part]
            } else {
                return null
            }
        }
        return current
    }

    private getNodeAtPath(path: string[]): FileSystemNode | null {
        let current: FileSystemNode = { 
            type: 'directory', 
            children: this.fileSystem,
            metadata: {
                permissions: PermissionManager.getDefaultDirectoryPermissions(),
                owner: 'root',
                group: 'root',
                size: 4096,
                modified: new Date(),
                created: new Date(),
                linkCount: 1
            }
        }
        
        for (const part of path) {
            if (current.children && current.children[part]) {
                current = current.children[part]
            } else {
                return null
            }
        }
        return current
    }

    private resolvePath(path: string): string[] {
        if (path === '~') {
            return ['root']
        }
        
        if (path.startsWith('~/')) {
            return ['root', ...path.substring(2).split('/').filter(p => p !== '')]
        }
        
        if (path.startsWith('/')) {
            // Absolute path
            return path.split('/').filter(p => p !== '')
        } else {
            // Relative path
            const resolved = [...this.currentPath]
            const parts = path.split('/').filter(p => p !== '')
            
            for (const part of parts) {
                if (part === '..') {
                    if (resolved.length > 0) {
                        resolved.pop()
                    }
                } else if (part !== '.') {
                    resolved.push(part)
                }
            }
            return resolved
        }
    }

    getCurrentPath(): string {
        if (this.currentPath.length === 0) {
            return '/'
        }
        
        const fullPath = '/' + this.currentPath.join('/')
        
        // Convert /root to ~ for display
        if (fullPath === '/root') {
            return '~'
        }
        if (fullPath.startsWith('/root/')) {
            return '~' + fullPath.substring('/root'.length)
        }
        return fullPath
    }

    executeCommand(input: string): CommandResult {
        const parts = input.trim().split(/\s+/)
        const command = parts[0]
        const args = parts.slice(1)

        switch (command) {
            case 'ls':
                return this.ls(args)
            case 'cd':
                return this.cd(args)
            case 'pwd':
                return this.pwd()
            case 'cat':
                return this.cat(args)
            case 'mkdir':
                return this.mkdir(args)
            case 'rmdir':
                return this.rmdir(args)
            case 'rm':
                return this.rm(args)
            case 'cp':
                return this.cp(args)
            case 'mv':
                return this.mv(args)
            case 'echo':
                return this.echo(args, input)
            case 'whoami':
                return { output: 'root', exitCode: 0 }
            case 'date':
                return { output: new Date().toString(), exitCode: 0 }
            case 'help':
                return this.help()
            case 'uname':
                return this.uname(args)
            case 'id':
                return { output: 'uid=0(root) gid=0(root) groups=0(root)', exitCode: 0 }
            case 'hostname':
                return { output: 'hacknexus', exitCode: 0 }
            case 'uptime':
                return { output: ' 23:55:01 up 1 day, 2:30, 1 user, load average: 0.15, 0.10, 0.05', exitCode: 0 }
            case 'df':
                return this.df()
            case 'free':
                return this.free()
            case 'ps':
                return this.ps()
            case 'env':
                return this.env()
            case 'history':
                return { output: '1  ls\n2  cd /\n3  pwd\n4  help', exitCode: 0 }
            default:
                return {
                    output: '',
                    error: `bash: ${command}: command not found`,
                    exitCode: 127
                }
        }
    }

    private ls(args: string[]): CommandResult {
        // Parse flags more elegantly - extract all flag characters from combined flags
        const flags = this.parseFlags(args)
        const showLong = flags.has('l')
        const showAll = flags.has('a')
        const showHidden = flags.has('A')
        
        const targetPath = args.find(arg => !arg.startsWith('-')) || '.'
        const resolvedPath = this.resolvePath(targetPath)
        
        const current = this.getNodeAtPath(resolvedPath)
        if (!current) {
            return {
                output: '',
                error: `ls: cannot access '${targetPath}': No such file or directory`,
                exitCode: 2
            }
        }

        if (current.type === 'file') {
            const fileName = resolvedPath[resolvedPath.length - 1]
            if (showLong) {
                const metadata = current.metadata!
                const permString = PermissionManager.formatPermissionString(metadata.permissions, false)
                const sizeStr = metadata.size.toString().padStart(8)
                const dateStr = PermissionManager.formatDate(metadata.modified)
                
                return {
                    output: `${permString} ${metadata.linkCount} ${metadata.owner} ${metadata.group} ${sizeStr} ${dateStr} ${fileName}`,
                    exitCode: 0
                }
            } else {
                return { output: fileName, exitCode: 0 }
            }
        }

        if (!current.children) {
            return { output: '', exitCode: 0 }
        }

        let entries = Object.keys(current.children)
        
        // Add . and .. entries for -a flag
        if (showAll) {
            entries = ['.', '..', ...entries]
        } else if (!showHidden) {
            entries = entries.filter(name => !name.startsWith('.'))
        }
        
        // Sort entries (directories first, then files, both alphabetically)
        entries.sort((a, b) => {
            if (a === '.' || a === '..') return -1
            if (b === '.' || b === '..') return 1
            
            const nodeA = current.children![a]
            const nodeB = current.children![b]
            
            if (nodeA && nodeB) {
                if (nodeA.type === 'directory' && nodeB.type === 'file') return -1
                if (nodeA.type === 'file' && nodeB.type === 'directory') return 1
            }
            
            return a.localeCompare(b)
        })

        if (showLong) {
            const output = entries.map(name => {
                let node: FileSystemNode | undefined
                let metadata: FileMetadata
                
                if (name === '.') {
                    node = current
                    metadata = current.metadata || {
                        permissions: PermissionManager.getDefaultDirectoryPermissions(),
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        created: new Date(),
                        linkCount: 1
                    }
                } else if (name === '..') {
                    // Create fake metadata for parent directory
                    metadata = {
                        permissions: PermissionManager.getDefaultDirectoryPermissions(),
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        created: new Date(),
                        linkCount: 2
                    }
                } else {
                    node = current.children![name]
                    metadata = node?.metadata || {
                        permissions: PermissionManager.getDefaultFilePermissions(),
                        owner: 'root',
                        group: 'root',
                        size: node?.content?.length || 0,
                        modified: new Date(),
                        created: new Date(),
                        linkCount: 1
                    }
                }
                
                const isDir = name === '.' || name === '..' || (node && node.type === 'directory')
                const permString = PermissionManager.formatPermissionString(metadata.permissions, isDir)
                const sizeStr = metadata.size.toString().padStart(8)
                const dateStr = PermissionManager.formatDate(metadata.modified)
                
                // No color coding for web terminal
                const displayName = name
                
                return `${permString} ${metadata.linkCount.toString().padStart(2)} ${metadata.owner.padEnd(8)} ${metadata.group.padEnd(8)} ${sizeStr} ${dateStr} ${displayName}`
            }).join('\n')
            
            return { output, exitCode: 0 }
        } else {
            // Format for regular ls (multi-column if many entries)
            if (entries.length <= 10) {
                // Simple list for few entries - no colors for web terminal
                const output = entries.join('  ')
                return { output, exitCode: 0 }
            } else {
                // Multi-column layout for many entries
                const terminalWidth = 80
                const maxNameLength = Math.max(...entries.map(name => name.length))
                const columnWidth = Math.min(maxNameLength + 2, 20)
                const columnsPerRow = Math.floor(terminalWidth / columnWidth)
                
                const rows: string[] = []
                for (let i = 0; i < entries.length; i += columnsPerRow) {
                    const rowEntries = entries.slice(i, i + columnsPerRow)
                    rows.push(rowEntries.join('  '))
                }
                
                return { output: rows.join('\n'), exitCode: 0 }
            }
        }
    }

    private cd(args: string[]): CommandResult {
        const targetPath = args[0] || '~'
        const resolvedPath = this.resolvePath(targetPath)
        
        const current = this.getNodeAtPath(resolvedPath)
        if (!current) {
            return {
                output: '',
                error: `bash: cd: ${targetPath}: No such file or directory`,
                exitCode: 1
            }
        }

        if (current.type !== 'directory') {
            return {
                output: '',
                error: `bash: cd: ${targetPath}: Not a directory`,
                exitCode: 1
            }
        }

        this.currentPath = resolvedPath
        return { output: '', exitCode: 0 }
    }

    private pwd(): CommandResult {
        const fullPath = this.currentPath.length === 0 ? '/' : '/' + this.currentPath.join('/')
        return { output: fullPath, exitCode: 0 }
    }

    private cat(args: string[]): CommandResult {
        if (args.length === 0) {
            return {
                output: '',
                error: 'cat: missing file argument',
                exitCode: 1
            }
        }

        const targetPath = args[0]
        const resolvedPath = this.resolvePath(targetPath)
        
        const current = this.getNodeAtPath(resolvedPath)
        if (!current) {
            return {
                output: '',
                error: `cat: ${targetPath}: No such file or directory`,
                exitCode: 1
            }
        }

        if (current.type !== 'file') {
            return {
                output: '',
                error: `cat: ${targetPath}: Is a directory`,
                exitCode: 1
            }
        }

        return { output: current.content || '', exitCode: 0 }
    }

    private mkdir(args: string[]): CommandResult {
        if (args.length === 0) {
            return {
                output: '',
                error: 'mkdir: missing operand',
                exitCode: 1
            }
        }

        const dirName = args[0]
        const currentDir = this.getCurrentDirectory()
        
        if (!currentDir || !currentDir.children) {
            return {
                output: '',
                error: 'mkdir: cannot create directory',
                exitCode: 1
            }
        }

        if (currentDir.children[dirName]) {
            return {
                output: '',
                error: `mkdir: cannot create directory '${dirName}': File exists`,
                exitCode: 1
            }
        }

        currentDir.children[dirName] = {
            type: 'directory',
            children: {}
        }

        return { output: '', exitCode: 0 }
    }

    private rmdir(args: string[]): CommandResult {
        if (args.length === 0) {
            return {
                output: '',
                error: 'rmdir: missing operand',
                exitCode: 1
            }
        }

        const dirName = args[0]
        const currentDir = this.getCurrentDirectory()
        
        if (!currentDir || !currentDir.children) {
            return {
                output: '',
                error: 'rmdir: failed to remove directory',
                exitCode: 1
            }
        }

        const target = currentDir.children[dirName]
        if (!target) {
            return {
                output: '',
                error: `rmdir: failed to remove '${dirName}': No such file or directory`,
                exitCode: 1
            }
        }

        if (target.type !== 'directory') {
            return {
                output: '',
                error: `rmdir: failed to remove '${dirName}': Not a directory`,
                exitCode: 1
            }
        }

        if (target.children && Object.keys(target.children).length > 0) {
            return {
                output: '',
                error: `rmdir: failed to remove '${dirName}': Directory not empty`,
                exitCode: 1
            }
        }

        delete currentDir.children[dirName]
        return { output: '', exitCode: 0 }
    }

    private rm(args: string[]): CommandResult {
        if (args.length === 0) {
            return {
                output: '',
                error: 'rm: missing operand',
                exitCode: 1
            }
        }

        const fileName = args[args.length - 1]
        const currentDir = this.getCurrentDirectory()
        
        if (!currentDir || !currentDir.children) {
            return {
                output: '',
                error: 'rm: cannot remove file',
                exitCode: 1
            }
        }

        if (!currentDir.children[fileName]) {
            return {
                output: '',
                error: `rm: cannot remove '${fileName}': No such file or directory`,
                exitCode: 1
            }
        }

        delete currentDir.children[fileName]
        return { output: '', exitCode: 0 }
    }

    private cp(args: string[]): CommandResult {
        if (args.length < 2) {
            return {
                output: '',
                error: 'cp: missing file operand',
                exitCode: 1
            }
        }

        const source = args[0]
        const dest = args[1]
        const currentDir = this.getCurrentDirectory()
        
        if (!currentDir || !currentDir.children) {
            return {
                output: '',
                error: 'cp: cannot copy file',
                exitCode: 1
            }
        }

        const sourceFile = currentDir.children[source]
        if (!sourceFile) {
            return {
                output: '',
                error: `cp: cannot stat '${source}': No such file or directory`,
                exitCode: 1
            }
        }

        if (sourceFile.type === 'file') {
            currentDir.children[dest] = {
                type: 'file',
                content: sourceFile.content
            }
        }

        return { output: '', exitCode: 0 }
    }

    private mv(args: string[]): CommandResult {
        if (args.length < 2) {
            return {
                output: '',
                error: 'mv: missing file operand',
                exitCode: 1
            }
        }

        const source = args[0]
        const dest = args[1]
        const currentDir = this.getCurrentDirectory()
        
        if (!currentDir || !currentDir.children) {
            return {
                output: '',
                error: 'mv: cannot move file',
                exitCode: 1
            }
        }

        const sourceFile = currentDir.children[source]
        if (!sourceFile) {
            return {
                output: '',
                error: `mv: cannot stat '${source}': No such file or directory`,
                exitCode: 1
            }
        }

        currentDir.children[dest] = { ...sourceFile }
        delete currentDir.children[source]

        return { output: '', exitCode: 0 }
    }

    private echo(args: string[], fullInput: string): CommandResult {
        // Handle redirection
        if (fullInput.includes('>')) {
            const parts = fullInput.split('>')
            const content = parts[0].replace('echo', '').trim().replace(/^['"]|['"]$/g, '')
            const fileName = parts[1].trim()
            
            const currentDir = this.getCurrentDirectory()
            if (currentDir && currentDir.children) {
                currentDir.children[fileName] = {
                    type: 'file',
                    content: content
                }
            }
            return { output: '', exitCode: 0 }
        }

        return { output: args.join(' ').replace(/^['"]|['"]$/g, ''), exitCode: 0 }
    }

    private help(): CommandResult {
        const commands = [
            'Available commands:',
            '  ls [-la] [path]     - List directory contents (-l=long, -a=all, -A=hidden)',
            '  cd [path]           - Change directory (~ for home)',
            '  pwd                 - Print working directory',
            '  cat <file>          - Display file contents',
            '  mkdir <dir>         - Create directory',
            '  rmdir <dir>         - Remove empty directory',
            '  rm <file>           - Remove file',
            '  cp <src> <dest>     - Copy file',
            '  mv <src> <dest>     - Move/rename file',
            '  echo <text>         - Display text',
            '  whoami              - Show current user (root)',
            '  id                  - Show user and group IDs',
            '  hostname            - Show hostname',
            '  date                - Show current date',
            '  uptime              - Show system uptime',
            '  uname [-a]          - Show system information',
            '  df                  - Show disk usage',
            '  free                - Show memory usage',
            '  ps                  - Show processes',
            '  env                 - Show environment variables',
            '  history             - Show command history',
            '  clear               - Clear screen',
            '  help                - Show this help',
            '',
            'Flag combinations supported (e.g. ls -la, ls -al, etc.)'
        ]
        return { output: commands.join('\n'), exitCode: 0 }
    }

    private uname(args: string[]): CommandResult {
        const flags = this.parseFlags(args)
        if (flags.has('a')) {
            return { output: 'Linux hacknexus 5.15.0-hacknexus #1 SMP x86_64 GNU/Linux', exitCode: 0 }
        }
        return { output: 'Linux', exitCode: 0 }
    }

    private df(): CommandResult {
        const output = [
            'Filesystem     1K-blocks    Used Available Use% Mounted on',
            '/dev/sda1       41943040 8482304  31315392  22% /',
            'tmpfs            4024288       0   4024288   0% /dev/shm',
            'tmpfs            4024288    1216   4023072   1% /run',
            '/dev/sda2      102400000 5242880  97157120   6% /home'
        ].join('\n')
        return { output, exitCode: 0 }
    }

    private free(): CommandResult {
        const output = [
            '              total        used        free      shared  buff/cache   available',
            'Mem:        8048576     2048512     3024512      102400     2975552     5012345',
            'Swap:       2097152           0     2097152'
        ].join('\n')
        return { output, exitCode: 0 }
    }

    private ps(): CommandResult {
        const output = [
            '  PID TTY          TIME CMD',
            '    1 ?        00:00:01 systemd',
            '    2 ?        00:00:00 kthreadd',
            '  123 pts/0    00:00:00 bash',
            '  456 pts/0    00:00:00 ps'
        ].join('\n')
        return { output, exitCode: 0 }
    }

    private env(): CommandResult {
        const output = [
            'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            'HOME=/root',
            'USER=root',
            'SHELL=/bin/bash',
            'PWD=' + (this.currentPath.length === 0 ? '/' : '/' + this.currentPath.join('/')),
            'TERM=xterm-256color',
            'LANG=en_US.UTF-8',
            'HOSTNAME=hacknexus'
        ].join('\n')
        return { output, exitCode: 0 }
    }
}