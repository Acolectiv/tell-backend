import * as prometheus from "prom-client";

type LogMap = {
    [key: string]: number;
};

type PromMap = {
    [key: string]: prometheus.Counter<string>
};

export class CounterMap {
    counters: LogMap;
    prom_counters: PromMap;

    constructor() {
        this.counters = {};
        this.prom_counters = {};
    }

    public inc(key: string): number {
        if(this.counters[key] === undefined || this.prom_counters[key] === undefined) {
            this.counters[key] = 0;
            this.prom_counters[key] = new prometheus.Counter({
                name: `counter_${key}`,
                help: `counter related to ${key}`
            });
        }

        this.counters[key]++;
        this.prom_counters[key].inc();

        return this.counters[key];
    }
}