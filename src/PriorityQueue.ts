class PriorityQueue<T> {
    private heap: Array<{ value: T; timestamp: number }> = [];

    enqueue(value: T) {
        const timestamp = Date.now();
        this.heap.push({ value, timestamp });
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue(): T | undefined {
        if(this.isEmpty()) return undefined;

        const root = this.heap[0];
        const lastNode = this.heap.pop()!;
        if(this.heap.length > 0) {
            this.heap[0] = lastNode;
            this.sinkDown(0);
        }

        return root.value;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(index: number) {
        const element = this.heap[index];
        while(index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if(element.timestamp <= parent.timestamp) break;
            this.heap[parentIndex] = element;
            this.heap[index] = parent;
            index = parentIndex;
        }
    }

    private sinkDown(index: number) {
        const length = this.heap.length;
        const element = this.heap[index];

        while(true) {
            let childIndex = 2 * index + 1;
            if(childIndex >= length) break;
            
            const child = this.heap[childIndex];
            const rightChildIndex = childIndex + 1;

            if(
                rightChildIndex < length &&
                this.heap[rightChildIndex].timestamp > child.timestamp
            ) {
                childIndex = rightChildIndex;
            }

            if(element.timestamp >= this.heap[childIndex].timestamp) break;

            this.heap[index] = this.heap[childIndex];
            this.heap[childIndex] = element;
            index = childIndex;
        }
    }
}