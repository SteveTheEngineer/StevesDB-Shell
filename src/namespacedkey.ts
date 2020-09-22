export class NamespacedKey {
    private readonly namespace: string;
    private readonly key: string;

    public constructor(namespace: string, key: string) {
        this.namespace = namespace.toLowerCase();
        this.key = key.toLowerCase();
    }

    public getNamespace(): string {
        return this.namespace;
    }

    public getKey(): string {
        return this.key;
    }

    public toString(): string {
        return this.namespace + ":" + this.key;
    }

    public static fromString(string: string | undefined): NamespacedKey | undefined {
        if(string == undefined) {
            return undefined;
        }
        return new NamespacedKey(string.split(":")[0], string.split(":")[1]);
    } 
}