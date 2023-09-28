import { MetadataDay } from "./metadata-day";

export class CalendarDay {
    day: number;
    month: number;
    year: number;
    
    actualMonth: boolean;
    metadata: MetadataDay;

    public constructor(init?:Partial<CalendarDay>) {
        Object.assign(this, init);
    }
}