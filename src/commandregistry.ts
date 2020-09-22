import { NamespacedKey } from "./namespacedkey";
import { CommandExecutor } from "./commandexecutor";

export class CommandRegistry {
    public static REGISTRY: CommandRegistry = new CommandRegistry();
    private readonly commandMap: Map<string, CommandExecutor> = new Map();
    private readonly primaryCommandMap: Map<string, string> = new Map();
    private readonly lookupMap: Map<string, string> = new Map();

    private constructor() {

    }

    public clear(): void {
        this.commandMap.clear();
        this.primaryCommandMap.clear();
        this.lookupMap.clear();
    }

    public register(key: NamespacedKey, executor: CommandExecutor): void {
        if(!this.commandMap.has(key.toString())) {
            this.commandMap.set(key.toString(), executor);
            this.lookupMap.set(key.toString(), key.toString());
            if(!this.primaryCommandMap.has(key.getKey())) {
                this.primaryCommandMap.set(key.getKey(), key.toString());
                this.lookupMap.set(key.getKey(), key.toString());
            }
        } else {
            throw "Unable to register an already registered command";
        }
    }

    public lookupCommand(name: string): NamespacedKey | undefined {
        return NamespacedKey.fromString(this.lookupMap.get(name.toLowerCase()));
    }

    public getCommand(key: NamespacedKey): CommandExecutor | undefined {
        return this.commandMap.get(key.toString());
    }

    public addAlias(name: string, command: NamespacedKey): void {
        this.lookupMap.set(name, command.toString());
    }
}