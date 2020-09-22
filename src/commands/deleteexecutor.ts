import { ComparatorOperation, EntryFilter } from "stevesdb-client-node";
import { CommandDispatcher } from "../commanddispatcher";
import { CommandExecutor } from "../commandexecutor";
import { CommandUtils } from "../commandutils";

export class DeleteExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
                if(dispatcher.getParent().getSelectedTable() !== undefined) {
                    if(args.length >= 1) {
                        const filter: string = args.join(" ");
                        try {
                            const jsonFilter: any = JSON.parse(filter);
                            const entryFilter: EntryFilter = {};
                            for(const column in jsonFilter) {
                                const value: any = jsonFilter[column];
                                if(typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                                    entryFilter[column] = value;
                                } else if(typeof value === "object") {
                                    const operation: any = value["operation"];
                                    const comparedValue: any = value["value"];
                                    let comparatorOperation: ComparatorOperation;
                                    if(operation == undefined) {
                                        dispatcher.sendLocalizedMessage("command.delete.entry.filter.column.nooperation", column);
                                        return true;
                                    } else if(comparedValue == undefined) {
                                        dispatcher.sendLocalizedMessage("command.delete.entry.filter.column.novalue", column);
                                        return true;
                                    }
                                    if(typeof operation === "string") {
                                        comparatorOperation = eval(`require("stevesdb-client-node").ComparatorOperation[\"${operation}\"]`);
                                        if(comparatorOperation == undefined) {
                                            dispatcher.sendLocalizedMessage("command.delete.entry.filter.column.invalidoperation", column);
                                            return true;
                                        }
                                    } else if(typeof operation === "number") {
                                        comparatorOperation = operation;
                                    } else {
                                        dispatcher.sendLocalizedMessage("command.delete.entry.filter.column.invalidoperationtype", column);
                                        return true;
                                    }
                                    if(typeof comparedValue === "string" || typeof comparedValue === "boolean" || typeof comparedValue === "number") {
                                        entryFilter[column] = {
                                            operation: comparatorOperation,
                                            value: comparedValue
                                        };
                                    } else {
                                        dispatcher.sendLocalizedMessage("command.delete.entry.filter.column.invalidvaluetype", column);
                                        return true;
                                    }
                                } else {
                                    dispatcher.sendLocalizedMessage("command.delete.entry.filter.column.invalid", column, value);
                                    return true;
                                }
                            }
                            if(await dispatcher.getParent().getSelectedTable()?.removeEntries(entryFilter)) {
                                dispatcher.sendLocalizedMessage("command.delete.entry.deleted");
                            } else {
                                dispatcher.sendLocalizedMessage("command.delete.entry.nomatch");
                            }
                        } catch(e) {
                            dispatcher.sendLocalizedMessage("command.delete.entry.filter.invalid");
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.delete.entry.usage");
                    }
                } else if(dispatcher.getParent().getSelectedDatabase() !== undefined) {
                    if(args.length >= 1) {
                        const name: string = args.join(" ");
                        if((await CommandUtils.userInput(dispatcher.getParent().getMessage("command.delete.table.areyousureinput", name))) === dispatcher.getParent().getMessage("command.delete.table.iamsure")) {
                            if(await dispatcher.getParent().getSelectedDatabase()?.table(name).delete()) {
                                dispatcher.sendLocalizedMessage("command.delete.table.deleted", name);
                            } else {
                                dispatcher.sendLocalizedMessage("command.delete.table.invalid");
                            }
                        } else {
                            dispatcher.sendLocalizedMessage("command.delete.table.cancelled");
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.delete.table.usage");
                    }
                } else {
                    if(args.length >= 1) {
                        const name: string = args.join(" ");
                        if((await CommandUtils.userInput(dispatcher.getParent().getMessage("command.delete.database.areyousureinput", name))) === dispatcher.getParent().getMessage("command.delete.database.iamsure")) {
                            if(await dispatcher.getParent().getClient().database(name).delete()) {
                                dispatcher.sendLocalizedMessage("command.delete.database.deleted", name);
                            } else {
                                dispatcher.sendLocalizedMessage("command.delete.database.invalid");
                            }
                        } else {
                            dispatcher.sendLocalizedMessage("command.delete.database.cancelled");
                        }
                    } else {
                        dispatcher.sendLocalizedMessage("command.delete.database.usage");
                    }
                }
        } else {
            dispatcher.sendLocalizedMessage("command.delete.unauthorized");
        }
        return true;
    }

}