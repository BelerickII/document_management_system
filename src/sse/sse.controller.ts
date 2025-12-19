import { Controller, Param, ParseIntPipe, Sse } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
    constructor(private readonly sseService: SseService ) {}    

    @Sse('documents/:studentId/:sessionId')
    streamDocUpdates(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('sessionId', ParseIntPipe) sessionId: number,
    ): Observable<MessageEvent> {
        return this.sseService.stream$.pipe(
            filter( event => 
                event.studentId === studentId &&
                event.sessionId === sessionId,
            ),
            map( event => ({
                data: event.payload,
            }) as MessageEvent),
        );
    }
}
