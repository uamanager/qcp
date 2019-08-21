import {QuickCrypticoProtocol} from '../src';

class TestQCP extends QuickCrypticoProtocol {
  public generateId (name: string) {
    return `[id]${name}`;
  }
}

let qcp;

beforeEach(() => {
  qcp = new TestQCP();
});

afterEach(() => {
  qcp = undefined;
});

describe('Quick Cryptico Protocol', () => {
  it('creates instance of QuickCrypticoProtocol', () => {
    expect(new QuickCrypticoProtocol()).toBeInstanceOf(QuickCrypticoProtocol);
  });

  it('creates id', () => {
    const qcp = new QuickCrypticoProtocol();
    const id = qcp.generateId('test');
    expect(id).toBeDefined();
  });
});

describe('Encode', () => {
  it('not encodes public primitive but wraps in container', () => {
    const example = 'test string';
    const encoded = qcp.encode(example);
    expect(encoded).toMatchObject({public: example});
  });

  it('not encodes public array but wraps in container', () => {
    const example = ['test string'];
    const encoded = qcp.encode(example);
    expect(encoded).toMatchObject({public: example});
  });

  it('not encodes public object but wraps in container', () => {
    const example = {foo: 'bar'};
    const encoded = qcp.encode(example);
    expect(encoded).toMatchObject({public: example});
  });

  it('encodes private object', () => {
    const example = {
      foo: 'bar',
      test: 3,
      private: true
    };
    const encoded = qcp.encode(example);

    expect(encoded.public).toBe('[id]public');
    expect(JSON.parse(encoded.private)).toMatchObject({
      '[id]public': {
        foo: 'bar',
        test: 3,
        private: true
      }
    });
  });

  it('not encodes root public object but encodes nested private objects', () => {
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
    expect(encoded.public).toMatchObject({
      foo: 'bar',
      test1: '[id]test1',
      test2: '[id]test2'
    });
    expect(JSON.parse(encoded.private)).toMatchObject({
      '[id]test1': {
        foo: 'bar',
        test: 1,
        private: true
      },
      '[id]test2': {
        foo: 'bar',
        test: 2,
        private: true
      }
    });
  });

  it('encodes root private object with nested private objects', () => {
    const example = {
      foo: 'bar',
      private: true,
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

    expect(encoded.public).toEqual('[id]public');
    expect(JSON.parse(encoded.private)).toMatchObject({
      '[id]public': {
        foo: 'bar',
        private: true,
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
      }
    });
  });

  it('encodes private objects in array', () => {
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

    expect(encoded.public).toEqual(expect.arrayContaining(['[id]0', '[id]1', 'test']));
    expect(JSON.parse(encoded.private)).toMatchObject({
      '[id]0': {
        foo: 'bar',
        test: 1,
        private: true
      },
      '[id]1': {
        foo: 'bar',
        test: 2,
        private: true
      }
    });
  });
});

describe('Decode', () => {
  it('not decodes primitive', () => {
    const example = 'test string';
    const decoded = qcp.decode(example);
    expect(decoded).toEqual(example);
  });

  it('not decodes array', () => {
    const example = ['test string'];
    const decoded = qcp.decode(example);
    expect(decoded).toEqual(expect.arrayContaining(example));
  });

  it('not decodes object', () => {
    const example = {foo: 'bar'};
    const decoded = qcp.decode(example);
    expect(decoded).toMatchObject(example);
  });

  it('decodes primitive wrapped in container', () => {
    const example = 'test string';
    const encoded = qcp.encode(example);
    const decoded = qcp.decode(encoded);
    expect(decoded).toEqual(example);
  });

  it('decodes array wrapped in container', () => {
    const example = ['test string'];
    const encoded = qcp.encode(example);
    const decoded = qcp.decode(encoded);
    expect(decoded).toEqual(expect.arrayContaining(example));
  });

  it('decodes object wrapped in container', () => {
    const example = {foo: 'bar'};
    const encoded = qcp.encode(example);
    const decoded = qcp.decode(encoded);
    expect(decoded).toMatchObject(example);
  });

  it('decodes private object', () => {
    const example = {
      foo: 'bar',
      test: 3,
      private: true
    };
    const encoded = qcp.encode(example);
    const decoded = qcp.decode(encoded);

    expect(decoded).toMatchObject(example);
  });

  it('decodes object with nested private objects', () => {
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
    const decoded = qcp.decode(encoded);

    expect(decoded).toMatchObject(example);
  });

  it('decodes root object with nested private objects', () => {
    const example = {
      foo: 'bar',
      private: true,
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
    const decoded = qcp.decode(encoded);

    expect(decoded).toMatchObject(example);
  });

  it('encodes private objects in array', () => {
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
    const decoded = qcp.decode(encoded);

    expect(decoded).toEqual(expect.arrayContaining(example));
  });
});
