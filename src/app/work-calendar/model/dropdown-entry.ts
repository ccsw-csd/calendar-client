export class DropdownEntry {
    code: string;
    name: string;

    public constructor(init?:Partial<DropdownEntry>) {
        Object.assign(this, init);
    }
}