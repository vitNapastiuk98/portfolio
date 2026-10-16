import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

const angularApp = new AngularNodeAppEngine();

export const reqHandler = createNodeRequestHandler(async (request, response, next) => {
  try {
    const webResponse = await angularApp.handle(request);
    if (webResponse) {
      await writeResponseToNodeResponse(webResponse, response);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});
