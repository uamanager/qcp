import {Id} from './id';

export class QuickCrypticoProtocol {
  public interpolationStart: string = '';
  public interpolationEnd: string = '';

  constructor () {}

  public generateId (name: string) {
    return `${this.interpolationStart}${name}[${Id.get(10)}]${this.interpolationEnd}`;
  }

  public encoder (data: string) {
    return data;
  }

  public decoder (data: string) {
    return data;
  }

  public encode (data: any, name?: string) {
    let result: { public: any, private?: any } = {
      public: data,
      private: {}
    };

    if (result.public instanceof Array) {
      result.public = [...result.public];
      result.public = result.public.map((value, index) => {
        const tmp = this.encode(value, index.toString());
        result.private = {
          ...result.private,
          ...tmp.private
        };
        return tmp.public;
      });
    } else if (result.public instanceof Object) {
      result.public = {...result.public};
      if (result.public.private === true) {
        const id = this.generateId(name || 'public');
        result.private = {
          ...result.private,
          [id]: result.public
        };
        result.public = id;
      } else {
        Object.keys(result.public)
          .forEach((key) => {
            const tmp = this.encode(result.public[key], key);
            result.private = {
              ...result.private,
              ...tmp.private
            };
            result.public[key] = tmp.public;
          });
      }
    }

    if (!name) {
      if (Object.keys(result.private).length) {
        result.private = this.encoder(this.serialize(result.private));
      } else {
        delete result.private;
      }
    }

    return result;
  }

  public decode (data) {
    if (data instanceof Object && data.hasOwnProperty('public')) {
      if (data.hasOwnProperty('private')) {
        let _result = JSON.stringify(data.public);
        const _private = this.deserialize(this.decoder(data.private));

        Object.keys(_private)
          .forEach((key) => {
            _result = _result.replace(`"${key}"`, JSON.stringify(_private[key]));
          });

        return JSON.parse(_result);
      } else {
        return data.public;
      }
    } else {
      return data;
    }
  }

  public serialize (data: any): string {
    return JSON.stringify(data);
  }

  public deserialize (data: string): any {
    return JSON.parse(data);
  }
}
