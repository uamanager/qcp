import {Id} from './id';

export class QuickCrypticoProtocol {
  public interpolationStart: string = '';
  public interpolationEnd: string = '';

  constructor () {}

  public generateId (name: string) {
    return `${this.interpolationStart}${name}[${Id.get(10)}]${this.interpolationEnd}`;
  }

  public encoder (data) {
    return data;
  }

  public decoder (data) {
    return data;
  }

  public encode (data: any, name?: string) {
    if (typeof data === 'object') {
      let result = {
        public: data,
        private: {}
      };

      if (result.public instanceof Array) {
        result.public.map((value, index) => {
          const next = this.encode(value, index.toString());
          if (typeof next === 'object') {
            result.private = {
              ...result.private,
              ...next.private
            };
            return next.public;
          }
          return next;
        });
      } else if (result.public instanceof Object) {
        if (
          result.public.hasOwnProperty('private') && !!result.public['private']
        ) {
          const id = this.generateId(name || 'public');
          result.private[id] = result.public.value;
          result.public.value = id;
        } else {
          Object.keys(result.public)
            .forEach((key) => {
              if (result.public.hasOwnProperty(key)) {
                const next = this.encode(result.public[key], key);
                if (typeof next === 'object') {
                  result.private = {
                    ...result.private,
                    ...next.private
                  };
                  result.public[key] = next.public;
                }
              }
            });
        }
      }
      if (!name) {
        result.private = this.encoder(this.serialize(result.private));
      }
      return result;
    }
    return data;
  }

  public decode (data) {
    if (
      typeof data === 'object'
      && data.hasOwnProperty('public')
      && data.hasOwnProperty('private')
    ) {
      let _result = JSON.stringify(data.public);
      const _private = this.deserialize(this.decoder(data.private));

      Object.keys(_private)
        .forEach((key) => {
          _result = _result.replace(`"${key}"`, JSON.stringify(_private[key]));
        });

      return JSON.parse(_result);
    }
    return data;
  }

  public serialize (data: any): string {
    return JSON.stringify(data);
  }

  public deserialize (data: string): any {
    return JSON.parse(data);
  }
}
