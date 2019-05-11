import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ElementRef, NgZone, HostListener } from '@angular/core';

@Component({
  selector: 'app-virtual-scroll',
  template: `
    <div [style.height]="scrollHeight + offsetBottom + 'px'"></div>
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
  @Input() preload = 0;
  @Input() offsetBottom = 0;
  @Output() update: EventEmitter<any[]> = new EventEmitter<any[]>();

  public scrollHeight: number;
  public translateY: number;
  private offsetStart = 0;
  private offsetEnd = 0;

  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
  ) { }

  @HostListener('window:resize')
  onResize = () => {
    this.refresh();
  }

  ngOnInit() {
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
    this.scrollHeight = this.items.length * this.itemHeight;
    const height: number = this.elementRef.nativeElement.clientHeight;
    const scrollTop: number = this.elementRef.nativeElement.scrollTop;
    const visualStart = Math.floor(scrollTop / this.itemHeight);
    const offsetStart = Math.max(Math.floor(scrollTop / this.itemHeight) - this.preload, 0);
    const offsetEnd = Math.min(Math.ceil((height + scrollTop) / this.itemHeight) + this.preload, this.items.length);
    this.translateY = Math.min(
      scrollTop - (visualStart - offsetStart) * this.itemHeight - (scrollTop % this.itemHeight),
      this.items.length * this.itemHeight
    );
    if (offsetStart !== this.offsetStart || offsetEnd !== this.offsetEnd) {
      this.zone.run(() => {
        const visibleItems = this.items.slice(offsetStart, offsetEnd);
        this.update.next(visibleItems);
      });
    }
    this.offsetStart = offsetStart;
    this.offsetEnd = offsetEnd;
  }
}
