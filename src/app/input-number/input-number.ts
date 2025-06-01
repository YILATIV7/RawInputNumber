import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

interface InputState {
    value: string;
    cursorIndex: number;
}

@Component({
    selector: 'app-input-number',
    imports: [],
    templateUrl: './input-number.html',
    styleUrl: './input-number.css'
})
export class InputNumber implements OnInit {
    @Input() fractional: number = 4;
    @Input() maxLength: number = 8;

    @ViewChild('numberInput')
    set dateInputRef(value: ElementRef<HTMLInputElement> | undefined) {
        this.element = value?.nativeElement;
    }

    element: HTMLInputElement | undefined;

    constructor() {
    }

    ngOnInit() {

    }

    public onBeforeInput(event: InputEvent) {
        if (!this.element) return;
        event.preventDefault();

        const cursorStart = this.element.selectionStart!;
        const cursorEnd = this.element.selectionEnd!;
        const valStr = this.element.value;

        if (event.inputType === "deleteContentBackward") {
            if (cursorStart === cursorEnd) {
                this.element.value = this.element.value.substring(0, cursorStart - 1) + this.element.value.substring(cursorStart);
                this.element.setSelectionRange(cursorStart - 1, cursorStart - 1);
            } else {
                this.element.value = this.element.value.substring(0, cursorStart) + this.element.value.substring(cursorEnd);
                this.element.setSelectionRange(cursorStart, cursorStart);
            }

        } else if (event.inputType === "deleteContentForward") {
            // do nothing

        } else if (event.inputType === "insertText" && cursorStart === cursorEnd) {
            const prevState: InputState = {
                value: this.element.value,
                cursorIndex: this.element.selectionStart!,
            }

            if (event.data && event.data.length === 1) {
                const resultState: InputState = this.processSymbol(event.data, prevState);
                this.element.value = resultState.value;
                this.element.setSelectionRange(resultState.cursorIndex, resultState.cursorIndex);
            }
        }
    }

    private processSymbol(symbol: string, state: InputState) {

        if (this.isSeparator(symbol)) {
            if (!state.value.includes('.')) {
                return {
                    value: state.value.substring(0, state.cursorIndex) + '.' + state.value.substring(state.cursorIndex),
                    cursorIndex: state.cursorIndex + 1,
                };
            }
            return state;
        }

        if (symbol === '-') {
            return state;
        }

        if (!this.isDigit(symbol)) return state;

        const separatorIndex = state.value.indexOf('.');
        const [intPart, fracPart] = state.value.split('.');

        if (separatorIndex !== -1 && state.cursorIndex > separatorIndex) {
            // курсор після розділювача
            if (fracPart.length < this.fractional) {
                return {
                    value: state.value.substring(0, state.cursorIndex) + symbol + state.value.substring(state.cursorIndex),
                    cursorIndex: state.cursorIndex + 1,
                };
            } else {
                if (state.cursorIndex === state.value.length) return state;

                return {
                    value: state.value.substring(0, state.cursorIndex) + symbol + state.value.substring(state.cursorIndex + 1),
                    cursorIndex: state.cursorIndex + 1,
                };
            }

        } else {
            // курсор до розділювача
            if (intPart.length >= this.maxLength) return state;

            return {
                value: state.value.substring(0, state.cursorIndex) + symbol + state.value.substring(state.cursorIndex),
                cursorIndex: state.cursorIndex + 1,
            };
        }
    }

    private isSeparator(char: string): boolean {
        return ['.', ',', 'б', 'ю', '/', '?'].includes(char.toLowerCase());
    }

    private isDigit(char: string): boolean {
        return /^\d$/.test(char);
    }
}
