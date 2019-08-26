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

describe('Encrypt', () => {
  it('not encrypts public primitive but wraps in container', () => {
    const example = 'test string';
    const encrypted = qcp.encrypt(example);
    expect(encrypted).toMatchObject({public: example});
  });

  it('not encrypts public array but wraps in container', () => {
    const example = ['test string'];
    const encrypted = qcp.encrypt(example);
    expect(encrypted).toMatchObject({public: example});
  });

  it('not encrypts public object but wraps in container', () => {
    const example = {foo: 'bar'};
    const encrypted = qcp.encrypt(example);
    expect(encrypted).toMatchObject({public: example});
  });

  it('encrypts private object', () => {
    const example = {
      foo: 'bar',
      test: 3,
      private: true
    };
    const encrypted = qcp.encrypt(example);

    expect(encrypted.public).toBe('[id]public');
    expect(JSON.parse(encrypted.private)).toMatchObject({
      '[id]public': {
        foo: 'bar',
        test: 3,
        private: true
      }
    });
  });

  it('not encrypts root public object but encrypts nested private objects', () => {
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
    const encrypted = qcp.encrypt(example);
    expect(encrypted.public).toMatchObject({
      foo: 'bar',
      test1: '[id]test1',
      test2: '[id]test2'
    });
    expect(JSON.parse(encrypted.private)).toMatchObject({
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

  it('encrypts root private object with nested private objects', () => {
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
    const encrypted = qcp.encrypt(example);

    expect(encrypted.public).toEqual('[id]public');
    expect(JSON.parse(encrypted.private)).toMatchObject({
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

  it('encrypts private objects in array', () => {
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
    const encrypted = qcp.encrypt(example);

    expect(encrypted.public).toEqual(expect.arrayContaining(['[id]0', '[id]1', 'test']));
    expect(JSON.parse(encrypted.private)).toMatchObject({
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

describe('Decrypt', () => {
  it('not decrypts primitive', () => {
    const example = 'test string';
    const decrypted = qcp.decrypt(example);
    expect(decrypted).toEqual(example);
  });

  it('not decrypts array', () => {
    const example = ['test string'];
    const decrypted = qcp.decrypt(example);
    expect(decrypted).toEqual(expect.arrayContaining(example));
  });

  it('not decrypts object', () => {
    const example = {foo: 'bar'};
    const decrypted = qcp.decrypt(example);
    expect(decrypted).toMatchObject(example);
  });

  it('decrypts primitive wrapped in container', () => {
    const example = 'test string';
    const encrypted = qcp.encrypt(example);
    const decrypted = qcp.decrypt(encrypted);
    expect(decrypted).toEqual(example);
  });

  it('decrypts array wrapped in container', () => {
    const example = ['test string'];
    const encrypted = qcp.encrypt(example);
    const decrypted = qcp.decrypt(encrypted);
    expect(decrypted).toEqual(expect.arrayContaining(example));
  });

  it('decrypts object wrapped in container', () => {
    const example = {foo: 'bar'};
    const encrypted = qcp.encrypt(example);
    const decrypted = qcp.decrypt(encrypted);
    expect(decrypted).toMatchObject(example);
  });

  it('decrypts private object', () => {
    const example = {
      foo: 'bar',
      test: 3,
      private: true
    };
    const encrypted = qcp.encrypt(example);
    const decrypted = qcp.decrypt(encrypted);

    expect(decrypted).toMatchObject(example);
  });

  it('decrypts object with nested private objects', () => {
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
    const encrypted = qcp.encrypt(example);
    const decrypted = qcp.decrypt(encrypted);

    expect(decrypted).toMatchObject(example);
  });

  it('decrypts root object with nested private objects', () => {
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
    const encrypted = qcp.encrypt(example);
    const decrypted = qcp.decrypt(encrypted);

    expect(decrypted).toMatchObject(example);
  });

  it('decrypts private objects in array', () => {
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
    const encrypted = qcp.encrypt(example);
    const decrypted = qcp.decrypt(encrypted);

    expect(decrypted).toEqual(expect.arrayContaining(example));
  });
});
