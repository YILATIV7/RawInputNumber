import {Component, ElementRef, ViewChild} from '@angular/core';
import {InputNumber} from './input-number/input-number';
import {NgIf} from '@angular/common';
import {CdkConnectedOverlay, CdkOverlayOrigin} from '@angular/cdk/overlay';

@Component({
    selector: 'app-root',
    imports: [CdkConnectedOverlay, CdkOverlayOrigin],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    @ViewChild('dateInput') dateInputRef: ElementRef<HTMLInputElement> | undefined;
    isOpen = false;

    onClick(event: MouseEvent): void {
        console.log("onClick");
    }

    clear() {
        console.log("clear");
    }

    protected readonly console = console;
}
