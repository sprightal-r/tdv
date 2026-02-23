import { Injectable } from "@angular/core";
import { BehaviorSubject, filter } from "rxjs"

export enum MessageTypes {
    Info,
    Success,
    Error
}

export interface Message {
    type: MessageTypes,
    text: string
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
    private messageSubject = new BehaviorSubject<Message | undefined>(undefined);
    messages$ = this.messageSubject.asObservable().pipe(filter(x => x !== undefined));

    post(text: string, type: MessageTypes = MessageTypes.Info) {
        this.messageSubject.next({
            type,
            text
        });
    }
}