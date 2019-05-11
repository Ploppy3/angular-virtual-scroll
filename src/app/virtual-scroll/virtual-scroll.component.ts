import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ElementRef, NgZone, HostListener } from '@angular/core';

@Component({
  selector: 'app-virtual-scroll',
  template: `
    <div [style.height]="scrollHeight + 'px'"></div>
    <div id="content-wrapper" [style.transform]="'translate3d(0, ' + translateY + 'px, 0)'">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host{
      display: block;
      position: relative;
      overflow-x: hidden;
      overflow-y: scroll;
      will-change: transform;
    }
    #content-wrapper{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class VirtualScrollComponent implements OnInit, OnChanges {

  @Input() items: any[];
  @Input() itemHeight = 50;
  @Input() offset = 0;
  @Output() update: EventEmitter<any[]> = new EventEmitter<any[]>();

  public scrollHeight: number;
  public translateY: number;
  private visibleItems: any[] = [];

  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
  ) { }

  @HostListener('window:resize')
  onResize = () => {
    this.refresh();
  }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.elementRef.nativeElement.addEventListener('scroll', () => {
        this.refresh();
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'items') {
        this.refresh();
      }
    }
  }

  private refresh() {
    requestAnimationFrame(() => {
      this.scrollHeight = this.items.length * this.itemHeight; //  + 88 // offset bottom
      const height: number = this.elementRef.nativeElement.clientHeight;
      const scrollTop: number = this.elementRef.nativeElement.scrollTop;
      const visualStart = Math.floor(scrollTop / this.itemHeight);
      const offsetStart = Math.max(Math.floor(scrollTop / this.itemHeight) - this.offset, 0);
      const offsetEnd = Math.min(Math.ceil((height + scrollTop) / this.itemHeight) + this.offset, this.items.length);
      this.translateY = Math.min(
        scrollTop - (visualStart - offsetStart) * this.itemHeight - (scrollTop % this.itemHeight),
        this.items.length * this.itemHeight
      );
      const visibleItems = this.items.slice(offsetStart, offsetEnd);
      if (!areArraysEqual(visibleItems, this.visibleItems)) {
        this.zone.run(() => {
          this.visibleItems = visibleItems;
          this.update.next(visibleItems);
        });
      }
    });
  }
}

function areArraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] instanceof Array && b[i] instanceof Array) {
      if (!a[i].equals(b[i])) {
        return false;
      }
    } else if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
