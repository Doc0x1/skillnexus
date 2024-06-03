export interface Command {
    command: string;
    description: string;
}

export interface CommandSet {
    value: string;
    prompt: string;
    commands: Command[];
}

export interface Entries {
    [key: string]: CommandSet
}
