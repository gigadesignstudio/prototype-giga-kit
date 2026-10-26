import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import tokens from "../../tokens/tokens.json";

const twMerge = extendTailwindMerge({
  extend: { classGroups: { typo: [{ typo: [...Object.keys(tokens.utilities).map((k) => k.replace("typo-", "")), ...Object.keys(tokens.typography)] }] } },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
