export class PlayerController {
  speed = 45;

  onStart(ctx: { log: (m: string) => void; parameters: Record<string, unknown> }) {
    const configured = ctx.parameters.speed;
    if (typeof configured === 'number') this.speed = configured;
    ctx.log(`PlayerController started (speed=${this.speed})`);
  }

  onUpdate(ctx: { dt: number; rotateY: (deg: number) => void }) {
    ctx.rotateY(this.speed * ctx.dt);
  }
}
