import { CommandExecutor } from "../commandexecutor";
import { CommandDispatcher } from "../commanddispatcher";

export class SelectExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
                if(dispatcher.getParent().getSelectedDatabase() === undefined) {
                    if(args.length >= 1) {
                        const name: string = args.join(" ");
                        dispatcher.getParent().setSelectedDatabase(await dispatcher.getParent().getClient().getDatabaseIfExists(name));
                        if(dispatcher.getParent().getSelectedDatabase() !== undefined) {
                            dispatcher.sendLocalizedMessage("command.select.database.selected", name);
                        } else {
                            dispatcher.sendLocalizedMessage("command.select.database.invalid", name);
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.select.usage");
                    }
                } else if(dispatcher.getParent().getSelectedTable() === undefined) {
                    if(args.length >= 1) {
                        const name: string = args.join(" ");
                        dispatcher.getParent().setSelectedTable(await dispatcher.getParent().getSelectedDatabase()?.getTableIfExists(name));
                        if(dispatcher.getParent().getSelectedTable() !== undefined) {
                            dispatcher.sendLocalizedMessage("command.select.table.selected", name);
                        } else {
                            dispatcher.sendLocalizedMessage("command.select.table.invalid", name);
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.select.usage");
                    }
                } else {
                    dispatcher.sendLocalizedMessage("command.select.noselectables");
                }
        } else {
            dispatcher.sendLocalizedMessage("command.select.unauthorized");
        }
        return true;
    }
}