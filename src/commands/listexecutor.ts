import { CommandExecutor } from "../commandexecutor";
import { CommandDispatcher } from "../commanddispatcher";
import { ComparatorOperation, Database, EntryFilter, Table } from "stevesdb-client-node";

export class ListExecutor extends CommandExecutor {
    public async onCommand(dispatcher: CommandDispatcher, command: string, args: string[]): Promise<boolean> {
        if(dispatcher.getParent().getClient().isLoggedIn()) {
            if(dispatcher.getParent().getSelectedTable() !== undefined) {
                let page: number = 0;
                let entriesPerPage: number = 10;
                const entryFilter: EntryFilter = {};

                if(args.length >= 1) {
                    page = Math.max(1, parseInt(args[0])) - 1;
                    if(isNaN(page)) {
                        page = 0;
                    }
                }
                if(args.length >= 2) {
                    entriesPerPage = Math.max(1, parseInt(args[1]));
                    if(isNaN(entriesPerPage)) {
                        entriesPerPage = 0;
                    }
                }
                if(args.length >= 3) {
                    const filterStr: string = args.slice(2).join(" ");
                    try {
                        const jsonFilter: any = JSON.parse(filterStr);
                        for(const column in jsonFilter) {
                            const value: any = jsonFilter[column];
                            if(typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                                entryFilter[column] = value;
                            } else if(typeof value === "object") {
                                const operation: any = value["operation"];
                                const comparedValue: any = value["value"];
                                let comparatorOperation: ComparatorOperation;
                                if(operation == undefined) {
                                    dispatcher.sendLocalizedMessage("command.list.entries.filter.column.nooperation", column);
                                    return true;
                                } else if(comparedValue == undefined) {
                                    dispatcher.sendLocalizedMessage("command.list.entries.filter.column.novalue", column);
                                    return true;
                                }
                                if(typeof operation === "string") {
                                    comparatorOperation = eval(`require("stevesdb-client-node").ComparatorOperation[\"${operation}\"]`);
                                    if(comparatorOperation == undefined) {
                                        dispatcher.sendLocalizedMessage("command.list.entries.filter.column.invalidoperation", column);
                                        return true;
                                    }
                                } else if(typeof operation === "number") {
                                    comparatorOperation = operation;
                                } else {
                                    dispatcher.sendLocalizedMessage("command.list.entries.filter.column.invalidoperationtype", column);
                                    return true;
                                }
                                if(typeof comparedValue === "string" || typeof comparedValue === "boolean" || typeof comparedValue === "number") {
                                    entryFilter[column] = {
                                        operation: comparatorOperation,
                                        value: comparedValue
                                    };
                                } else {
                                    dispatcher.sendLocalizedMessage("command.list.entries.filter.column.invalidvaluetype", column);
                                    return true;
                                }
                            } else {
                                dispatcher.sendLocalizedMessage("command.list.entries.filter.column.invalid", column, value);
                                return true;
                            }
                        }
                    } catch(e) {
                        dispatcher.sendLocalizedMessage("command.list.entries.filter.invalid");
                        return true;
                    }
                }

                dispatcher.sendTable(await dispatcher.getParent().getSelectedTable()?.getEntries(entryFilter, page * entriesPerPage, (page + 1) * entriesPerPage - 1));
                dispatcher.sendLocalizedMessage("command.list.entries.page", page + 1, entriesPerPage);
            } else if(dispatcher.getParent().getSelectedDatabase() !== undefined) {
                const tables: Table[] | undefined = await dispatcher.getParent().getSelectedDatabase()?.getTables();
                if(tables !== undefined && tables.length !== 0) {
                    dispatcher.sendLocalizedMessage("command.list.tables.header", tables.map(tbl => dispatcher.getParent().getMessage("command.list.tables.entry", tbl.getName())).join(dispatcher.getParent().getMessage("command.list.tables.separator")));
                } else {
                    dispatcher.sendLocalizedMessage("command.list.tables.empty");
                }
            } else {
                const databases: Database[] = await dispatcher.getParent().getClient().getDatabases();
                if(databases.length !== 0) {
                    dispatcher.sendLocalizedMessage("command.list.databases.header", databases.map(db => dispatcher.getParent().getMessage("command.list.databases.entry", db.getName())).join(dispatcher.getParent().getMessage("command.list.databases.separator")));
                } else {
                    dispatcher.sendLocalizedMessage("command.list.databases.empty");
                }
            }
        } else {
            dispatcher.sendLocalizedMessage("command.list.unauthorized");
        }
        return true;
    }
}