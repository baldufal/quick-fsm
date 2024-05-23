 // For deep copying complex types like triggers
 export function customDeepCopy<T>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Return value if obj is not an object or null
    }
  
  if (Array.isArray(obj)) { // Create a new array if obj is an array
      const copy: any[] = [];
      obj.forEach((element, index) => {
        copy[index] = customDeepCopy(element);
      });
      return copy as any as T;
    }
  
  // Create a new object by copying properties from the original object,
  // except for properties of type function (like our IconType), which are just referenced.
  const copy = {} as any;
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const val = (obj as any)[prop];
    copy[prop] = typeof val === 'function' ? val : customDeepCopy(val);
  });
  return copy as T;
  }