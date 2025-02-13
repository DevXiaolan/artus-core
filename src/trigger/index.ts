import { ExecutionContainer, Inject, Injectable, ScopeEnum } from '@artus/injection';
import { Input, Context, MiddlewareInput, Pipeline, Output } from '@artus/pipeline';
import { ArtusInjectEnum } from '../constant';
import { exceptionFilterMiddleware } from '../exception';
import { Application, TriggerType } from '../types';

@Injectable({ scope: ScopeEnum.SINGLETON })
export default class Trigger implements TriggerType {
  private pipeline: Pipeline;

  @Inject(ArtusInjectEnum.Application)
  private app: Application;

  constructor() {
    this.pipeline = new Pipeline();
    this.pipeline.use(exceptionFilterMiddleware);
  }

  async use(middleware: MiddlewareInput): Promise<void> {
    // TODO: async hook before pipeline.use(middleware)
    this.pipeline.use(middleware);
  }

  async initContext(input: Input = new Input(), output = new Output()): Promise<Context> {
    const ctx = new Context(input, output);
    ctx.container = new ExecutionContainer(ctx, this.app.container);
    ctx.container.set({
      id: ExecutionContainer,
      value: ctx.container,
    });
    return ctx;
  }

  async startPipeline(ctx: Context): Promise<void> {
    await this.pipeline.run(ctx);
  }
}
