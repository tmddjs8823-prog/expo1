import { Directive, ElementRef, OnInit, OnDestroy, Input, inject } from '@angular/core';

@Directive({ selector: '[appFadeUp]' })
export class FadeUpDirective implements OnInit, OnDestroy {
  @Input() appFadeUp = '0ms'; // delay
  private observer?: IntersectionObserver;
  private el = inject(ElementRef<HTMLElement>);

  ngOnInit() {
    const e = this.el.nativeElement;
    e.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
    if (this.appFadeUp && this.appFadeUp !== '0ms') {
      e.style.transitionDelay = this.appFadeUp;
    }
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          e.classList.remove('opacity-0', 'translate-y-8');
          e.classList.add('opacity-100', 'translate-y-0');
          this.observer?.unobserve(e);
        }
      },
      { threshold: 0.15 }
    );
    this.observer.observe(e);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
