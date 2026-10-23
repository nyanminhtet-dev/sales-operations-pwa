import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-product-selection-sheet',
  templateUrl: './product-selection-sheet.component.html',
  styles: [':host dialog::backdrop { background: rgb(17 24 39 / 35%); }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectionSheetComponent implements AfterViewInit, OnDestroy {
  @Input() product: any;
  @Output() dismissed = new EventEmitter<void>();
  @ViewChild('dialog', { static: true }) dialog?: ElementRef<HTMLDialogElement>;
  quantity = 1;
  variant = '';
  imageFailed = false;
  private context?: gsap.Context;
  private media?: gsap.MatchMedia;
  private closing = false;

  ngAfterViewInit(): void {
    const dialog = this.dialog?.nativeElement;
    if (!dialog) return;
    dialog.showModal();
    this.context = gsap.context(() => {
      this.media = gsap.matchMedia();
      this.media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.selection-panel', { y: 24, opacity: 0, duration: 0.22, ease: 'power1.out', clearProps: 'transform,opacity' });
      });
    }, dialog);
  }

  close(): void {
    if (this.closing) return;
    this.closing = true;
    const finish = () => {
      this.dialog?.nativeElement.close();
      this.dismissed.emit();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    this.context?.add(() => gsap.to('.selection-panel', {
      y: 16, opacity: 0, duration: 0.14, ease: 'power1.in', overwrite: true, onComplete: finish,
    }));
  }

  onCancel(event: Event): void { event.preventDefault(); this.close(); }
  onBackdrop(event: MouseEvent): void { if (event.target === event.currentTarget) this.close(); }
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const dialog = this.dialog?.nativeElement;
    const controls = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && dialog?.ownerDocument.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && dialog?.ownerDocument.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
  updateQuantity(value: number): void {
    if (Number.isSafeInteger(value) && value >= 1) this.quantity = value;
  }

  ngOnDestroy(): void {
    this.context?.revert();
    this.media?.revert();
    this.dialog?.nativeElement.close();
  }
}
