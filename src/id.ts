export class Id {
	public static _length = 16;
	public static _map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

	public static get (length = Id._length): string {
		let value = '';

		for (let i = 0; i < length; i++) {
			value += Id._map.charAt(Math.floor(Math.random() * Id._map.length));
		}

		return value;
	}
}
