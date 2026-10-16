---
title: 'How to Bypass Interceptors in Angular'
description: 'How to ensure an Angular library’s API calls remain independent of interceptors configured by the consuming application.'
date: '2025-12-18'
tags:
  - Angular
  - HttpClient
  - Angular Libraries
featured: false
published: true
---

**How to ensure your Angular library’s API calls survive in any consuming application.**

## The Scenario: A Library Developer’s Nightmare

Recently, my team and I faced a classic problem while developing an enterprise Angular UI library. Our goal was to create a suite of reusable, high-quality UX components. Some of these components were smart—they needed to fetch their own configuration data or assets from our specific APIs.

We packaged the library, tested it in isolation, and it worked perfectly. We released it to production, and other teams started installing it into their main business applications.

Suddenly, the bug reports started rolling in.

> “The library components are returning 401 Unauthorized.”
>
> “The API is returning 400 Bad Request.”

## The Root Cause: The Interceptor Trap

When we investigated, we realized the issue wasn’t in our code. It was in the **consuming application**.

Most enterprise Angular apps have global **HTTP interceptors**. These interceptors are designed to attach bearer tokens, API keys, or custom tenant headers to _every_ outgoing HTTP request to communicate with their backend.

The problem? Our library’s API endpoint didn’t expect these headers. In fact, receiving an unexpected `Authorization` header or a custom `X-Tenant-ID` was causing our library’s backend to reject the requests.

## The “Wrong” Solution

A common knee-jerk reaction is to ask the application developers to modify their interceptors:

```typescript
// Please don't do this
intercept(req: HttpRequest<any>, next: HttpHandler) {
  // If the URL belongs to the library, skip logic
  if (req.url.includes('my-library-endpoint')) {
    return next.handle(req);
  }

  // ...attach tokens
}
```

This is an **anti-pattern**.

- **Tight coupling:** It forces the consumer to know about the internal URLs of your library.
- **Maintenance nightmare:** Every time you add a new endpoint to your library, every consuming app has to update its interceptors.
- **Fragility:** The library is no longer a “black box.”

## The Clean Solution: HttpBackend

Angular provides a sophisticated Dependency Injection system. While most of us are used to injecting `HttpClient`, fewer developers utilize the lower-level `HttpBackend`.

When you inject `HttpClient` normally, Angular constructs it using a chain of all registered interceptors. However, **HttpBackend** is the final link in that chain. It is the handler that actually dispatches the request to the browser’s XHR or Fetch API, **bypassing all interceptors entirely**.

To fix our library, we didn’t need to ask consumers to change a single line of code. We simply created a custom `HttpClient` instance for our library’s service.

## Implementation

Instead of injecting `HttpClient`, inject `HttpBackend` and create your own client:

```typescript
import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryConfigService {
  private httpClient: HttpClient;

  // Inject HttpBackend instead of HttpClient.
  constructor(private handler: HttpBackend) {
    // This client will not have any interceptors attached.
    this.httpClient = new HttpClient(handler);
  }

  loadConfig(): Observable<any> {
    // This call is raw, without auth headers or global handling.
    return this.httpClient.get('https://api.my-lib.com/config');
  }
}
```

## Bonus: What About Unit Testing?

You might be worried that manually instantiating `new HttpClient()` inside your service will break Angular’s standard testing utilities.

**The good news is: it works seamlessly.**

When you use `provideHttpClientTesting()` in your tests, Angular overrides the `HttpBackend` provider with a mock version called `HttpClientTestingBackend`. Because your service injects `HttpBackend` via the constructor, it receives this mock backend.

Here is how a standard test looks:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LibraryConfigService } from './library-config.service';

describe('LibraryConfigService', () => {
  let service: LibraryConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LibraryConfigService],
    });

    service = TestBed.inject(LibraryConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch config without using global interceptors', () => {
    const mockData = { version: '1.0' };

    service.loadConfig().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('https://api.my-lib.com/config');
    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush(mockData);
  });
});
```

## Conclusion

When building Angular libraries that perform their own data fetching, relying on the default `HttpClient` is risky. The consuming application’s environment is unpredictable.

By manually instantiating `HttpClient` via `HttpBackend`, you ensure your requests remain pure, your library remains robust, and your consumers remain happy.

_Originally published on [Medium](https://medium.com/@vit.napastiuk/how-to-bypass-interceptors-in-angular-a66ca3ab511c)._
