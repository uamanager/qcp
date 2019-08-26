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
