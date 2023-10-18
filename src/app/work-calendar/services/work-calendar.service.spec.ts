import { TestBed } from '@angular/core/testing';

import { WorkCalendarService } from './work-calendar.service';

describe('WorkCalendarService', () => {
  let service: WorkCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
