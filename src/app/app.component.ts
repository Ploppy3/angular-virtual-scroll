import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public items = [];
  public optimizedList = [];

  ngOnInit() {
    for (let i = 0; i < 1000; i++) {
      this.items.push(i);
    }
  }
}
