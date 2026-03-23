import { useEffect, useRef } from 'react';

interface BubblePopGameProps {
  onComplete: (durationSeconds: number) => void;
}

const GAME_DURATION = 60;

export function BubblePopGame({ onComplete }: BubblePopGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import('phaser').Game | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initPhaser = async () => {
      const Phaser = (await import('phaser')).default;
      if (cancelled || !containerRef.current || gameRef.current) return;

      // Define scene AFTER Phaser is loaded
      class BubbleScene extends Phaser.Scene {
        private score = 0;
        private timeLeft = GAME_DURATION;
        private scoreText!: Phaser.GameObjects.Text;
        private timerText!: Phaser.GameObjects.Text;

        constructor() {
          super({ key: 'BubbleScene' });
        }

        create() {
          const { width, height } = this.scale;
          this.add.rectangle(width / 2, height / 2, width, height, 0xf0fdfa);

          this.scoreText = this.add
            .text(16, 16, 'Score: 0', {
              fontSize: '18px',
              color: '#0f766e',
              fontFamily: 'Inter, sans-serif',
            })
            .setDepth(10);

          this.timerText = this.add
            .text(width - 16, 16, `${GAME_DURATION}s`, {
              fontSize: '18px',
              color: '#0f766e',
              fontFamily: 'Inter, sans-serif',
            })
            .setOrigin(1, 0)
            .setDepth(10);

          this.time.addEvent({
            delay: 800,
            callback: this.spawnBubble,
            callbackScope: this,
            loop: true,
          });
          this.time.addEvent({ delay: 1000, callback: this.tick, callbackScope: this, loop: true });
        }

        private tick() {
          this.timeLeft -= 1;
          this.timerText.setText(`${this.timeLeft}s`);
          if (this.timeLeft <= 0) {
            this.scene.pause();
            this.time.delayedCall(500, () => onComplete(GAME_DURATION));
          }
        }

        private spawnBubble() {
          const { width, height } = this.scale;
          const x = Phaser.Math.Between(40, width - 40);
          const radius = Phaser.Math.Between(20, 45);
          const colors = [0x99f6e4, 0x5eead4, 0x2dd4bf, 0x14b8a6, 0x0d9488];
          const color = colors[Phaser.Math.Between(0, colors.length - 1)];

          const bubble = this.add
            .circle(x, height + radius, radius, color, 0.85)
            .setInteractive({ useHandCursor: true });

          this.tweens.add({
            targets: bubble,
            y: -radius,
            duration: Phaser.Math.Between(3000, 6000),
            ease: 'Linear',
            onComplete: () => bubble.destroy(),
          });

          bubble.on('pointerdown', () => {
            this.score += 1;
            this.scoreText.setText(`Score: ${this.score}`);
            const pop = this.add.circle(bubble.x, bubble.y, bubble.radius * 1.5, color, 0.4);
            this.tweens.add({
              targets: pop,
              alpha: 0,
              scaleX: 2,
              scaleY: 2,
              duration: 250,
              onComplete: () => pop.destroy(),
            });
            bubble.destroy();
          });
        }
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: containerRef.current.clientWidth || 400,
        height: 420,
        backgroundColor: '#f0fdfa',
        parent: containerRef.current,
        scene: BubbleScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });

      gameRef.current = game;
    };

    void initPhaser();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onComplete]);

  return <div ref={containerRef} className="w-full rounded-2xl overflow-hidden" />;
}
