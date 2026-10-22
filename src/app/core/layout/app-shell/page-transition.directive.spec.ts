import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DefaultUrlSerializer, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { gsap } from 'gsap';
import { PageTransitionDirective } from './page-transition.directive';

@Component({ template: '<div appPageTransition data-page-surface><main id="main-content"><h1>Page</h1><input id="search" name="search"></main></div>' })
class TransitionHostComponent {}

describe('Page transitions', () => {
  let events: Subject<any>;
  let router: any;
  let preference: any;

  beforeEach(() => {
    events = new Subject<any>();
    const serializer = new DefaultUrlSerializer();
    router = { events, navigated: true, url: '/home', parseUrl: (url: string) => serializer.parse(url) };
    preference = { matches: false, addEventListener: jasmine.createSpy(), removeEventListener: jasmine.createSpy() };
    spyOn(window, 'matchMedia').and.returnValue(preference);
    TestBed.configureTestingModule({ declarations: [TransitionHostComponent, PageTransitionDirective], providers: [{ provide: Router, useValue: router }] });
  });

  it('keeps an inert outgoing page while the new page slides in, then cleans both layers', fakeAsync(() => {
    const fixture = TestBed.createComponent(TransitionHostComponent);
    fixture.detectChanges();
    const surface: HTMLElement = fixture.nativeElement.querySelector('[data-page-surface]');
    events.next(new NavigationStart(1, '/sales'));
    const snapshot: HTMLElement = fixture.nativeElement.querySelector('[data-page-snapshot]');
    expect(snapshot.inert).toBeTrue();
    expect(snapshot.getAttribute('aria-hidden')).toBe('true');
    expect(snapshot.querySelector('[id]')).toBeNull();
    expect(snapshot.querySelector('[name]')).toBeNull();
    events.next(new NavigationEnd(1, '/sales', '/sales'));
    expect(gsap.getProperty(surface, 'xPercent')).toBe(100);
    tick(17);
    const timeline = gsap.getTweensOf(surface)[0]?.parent;
    if (!timeline) throw new Error('Missing page timeline');
    timeline.progress(0.5);
    expect(Number(gsap.getProperty(surface, 'xPercent'))).toBeCloseTo(50, 0);
    expect(Number(gsap.getProperty(snapshot, 'xPercent'))).toBeCloseTo(-50, 0);
    timeline.progress(1);
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    expect(surface.style.transform).toBe('');
    fixture.destroy();
  }));

  it('reverses direction, cancels rapid transitions and handles failed navigation', fakeAsync(() => {
    const fixture = TestBed.createComponent(TransitionHostComponent);
    fixture.detectChanges();
    const surface: HTMLElement = fixture.nativeElement.querySelector('[data-page-surface]');
    router.url = '/sales';
    events.next(new NavigationStart(1, '/home'));
    events.next(new NavigationEnd(1, '/home', '/home'));
    expect(gsap.getProperty(surface, 'xPercent')).toBe(-100);
    tick(17);
    router.url = '/home';
    events.next(new NavigationStart(2, '/products'));
    expect(fixture.nativeElement.querySelectorAll('[data-page-snapshot]').length).toBe(1);
    expect(surface.style.transform).toBe('');
    events.next(new NavigationCancel(2, '/products', 'Cancelled'));
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    events.next(new NavigationStart(3, '/sales'));
    events.next(new NavigationError(3, '/sales', new Error('Unavailable')));
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    fixture.destroy();
    tick(500);
  }));

  it('skips initial and same-page navigations and reduced motion, including changes mid-transition', fakeAsync(() => {
    const fixture = TestBed.createComponent(TransitionHostComponent);
    fixture.detectChanges();
    router.navigated = false;
    events.next(new NavigationStart(1, '/sales'));
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    router.navigated = true;
    events.next(new NavigationStart(2, '/home?filter=one#main-content'));
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    preference.matches = true;
    events.next(new NavigationStart(3, '/sales'));
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    preference.matches = false;
    events.next(new NavigationStart(4, '/sales'));
    events.next(new NavigationEnd(4, '/sales', '/sales'));
    tick(17);
    preference.matches = true;
    preference.addEventListener.calls.first().args[1]();
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-page-surface]').style.transform).toBe('');
    fixture.destroy();
    expect(events.observed).toBeFalse();
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', preference.addEventListener.calls.first().args[1]);
    tick(500);
  }));

  it('has a fallback cleanup when animation frames are suspended', fakeAsync(() => {
    const fixture = TestBed.createComponent(TransitionHostComponent);
    fixture.detectChanges();
    events.next(new NavigationStart(1, '/sales'));
    events.next(new NavigationEnd(1, '/sales', '/sales'));
    tick(17);
    gsap.getTweensOf(fixture.nativeElement.querySelector('[data-page-surface]')).forEach(tween => tween.parent?.pause());
    tick(450);
    expect(fixture.nativeElement.querySelector('[data-page-snapshot]')).toBeNull();
    fixture.destroy();
  }));
});
