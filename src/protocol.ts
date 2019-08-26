/**
 *     This file is part of QCP.
 *
 *     Copyright 2019 I. Panarin
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {Id} from './id';

// ### API
// `QCP` goes through passed data, looking for `private` objects, takes them into
// hash map, replaces `private` objects to hash map id, serializes hash map and then
// encrypts it.
// And vice versa.

//  To mark object as private just add `private: true` property.
//  Example:
// ```typescript
//     // this object won't be encoded
//     const example1 = {
//         foo: 'bar'
//     };
//
//     // but this one will
//     const example2 = {
//         private: true,
//         foo: 'bar'
//     };
// ```

export class QuickCrypticoProtocol {
  public interpolationStart: string = '';
  public interpolationEnd: string = '';

  constructor () {}

  //# encode
  // Main method for encryption of object by protocol.
  // Examples:
  public encode (data: any, name?: string) {
    let result: { public: any, private?: any } = {
      public: data,
      private: {}
    };

    // #### Primitives:
    // ```typescript
    // const example = 'test string';
    // const encoded = qcp.encode(example); // {public: 'test string'}
    // ```

    if (result.public instanceof Array) {
      // #### Arrays:
      // ##### Array without private fields:
      // ```typescript
      // const example = ['test string'];
      // const encoded = qcp.encode(example); // {public: ['test string']}
      // ```

      // ##### Array with private fields:
      // ```typescript
      // const example = [
      //  {
      //    foo: 'bar',
      //    test: 1,
      //    private: true
      //  },
      //  {
      //    foo: 'bar',
      //    test: 2,
      //    private: true
      //  },
      //  'test'
      // ];
      // const encoded = qcp.encode(example);
      // // {
      // //     public: ['0[Bsnz2rSBvg]', '1[hqusXQO7hi]', 'test'],
      // //     private: "{\"0[Bsnz2rSBvg]\":{\"foo\":\"bar\",\"test\":1,\"private\":true},\"1[hqusXQO7hi]\":{\"foo\":\"bar\",\"test\":2,\"private\":true}}"
      // // }
      // ```
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
      // #### Objects:
      // ##### Objects without private fields:
      // ```typescript
      //  const example = {foo: 'bar'};
      //  const encoded = qcp.encode(example); // {public: {foo: 'bar'}}
      // ```
      result.public = {...result.public};
      if (result.public.private === true) {
        // ##### Root objects with private fields:
        // ```typescript
        //  const example = {
        //    foo: 'bar',
        //    private: true
        //  };
        //  const encoded = qcp.encode(example);
        // // {
        // //     public: 'public[odwHIurT6p]',
        // //     private: "{\"public[odwHIurT6p]\":{\"foo\":\"bar\",\"private\":true}}"
        // // }
        // ```
        const id = this.generateId(name || 'public');
        result.private = {
          ...result.private,
          [id]: result.public
        };
        result.public = id;
      } else {
        // ##### Objects with nested private fields:
        // ```typescript
        //  const example = {
        //       foo: 'bar',
        //       test1: {
        //         foo: 'bar',
        //         test: 1,
        //         private: true
        //       },
        //       test2: {
        //         foo: 'bar',
        //         test: 2,
        //         private: true
        //       }
        //     };
        //  const encoded = qcp.encode(example);
        // // {
        // //     public: {
        // //        "foo": "bar",
        // //        "test1": "test1[b0HcZPqCFz]",
        // //        "test2": "test2[5_ZGyNtUhD]",
        // //     },
        // //     private: "{\"test1[b0HcZPqCFz]\":{\"foo\":\"bar\",\"test\":1,\"private\":true},\"test2[5_ZGyNtUhD]\":{\"foo\":\"bar\",\"test\":2,\"private\":true}}"
        // // }
        // ```
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

  //# decode
  // Main method for decryption of object by protocol. Works the same as `encode`
  // method but in reverse order. Not throwing error if passed data is not by protocol.
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

  //# encoder/decoder
  // Methods that should be overwritten to support encryption.
  // Example:
  // ```typescript
  // import {QuickCrypticoProtocol} from 'qcp';
  // import * as cryptico from 'cryptico';
  //
  // export class Protocol extends QuickCrypticoProtocol {
  // 	constructor (private privateKey: string, private publicKey: string) {
  // 		super();
  // 	}
  //
  // // `encoder` - method for data encrypt.
  // // By default returns the same data as was passed.
  // 	public encoder (data: string) {
  // 		return cryptico.encrypt(data, this.publicKey).cipher;
  // 	}
  // // `decoder` - method for data decrypt.
  // // By default returns the same data as was passed.
  // 	public encoder (data: string) {
  // 		return cryptico.decrypt(data, this.privateKey).plaintext;
  // 	}
  // }
  // ```
  public encoder (data: string) {
    return data;
  }

  public decoder (data: string) {
    return data;
  }

  //# Id Generation and Interpolation
  // Method that generates id for replaced object. For prevent ids collision, it
  // adds random string.
  // Interpolation can be enabled by specifying `interpolationStart` and
  // `interpolationEnd` properties.
  public generateId (name: string) {
    return `${this.interpolationStart}${name}[${Id.get(10)}]${this.interpolationEnd}`;
  }

  //# Serialize/Deserialize
  // Methods which serialize/deserialize data before encryption.
  // By default `JSON.stringify`/`JSON.parse` used.
  public serialize (data: any): string {
    return JSON.stringify(data);
  }

  public deserialize (data: string): any {
    return JSON.parse(data);
  }
}
