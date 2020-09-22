import { CommandExecutor } from "../commandexecutor";
import { CommandDispatcher } from "../commanddispatcher";

export class LogoutExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
            if(await dispatcher.getParent().getClient().logout()) {
                dispatcher.getParent().setSelectedTable(undefined);
                dispatcher.getParent().setSelectedDatabase(undefined);
                dispatcher.sendLocalizedMessage("command.logout.loggedout");
            } else {
                dispatcher.sendLocalizedMessage("command.logout.unable");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.logout.notloggedin");
        }
        return true;
    }
}