export interface HttpTransport {
  get(url: any, params?: any): any;

  delete(url: any): any;

  post(url: any, data: any): any;

  patch(url: any, data: any): any;

  put(url: any, data: any): any;

  request(options: any): any;

  datasourceRequest(options: any): any;
}

interface Metric {
  name: string;
}

export interface Entity {
  name: string;
}

interface BaseSettings {
  basicAuth: string;
  proxyUrl: string;
}

interface AtsdVersion {
  buildInfo: {
    revisionNumber: string;
    hbaseVersion?: string;
  };
}

export interface SeriesFilter {
  entity: string;
  metric: string;
  startDate: string;
  endDate: string;
  limit: number;
  tags?: {[key: string]: string[]};
  timeFormat: string;
  aggregate: any;
}

export interface Series {
}

export class AtsdClient {
  private static readonly BASE_URL = 'api/v1/';

  constructor(private transport: HttpTransport, private baseSettings: BaseSettings) {
  }

  metrics(entityName: string): Promise<Array<Metric>> {
    const options = {
      method: 'GET',
      url: `entities/${entityName}/metrics`,
    };

    return this.baseRequest(options);
  }

  entities(): Promise<Array<Entity>> {
    return this.baseRequest({
      method: 'GET',
      url: `entities`,
    });
  }

  version(): Promise<AtsdVersion> {
    return this.baseRequest({
      method: 'GET',
      url: 'version',
    }).catch(() => {
      throw new Error('Failed to execute test query!');
    });
  }

  metricSeries(metricName): Promise<any> {
    return this.baseRequest({
      method: 'GET',
      url: `metrics/${metricName}/series`,
    });
  }

  querySeries(q: any[]): Promise<any[]> {
    return this.transport.datasourceRequest(this.mixinBaseOptions({
      url: 'series/query',
      method: 'POST',
      data: q,
    }));
  }

  private baseRequest(options): Promise<any> {
    const cOptions = this.mixinBaseOptions(options);
    return this.transport.request(cOptions).then(resp => {
      return resp;
    });
  }

  private mixinBaseOptions(options) {
    return {
      ...options,
      headers: {
        basicAuth: this.baseSettings.basicAuth,
      },
      url: this.fullUrl(options.url),
    };
  }

  private fullUrl(part) {
    const url = this.baseSettings.proxyUrl;
    const fullUrl = url[url.length - 1] !== '/' ? `${url}/` : url;
    if (!(part.length <= 0 || part[0] !== '/')) {
      part = part.substr(1, part.length - 1);
    }
    return fullUrl + AtsdClient.BASE_URL + part;
  }
}
