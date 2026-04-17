// export async function runWithTimeout<T>(
//   promise: Promise<T>,
//   ms: number,
// ): Promise<T> {
//   let timeoutId: NodeJS.Timeout;

//   const timeoutPromise = new Promise<never>((_, reject) => {
//     timeoutId = setTimeout(() => {
//       reject(new Error("TIMEOUT"));
//     }, ms);
//   });

//   try {
//     return await Promise.race([promise, timeoutPromise]);
//   } finally {
//     clearTimeout(timeoutId);
//   }
// }

export async function runWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, ms);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}
