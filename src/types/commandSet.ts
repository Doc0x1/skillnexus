export interface Command {
    command: string
    description: string
}

export interface CommandSet {
    name: string
    value: string
    type: string
    commands: Command[]
}

export interface Entries {
    [key: string]: CommandSet
}
