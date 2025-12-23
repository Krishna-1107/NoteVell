import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error : unknown) => {
  if(error  instanceof Error) {
    return {errMessage: error.message};
  }
  else{
    return {errMessage: "an unknown error occured"};
  }
};
