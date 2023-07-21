import ElevationLayer from "@giro3d/giro3d/core/layer/ElevationLayer";

class ElevationLayer2 extends ElevationLayer {
    async fetchImages({
        extent,
        width,
        height,
        target,
        alwaysVisible,
    }) {
        const node = target.node;

        const results = this.source.getImages({
            id: `${target.node.id}`,
            extent,
            width,
            height,
            signal: target.controller.signal,
        });

        if (results.length === 0) {
            // No new image to generate
            return;
        }

        // Register the ids on the tile
        results.forEach(r => {
            target.imageIds.add(r.id);
        });

        const allImages = [];

        for (const { id, request } of results) {
            if (!request || this.composer.has(id)) {
                continue;
            }

            // More recent requests should be served first.
            const priority = performance.now();
            const shouldExecute = () => this.filter(id);

            this.opCounter.increment();

            const requestId = `${this.uuid}-${id}`;

            const p = this.queue.enqueue({
                id: requestId, request, priority, shouldExecute,
            }).then(image => {
                if (!this.disposed) {
                    const opts = {
                        interpretation: this.interpretation,
                        fillNoData: this.fillNoData,
                        alwaysVisible,
                        flipY: this.source.flipY,
                        ...image,
                    };

                    this.composer.add(opts);
                    this.composer.lock(id, node.id);
                }
            }).finally(() => {
                this.opCounter.decrement();
            });

            allImages.push(p);
        }

        await Promise.allSettled(allImages);
    }
}

export default ElevationLayer2;
