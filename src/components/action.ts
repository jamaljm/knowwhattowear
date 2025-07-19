"use server"


export async function sleep50s() {
  await new Promise(resolve => setTimeout(resolve, 50000));
  return "hello";
}