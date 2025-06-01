import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {InputNumber} from './input-number/input-number';

@Component({
  selector: 'app-root',
    imports: [RouterOutlet, InputNumber],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'InputNumber';
}
