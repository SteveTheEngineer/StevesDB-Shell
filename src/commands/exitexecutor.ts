import { CommandExecutor } from "../commandexecutor";
import { CommandDispatcher } from "../commanddispatcher";

export class ExitExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        process.exit(0);
    }
}