import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const scryptCost = 16_384;
const scryptBlockSize = 8;
const scryptParallelization = 1;
const passwordKeyLength = 64;

export function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      passwordKeyLength,
      {
        N: scryptCost,
        r: scryptBlockSize,
        p: scryptParallelization,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(
          `scrypt$${scryptCost}$${scryptBlockSize}$${scryptParallelization}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`,
        );
      },
    );
  });
}

export function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, encodedSalt, encodedKey, ...extra] =
    encodedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    cost !== String(scryptCost) ||
    blockSize !== String(scryptBlockSize) ||
    parallelization !== String(scryptParallelization) ||
    !encodedSalt ||
    !encodedKey ||
    extra.length > 0
  ) {
    return Promise.resolve(false);
  }

  const salt = Buffer.from(encodedSalt, "base64url");
  const expectedKey = Buffer.from(encodedKey, "base64url");
  if (
    salt.length !== 16 ||
    expectedKey.length !== passwordKeyLength ||
    salt.toString("base64url") !== encodedSalt ||
    expectedKey.toString("base64url") !== encodedKey
  ) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      passwordKeyLength,
      {
        N: scryptCost,
        r: scryptBlockSize,
        p: scryptParallelization,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(timingSafeEqual(expectedKey, derivedKey));
      },
    );
  });
}
