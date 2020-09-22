import { CommandExecutor } from "../commandexecutor";
import { CommandDispatcher } from "../commanddispatcher";

export class ClearExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        console.clear();
        return true;
    }
}