import { CommandExecutor } from "../commandexecutor";
import { CommandDispatcher } from "../commanddispatcher";

export class DeselectExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
            if(dispatcher.getParent().getSelectedTable() !== undefined) {
                dispatcher.sendLocalizedMessage("command.deselect.table", dispatcher.getParent().getSelectedTable()?.getName());
                dispatcher.getParent().setSelectedTable(undefined);
            } else if(dispatcher.getParent().getSelectedDatabase() !== undefined) {
                dispatcher.sendLocalizedMessage("command.deselect.database", dispatcher.getParent().getSelectedDatabase()?.getName());
                dispatcher.getParent().setSelectedDatabase(undefined);
            } else {
                dispatcher.sendLocalizedMessage("command.deselect.nopath");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.deselect.unauthorized");
        }
        return true;
    }
}