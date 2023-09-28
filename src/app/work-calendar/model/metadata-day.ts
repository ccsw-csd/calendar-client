import { ScheduleType } from "./schedule-type";

export class MetadataDay {
    id: number;
    month: number;
    day: number;
    year: number;
    
    type: ScheduleType;
    originalType: ScheduleType = null;

    public constructor(init?:Partial<MetadataDay>) {
    Object.assign(this, init);
    }
}