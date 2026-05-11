import { Prisma } from "@prisma/client";

type DecimalLike = Prisma.Decimal | number | string;

export function toDecimal(value: DecimalLike) {
  return new Prisma.Decimal(value);
}

export function toNumber(value: DecimalLike) {
  return new Prisma.Decimal(value).toNumber();
}

export function roundMoney(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2).toNumber();
}

export function roundQuantity(value: Prisma.Decimal) {
  return value.toDecimalPlaces(3).toNumber();
}
