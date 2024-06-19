export interface Command {
    command: string
    description: string
}

export interface CommandSet {
    name: string
    value: string
    prompt: string
    commands: Command[]
}

export interface Entries {
    [key: string]: CommandSet
}
