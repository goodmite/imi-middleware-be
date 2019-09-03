import { BehaviorSubject } from 'rxjs';

export class EventService {
  private static dataSource = new BehaviorSubject<any>(null);
  static data = EventService.dataSource.asObservable();

  static updatedDataSelection(data: any) {
    this.dataSource.next(data);
  }
}
