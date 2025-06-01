import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-input-number',
  imports: [],
  templateUrl: './input-number.html',
  styleUrl: './input-number.css'
})
export class InputNumber implements OnInit {
  value: string = "";

  constructor(

  ) {
  }

  ngOnInit() {

  }

  proceedInput(event: Event) {
    console.log(event);
    console.log(typeof event);
  }
}
