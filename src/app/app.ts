import {Component} from '@angular/core';
import {InputNumber} from './input-number/input-number';

@Component({
  selector: 'app-root',
    imports: [InputNumber],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'InputNumber';
}
