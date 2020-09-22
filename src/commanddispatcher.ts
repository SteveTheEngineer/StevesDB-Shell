import { CommandRegistry } from "./commandregistry";
import { ParsedCommand } from "./parsedcommand";
import { NamespacedKey } from "./namespacedkey";
import { CommandExecutor } from "./commandexecutor";
import { CommandUtils } from "./commandutils";
import { StevesDBShell } from "./stevesdbshell";

export class CommandDispatcher {
    private readonly registry: CommandRegistry;
    private readonly parent: StevesDBShell;

    public constructor(registry: CommandRegistry, parent: StevesDBShell) {
        this.registry = registry;
        this.parent = parent;
    }

    public getParent(): StevesDBShell {
        return this.parent;
    }

    public dispatchCommand(commandString: string): Promise<boolean> {
        const parsed: ParsedCommand = CommandUtils.parseCommand(commandString);
        const commandKey: NamespacedKey | undefined = this.registry.lookupCommand(parsed.name);
        if(commandKey) {
            const executor: CommandExecutor | undefined = this.registry.getCommand(commandKey);
            if(executor) {
                return executor.onCommand(this, parsed.name, parsed.args);
            }
        }
        return Promise.resolve(false);
    }

    public sendMessage(message: any): void {
        console.log(message);
    }

    public sendLocalizedMessage(key: string, ...objects: any) {
        this.sendMessage(this.getParent().getMessage(key, ...objects));
    }

    public sendTable(table: any): void {
        console.table(table);
    }
}