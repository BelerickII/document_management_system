import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
    private subject = new Subject<any>();

    emitDocumentUpdate(event: {
        studentId: string,
        sessionId: string,
        payload: any;
    }) {
        this.subject.next(event);
    }

    get stream$() {
        return this.subject.asObservable();
    }
}
