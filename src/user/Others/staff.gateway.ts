import { Injectable } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "http";

//This is the websocket gateway the staff facing application listens to
@WebSocketGateway({
    cors: {
        origin: '*', //ask AI to explain this till you understand
    },
})
@Injectable()
export class documentGateway {
    @WebSocketServer()
    server: Server;

    //when a staff clicks view the server locks the document record (immediately removing the document from the pool)
    emitDocumentLocked(documentId: number, lockedBy: number) {
        this.server.emit('document_locked', {
            documentId, lockedBy, timestamp: Date.now(),
        });
    }

    //return the document back to the pool if the staff doesn't perform any review action after a limited time
    emitDocumentUnlocked(documentId: number) {
        this.server.emit('document_unlocked', {
            documentId, 
        })
    }
}