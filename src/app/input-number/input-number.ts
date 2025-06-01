import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

interface InputState {
    value: string;
}

interface CursorInputState extends InputState {
    cursorIndex: number;
}

interface RangeCursorInputState extends InputState {
    cursorStart: number;
    cursorEnd: number;
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
            const nextState: CursorInputState = this.processDeleteBackward({
                value: this.element.value,
                cursorStart,
                cursorEnd
            });

            this.element.value = nextState.value;
            this.element.setSelectionRange(nextState.cursorIndex, nextState.cursorIndex);

        } else if (event.inputType === "deleteContentForward") {
            // do nothing

        } else if (event.inputType === "insertText" && cursorStart === cursorEnd) {
            const prevState: CursorInputState = {
                value: this.element.value,
                cursorIndex: this.element.selectionStart!,
            }

            if (event.data && event.data.length === 1) {
                const resultState: CursorInputState = this.processSymbol(event.data, prevState);
                this.element.value = resultState.value;
                this.element.setSelectionRange(resultState.cursorIndex, resultState.cursorIndex);
            }
        }
    }

    private processDeleteBackward(state: RangeCursorInputState): CursorInputState {
        const separatorIndex = state.value.indexOf('.');
        const [intPart, fracPart] = state.value.split('.');

        if (state.cursorStart === state.cursorEnd) {
            if (intPart.length === 1) {
                return {
                    value: '0' + state.value.substring(1),
                    cursorIndex: state.cursorStart
                };
            }

            if (state.cursorStart > 0) {
                return {
                    value: state.value.substring(0, state.cursorStart - 1) + state.value.substring(state.cursorStart),
                    cursorIndex: state.cursorStart - 1
                };
            }

            return {
                value: state.value,
                cursorIndex: state.cursorEnd,
            };
        } else {
            return {
                value: state.value.substring(0, state.cursorStart) + state.value.substring(state.cursorEnd),
                cursorIndex: state.cursorStart
            };
        }
    }

    private processSymbol(symbol: string, state: CursorInputState): CursorInputState {

        if (this.isSeparator(symbol)) {
            if (!state.value.includes('.') && state.cursorIndex >= state.value.length - this.fractional) {
                if (state.cursorIndex === 0) {
                    return {
                        value: '0.' + state.value,
                        cursorIndex: 2,
                    };
                } else {
                    return {
                        value: state.value.substring(0, state.cursorIndex) + '.' + state.value.substring(state.cursorIndex),
                        cursorIndex: state.cursorIndex + 1,
                    };
                }
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

            if (intPart === '0' && state.cursorIndex === 1) {
                return {
                    value: symbol + state.value.substring(1),
                    cursorIndex: state.cursorIndex,
                };
            }

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
