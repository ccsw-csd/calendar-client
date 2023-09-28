export class ScheduleType {
    id: number;
    name: string;
    color: string;
    hours: number;
    minutes: number;
    absence: boolean; 

    public constructor(init?:Partial<ScheduleType>) {
    Object.assign(this, init);
    }
}