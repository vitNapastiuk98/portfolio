import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';

@Component({ template: '' })
class EmptyPage {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: 'blog/test', component: EmptyPage }])],
    }).compileComponents();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps the skip link on the current detail route', async () => {
    await TestBed.inject(Router).navigateByUrl('/blog/test');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLAnchorElement>('.skip-link')
        ?.getAttribute('href'),
    ).toBe('/blog/test#main-content');
  });
});
