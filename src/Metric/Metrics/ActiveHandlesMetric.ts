import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import { ObservableGauge } from '@opentelemetry/api-metrics';

@Injectable()
export class ActiveHandlesMetric implements BaseMetric {
  name = 'nodejs_active_handles';
  description =
    'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.';

  private observableGauge: ObservableGauge;

  constructor(private readonly metricService: MetricService) { }

  async inject(): Promise<void> {
    if (typeof process['_getActiveHandles'] !== 'function') {
      return;
    }

    this.observableGauge = this.metricService
      .getProvider()
      .getMeter('default')
      .createObservableGauge(this.name, {
        description: this.description,
      });
  }

  private aggregateByObjectName(list: string | any[]) {
    const data = {};

    for (let i = 0; i < list.length; i++) {
      const listElement = list[i];

      if (!listElement || typeof listElement.constructor === 'undefined') {
        continue;
      }

      if (Object.hasOwnProperty.call(data, listElement.constructor.name)) {
        data[listElement.constructor.name] += 1;
      } else {
        data[listElement.constructor.name] = 1;
      }
    }
    return data;
  }
}
