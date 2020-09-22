import { TableColumn, TableColumnType } from "stevesdb-client-node";
import { CommandDispatcher } from "../commanddispatcher";
import { CommandExecutor } from "../commandexecutor";
import { CommandUtils } from "../commandutils";

export class ColumnsExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
            if(dispatcher.getParent().getSelectedTable() !== undefined) {
                const opmode: string = args.length >= 1 ? args[0] : "";
                if(opmode === "list") {
                    const columns: TableColumn[] | undefined = await dispatcher.getParent().getSelectedTable()?.getColumns();
                    if(columns != undefined && columns.length > 0) {
                        dispatcher.sendLocalizedMessage("command.columns.list.header", columns.map(tc => dispatcher.getParent().getMessage("command.columns.list.entry", tc.getName(), TableColumnType[tc.getType()])).join(dispatcher.getParent().getMessage("command.columns.list.separator")));
                    } else {
                        dispatcher.sendLocalizedMessage("command.columns.list.nocolumns");
                    }
                } else if(opmode === "add") {
                    if(args.length >= 3) {
                        const typeStr: string = args[1];
                        const name: string = args.slice(2).join(" ");
                        const type: TableColumnType | undefined = eval(`require("stevesdb-client-node").TableColumnType["${typeStr.toUpperCase().replace(/"/g, "\\\"")}"]`);
                        if(type != undefined) {
                            if(await dispatcher.getParent().getSelectedTable()?.addColumn(type, name)) {
                                dispatcher.sendLocalizedMessage("command.columns.add.added", name);
                            } else {
                                dispatcher.sendLocalizedMessage("command.columns.add.exists", name);
                            }
                        } else {
                            dispatcher.sendLocalizedMessage("command.columns.add.invalidtype", typeStr);
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.columns.add.usage");
                    }
                } else if(opmode === "remove") {
                    if(args.length >= 2) {
                        const name: string = args.slice(1).join(" ");
                        const column: TableColumn | undefined = await dispatcher.getParent().getSelectedTable()?.getColumn(name);
                        if(column !== undefined) {
                            if(await column.remove()) {
                                dispatcher.sendLocalizedMessage("command.columns.remove.removed");
                            } else {
                                dispatcher.sendLocalizedMessage("command.columns.remove.nopermission");
                            }
                        } else {
                            dispatcher.sendLocalizedMessage("command.columns.remove.invalid");
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.columns.remove.usage");
                    }
                } else if(opmode === "rename") {
                    if(args.length >= 2) {
                        const name: string = args.slice(1).join(" ");
                        const column: TableColumn | undefined = await dispatcher.getParent().getSelectedTable()?.getColumn(name);
                        if(column !== undefined) {
                            const newName: string = await CommandUtils.userInput("New table name: ");
                            if(await column.rename(newName)) {
                                dispatcher.sendLocalizedMessage("command.columns.rename.renamed", column?.getName(), newName);
                            } else {
                                dispatcher.sendLocalizedMessage("command.columns.rename.exists");
                            }
                        } else {
                            dispatcher.sendLocalizedMessage("command.columns.rename.invalid");
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.columns.rename.usage");
                    }
                } else {
                    dispatcher.sendLocalizedMessage("command.columns.usage");
                }
            } else {
                dispatcher.sendLocalizedMessage("command.columns.notable");
            }
        } else {
            dispatcher.sendLocalizedMessage("command.columns.unauthorized");
        }
        return true;
    }
}