/**
 * Determines if an object contains a given property. It augments the provided
 * object's type to include the property.
 *
 * @remarks
 * This function is only necessary because TypeScript does not narrow a type
 * after using the `in` operator on `object`.
 * @returns `true` if `obj` contains a `prop` property, `false` otherwise.
 */
export const hasOwnProperty = <X extends object, Y extends PropertyKey>(
	obj: X,
	prop: Y,
): obj is X & Record<Y, unknown> => {
	return obj.hasOwnProperty(prop);
};
