import { Database, Table } from "stevesdb-client-node";
import { CommandDispatcher } from "../commanddispatcher";
import { CommandExecutor } from "../commandexecutor";
import { CommandUtils } from "../commandutils";

export class RenameExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
            if(dispatcher.getParent().getSelectedTable() === undefined) {
                if(args.length >= 1) {
                    const table: Table | undefined = await dispatcher.getParent().getSelectedDatabase()?.getTableIfExists(args.join(" "));
                    if(table !== undefined) {
                        const newName: string = await CommandUtils.userInput(dispatcher.getParent().getMessage("command.rename.table.newnameinput"));
                        if(await table.rename(newName)) {
                            dispatcher.sendLocalizedMessage("command.rename.table.renamed", args.join(" "), newName);
                        } else {
                            dispatcher.sendLocalizedMessage("command.rename.table.exists", newName);
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.rename.table.invalid", args.join(" "));
                    }
                } else {
                    dispatcher.sendLocalizedMessage("command.rename.table.usage");
                }
            } else if(dispatcher.getParent().getSelectedDatabase() == undefined) {
                if(args.length >= 1) {
                    const database: Database | undefined = await dispatcher.getParent().getClient().getDatabaseIfExists(args.join(" "));
                    if(database !== undefined) {
                        const newName: string = await CommandUtils.userInput(dispatcher.getParent().getMessage("command.rename.database.newnameinput"));
                        if(await database.rename(newName)) {
                            dispatcher.sendLocalizedMessage("command.rename.database.renamed", args.join(" "), newName);
                        } else {
                            dispatcher.sendLocalizedMessage("command.rename.database.exists", newName);
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.rename.database.invalid", args.join(" "));
                    }
                } else {
                    dispatcher.sendLocalizedMessage("command.rename.database.usage");
                }
            } else {
                dispatcher.sendLocalizedMessage("command.rename.norenameables");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.rename.unauthorized");
        }
        return true;
    }
}