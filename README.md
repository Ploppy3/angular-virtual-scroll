# VirtualScroll

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.9.

## Usage

- Copy the `virtual-scroll.component.ts` to your project
- Add it to your app.modules.ts declarations's array

```html
<app-virtual-scroll [items]="items" [itemHeight]="50" [offset]="0" (update)="optimizedList = $event">
  <div class="item" *ngFor="let item of optimizedList">
    {{item}}
  </div>
</app-virtual-scroll>
```
