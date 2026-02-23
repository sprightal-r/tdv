import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Subscription } from "rxjs";
import { dbg } from "./debug.utils";

export class CustomValidators {
    static greaterThan(min: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => 
            control.value !== null && control.value <= min
                ? {
                    greaterThan: { value: control.value }
                }
                : null
    }
}

export type FormGroupMessagesConfig = {
    [name: string]: {
        [errorCode: string]: string
    }
}

export class FormMessageHandler {
    private valueChangeSubscription: Subscription;

    private _messages: string[] = [];
    get messages(): string[] { return this._messages; }

    constructor(
        private formGroup: FormGroup,
        private config: FormGroupMessagesConfig
    ) {
        // Initialize by checking errors
        for (const [_, control] of Object.entries(formGroup.controls)) {
            control.updateValueAndValidity();
        }
        this.updateMessages();
        if (dbg.forms) console.log('errors on init', formGroup.errors);

        // Every time a value changes, update messages
        this.valueChangeSubscription = formGroup.valueChanges
            .subscribe(() => {
                if (dbg.forms) console.log('errors after value change', formGroup.errors);
                this.updateMessages();
            });
    }

    private updateMessages(): void {
        // Generate a list of messages
        this._messages = Object.entries(this.formGroup.controls)
            // For each control
            .flatMap(([name, control]) => 
                Object.entries(this.config[name])
                    // Filter messages to errors that are present
                    .filter(([errorCode, _]) => control.hasError(errorCode))
                    .map(([_, message]) => message)
        )
        if (dbg.forms) console.log('error messages', this._messages);
    }
    
    destroy(): void {
        this.valueChangeSubscription?.unsubscribe();
    }
}