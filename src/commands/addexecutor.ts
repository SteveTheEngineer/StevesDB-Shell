import { EntryValues, TableColumn, TableColumnType } from "stevesdb-client-node";
import { CommandDispatcher } from "../commanddispatcher";
import { CommandExecutor } from "../commandexecutor";
import { CommandUtils } from "../commandutils";

export class AddExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
            if(args.length >= 1 || dispatcher.getParent().getSelectedTable() !== undefined) {
                const name: string = args.join(" ");
                if(dispatcher.getParent().getSelectedTable() !== undefined) {
                    const columns: TableColumn[] | undefined = await dispatcher.getParent().getSelectedTable()?.getColumns();
                    if(columns != undefined && columns.length > 0) {
                        const values: EntryValues = {};
                        for(const tc of columns) {
                            const value = await CommandUtils.userInput(dispatcher.getParent().getMessage("command.add.entry.valueinput", tc.getName(), TableColumnType[tc.getType()]));
                            values[tc.getName()] = value;
                        }
                        if(await dispatcher.getParent().getSelectedTable()?.addEntry(values)) {
                            dispatcher.sendTable([values]);
                            dispatcher.sendLocalizedMessage("command.add.entry.added");
                        } else {
                            dispatcher.sendLocalizedMessage("command.add.entry.nopermission");
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.add.entry.nocolumns");
                    }
                } else if(dispatcher.getParent().getSelectedDatabase() !== undefined) {
                    if(await dispatcher.getParent().getSelectedDatabase()?.table(name).create()) {
                        dispatcher.sendLocalizedMessage("command.add.table.created", name);
                    } else {
                        dispatcher.sendLocalizedMessage("command.add.table.exists", name);
                    }
                } else {
                    if(await dispatcher.getParent().getClient().database(name).create()) {
                        dispatcher.sendLocalizedMessage("command.add.database.created", name);
                    } else {
                        dispatcher.sendLocalizedMessage("command.add.database.exists", name);
                    }
                }
            } else {
                dispatcher.sendLocalizedMessage("command.add.usage");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.add.unauthorized");
        }
        return true;
    }
}