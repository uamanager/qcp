import {Id} from '../src/id';

const isArrayUnique = arr => Array.isArray(arr) && new Set(arr).size === arr.length;

describe('Id', () => {
  it('creates id', () => {
    const id = Id.get();
    expect(id).toBeDefined();
  });

  it('creates id of desired length', () => {
    const id = Id.get(256);
    expect(id.length).toBe(256);
  });

  it('creates random id', () => {
    const ids = [];
    for (let i = 0; i < 1000; i++){
      ids.push(Id.get());
    }
    expect(isArrayUnique(ids)).toBeTruthy();
  });
});
