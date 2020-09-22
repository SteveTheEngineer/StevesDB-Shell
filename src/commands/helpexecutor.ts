import { CommandDispatcher } from "../commanddispatcher";
import { CommandExecutor } from "../commandexecutor";

export class HelpExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        dispatcher.sendLocalizedMessage("command.help.response");
        return true;
    }
}