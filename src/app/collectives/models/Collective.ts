import { Center } from "src/app/centers/models/Center";

export interface Collective {
    id:number;
    name:string;
    maxHourYear: number;
    hoursWeek: number;
    hoursF: number;
    hoursIntensive?: number;
    intensive?: boolean;
    intensiveFrom?: Date;
    intensiveTo?: Date;
    personalDays: number;
    freeDays?: number;
    additionalDays: number;
    holidays: number;
    centersSelected?: Center[];
}

export interface Calendar {
    id: number;
    centerId: number;
    groupId: number;
    centerName?: string;
    groupName?: string;
}