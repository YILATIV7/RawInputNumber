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
    @Input() allowNegative: boolean = true;

    @ViewChild('numberInput')
    set inputRef(value: ElementRef<HTMLInputElement> | undefined) {
        this.element = value?.nativeElement;
    }

    element: HTMLInputElement | undefined;

    ngOnInit() {
        setTimeout(() => {
            this.element!.focus();
        });
    }

    public onFocus(): void {
        this.element?.setSelectionRange(0, 1000);
    }

    public onBeforeInput(event: InputEvent) {
        if (!this.element) return;
        event.preventDefault();

        const cursorStart = this.element.selectionStart!;
        const cursorEnd = this.element.selectionEnd!;

        if (event.inputType === "deleteContentBackward") {
            const prevState: RangeCursorInputState = {
                value: this.element.value,
                cursorStart,
                cursorEnd
            };

            const nextState: CursorInputState = this.modifySpacesAdd(
                this.processDeleteBackward(
                    this.modifySpacesRemove(prevState)
                )
            );

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
                const nextState: CursorInputState = this.modifySpacesAdd(
                    this.processSymbol(
                        event.data,
                        this.modifySpacesRemove(prevState)
                    )
                );

                this.element.value = nextState.value;
                this.element.setSelectionRange(nextState.cursorIndex, nextState.cursorIndex);
            }
        }
    }

    private modifySpacesRemove(state: any): any {
        let cleanedValue = '';
        let removedBeforeStart = 0;
        let removedBeforeEnd = 0;

        for (let i = 0; i < state.value.length; i++) {
            const char = state.value[i];
            const isSpace = char === ' ';

            if ((state.cursorStart && i < state.cursorStart || state.cursorIndex && i < state.cursorIndex) && isSpace) removedBeforeStart++;
            if (i < state.cursorEnd && isSpace) removedBeforeEnd++;

            if (!isSpace) cleanedValue += char;
        }

        return {
            value: cleanedValue,
            cursorStart: state.cursorStart - removedBeforeStart,
            cursorEnd: state.cursorEnd - removedBeforeEnd,
            cursorIndex: state.cursorIndex - removedBeforeStart
        };
    }

    private modifySpacesAdd(state: CursorInputState): CursorInputState {
        const [intPart, fracPart] = state.value.split('.');
        const cursorInInt = Math.min(state.cursorIndex, intPart.length);

        const intBeforeCursor = intPart.slice(0, cursorInInt);
        const formattedBeforeCursor = intBeforeCursor.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const spaceCount = formattedBeforeCursor.length - intBeforeCursor.length;

        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const newValue = fracPart !== undefined ? `${formattedInt}.${fracPart}` : formattedInt;
        const newCursor = state.cursorIndex + spaceCount;

        return {
            value: newValue,
            cursorIndex: newValue[newCursor - 1] === ' ' ? newCursor + 1 : newCursor
        };
    }

    processDeleteBackward(state: RangeCursorInputState): CursorInputState {
        const separatorIndex = state.value.indexOf('.');
        const [intPart, fracPart] = state.value.split('.');

        if (state.cursorStart === state.cursorEnd) {
            if (separatorIndex === 1 && state.cursorStart === 1) {
                return {
                    value: '0' + state.value.substring(1),
                    cursorIndex: state.cursorStart
                };
            }

            if (intPart === '0' && state.cursorStart === 2) {
                return {
                    value: this.removePrefixZeros(state.value.substring(2)),
                    cursorIndex: 0
                };
            }

            if (state.cursorStart === 1) {
                return {
                    value: this.removePrefixZeros(state.value.substring(1)),
                    cursorIndex: 1
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

    processSymbol(symbol: string, state: CursorInputState): CursorInputState {

        if (this.isSeparator(symbol)) {
            if (state.value.indexOf('.') === state.cursorIndex) {
                return {
                    value: state.value,
                    cursorIndex: state.cursorIndex + 1
                };
            }

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
            if (!this.allowNegative) return state;
            // else do minus
        }

        if (!this.isDigit(symbol)) return state;

        const separatorIndex = state.value.indexOf('.');
        const [intPart, fracPart] = state.value.split('.');

        if (separatorIndex !== -1 && state.cursorIndex > separatorIndex) {
            // курсор справа від розділювача
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
            // курсор зліва від розділювача
            if (intPart.length >= this.maxLength) {
                if (state.cursorIndex === intPart.length) {
                    if (this.fractional === 0) return state;

                    if (state.value.includes('.')) {
                        return {
                            value: intPart + '.' + symbol + fracPart.substring(1),
                            cursorIndex: state.cursorIndex + 2,
                        }
                    } else {
                        return {
                            value: state.value + '.' + symbol,
                            cursorIndex: state.cursorIndex + 2,
                        }
                    }
                }
                else {
                    return {
                        value: state.value.substring(0, state.cursorIndex) + symbol + state.value.substring(state.cursorIndex + 1),
                        cursorIndex: state.cursorIndex + 1,
                    };
                }
            }

            if (intPart === '0' && state.cursorIndex === 1) {
                return {
                    value: symbol + state.value.substring(1),
                    cursorIndex: state.cursorIndex,
                };
            }

            if (symbol === '0' && state.cursorIndex === 0 && state.value.length !== 0) {
                return state;
            }

            return {
                value: state.value.substring(0, state.cursorIndex) + symbol + state.value.substring(state.cursorIndex),
                cursorIndex: state.cursorIndex + 1,
            };
        }
    }

    private removePrefixZeros(value: string): string {
        return value.replace(/^0+(?=\d)/, '');
    }

    private isSeparator(char: string): boolean {
        return ['.', ',', 'б', 'ю', '/', '?'].includes(char.toLowerCase());
    }

    private isDigit(char: string): boolean {
        return /^\d$/.test(char);
    }
}
