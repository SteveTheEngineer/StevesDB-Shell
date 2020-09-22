import { CommandDispatcher } from "./commanddispatcher";

export abstract class CommandExecutor {
    public abstract async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean>;
    public onAutoComplete(dispatcher: CommandDispatcher, command: string, args: string[]): string[] {
        return [];
    }
}