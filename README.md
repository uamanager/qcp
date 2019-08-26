# qcp - Quick Cryptico Protocol

[![Maintainability](https://api.codeclimate.com/v1/badges/730c8e5c21ea47965d13/maintainability)](https://codeclimate.com/github/uamanager/qcp/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/730c8e5c21ea47965d13/test_coverage)](https://codeclimate.com/github/uamanager/qcp/test_coverage)
[![Build Status](https://img.shields.io/circleci/build/github/uamanager/qcp/master?token=abc123def456)](https://circleci.com/gh/uamanager/qcp)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

`QCP` developed for those who use encryption in their apps. 
Basically it's class which can co-work with any kind of encryption library. 
But for examples we'll use [`cryptico`](https://www.npmjs.com/package/cryptico)

<!--transcribe-->

## Installation
```bash
    # with yarn:
    yarn add qcp
    # with npm:
    npm i --save qcp
```
## Usage
### Import

```typescript
    import {QuickCrypticoProtocol} from 'qcp';
```
or
```javascript
    const QuickCrypticoProtocol = require('qcp').QuickCrypticoProtocol;
```

### API
`QCP` goes through passed data, looking for `private` objects, takes them into
hash map, replaces `private` objects to hash map id, serializes hash map and then
encrypts it.
And vice versa.

 To mark object as private just add `private: true` property.
 Example:
```typescript
    // this object won't be encrypted
    const example1 = {
        foo: 'bar'
    };

    // but this one will
    const example2 = {
        private: true,
        foo: 'bar'
    };
```

### <a name="encrypt" href="https://github.com/uamanager/qcp/blob/master/src/protocol.ts#L49">`encrypt`</a>
Main method for encryption of object by protocol.
Examples:

#### Primitives:
```typescript
const example = 'test string';
const encoded = qcp.encode(example); // {public: 'test string'}
```

#### Arrays:
##### Array without private fields:
```typescript
const example = ['test string'];
const encoded = qcp.encode(example); // {public: ['test string']}
```

##### Array with private fields:
```typescript
const example = [
 {
   foo: 'bar',
   test: 1,
   private: true
 },
 {
   foo: 'bar',
   test: 2,
   private: true
 },
 'test'
];
const encoded = qcp.encode(example);
// {
//     public: ['0[Bsnz2rSBvg]', '1[hqusXQO7hi]', 'test'],
//     private: "{\"0[Bsnz2rSBvg]\":{\"foo\":\"bar\",\"test\":1,\"private\":true},\"1[hqusXQO7hi]\":{\"foo\":\"bar\",\"test\":2,\"private\":true}}"
// }
```

#### Objects:
##### Objects without private fields:
```typescript
 const example = {foo: 'bar'};
 const encoded = qcp.encode(example); // {public: {foo: 'bar'}}
```

##### Root objects with private fields:
```typescript
 const example = {
   foo: 'bar',
   private: true
 };
 const encoded = qcp.encode(example);
// {
//     public: 'public[odwHIurT6p]',
//     private: "{\"public[odwHIurT6p]\":{\"foo\":\"bar\",\"private\":true}}"
// }
```

##### Objects with nested private fields:
```typescript
 const example = {
      foo: 'bar',
      test1: {
        foo: 'bar',
        test: 1,
        private: true
      },
      test2: {
        foo: 'bar',
        test: 2,
        private: true
      }
    };
 const encoded = qcp.encode(example);
// {
//     public: {
//        "foo": "bar",
//        "test1": "test1[b0HcZPqCFz]",
//        "test2": "test2[5_ZGyNtUhD]",
//     },
//     private: "{\"test1[b0HcZPqCFz]\":{\"foo\":\"bar\",\"test\":1,\"private\":true},\"test2[5_ZGyNtUhD]\":{\"foo\":\"bar\",\"test\":2,\"private\":true}}"
// }
```

### <a name="decrypt" href="https://github.com/uamanager/qcp/blob/master/src/protocol.ts#L178">`decrypt`</a>
Main method for decryption of object by protocol. Works the same as `encrypt`
method but in reverse order. Not throwing error if passed data is not by protocol.

### <a name="encryptor/decryptor" href="https://github.com/uamanager/qcp/blob/master/src/protocol.ts#L201">`encryptor/decryptor`</a>
Methods that should be overwritten to support encryption.
Example:
```typescript
import {QuickCrypticoProtocol} from 'qcp';
import * as cryptico from 'cryptico';

export class Protocol extends QuickCrypticoProtocol {
	constructor (private privateKey: string, private publicKey: string) {
		super();
	}

// `encryptor` - method for data encrypt.
// By default returns the same data as was passed.
	public encryptor (data: string) {
		return cryptico.encrypt(data, this.publicKey).cipher;
	}
// `decryptor` - method for data decrypt.
// By default returns the same data as was passed.
	public decryptor (data: string) {
		return cryptico.decrypt(data, this.privateKey).plaintext;
	}
}
```

### <a name="Id Generation and Interpolation" href="https://github.com/uamanager/qcp/blob/master/src/protocol.ts#L233">`Id Generation and Interpolation`</a>
Method that generates id for replaced object. For prevent ids collision, it
adds random string.
Interpolation can be enabled by specifying `interpolationStart` and
`interpolationEnd` properties.

### <a name="Serialize/Deserialize" href="https://github.com/uamanager/qcp/blob/master/src/protocol.ts#L242">`Serialize/Deserialize`</a>
Methods which serialize/deserialize data before encryption.
By default `JSON.stringify`/`JSON.parse` used.

<!--/transcribe-->


 >     Copyright 2019 I. Panarin
 >
 >     This program is free software: you can redistribute it and/or modify
 >     it under the terms of the GNU General Public License as published by
 >     the Free Software Foundation, either version 3 of the License, or
 >     (at your option) any later version.
 >
 >     This program is distributed in the hope that it will be useful,
 >     but WITHOUT ANY WARRANTY; without even the implied warranty of
 >     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 >     GNU General Public License for more details.
 >
 >     You should have received a copy of the GNU General Public License
 >     along with this program.  If not, see <https://www.gnu.org/licenses/>.
