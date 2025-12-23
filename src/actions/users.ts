"use server";
import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { prisma } from "@/db/prisma";

export async function loginAction(email: string, password: string) {

    try {

        const {auth} = await createClient();

        const {error} = await auth.signInWithPassword({
            email,
            password
        });

        if(error) throw error;

        return {errMessage: null};
    }
    catch (error) {
        return handleError(error);
    }
}

export async function logOutAction() {

    try {

        const {auth} = await createClient();

        const {error} = await auth.signOut();

        if(error) throw error;

        return {errMessage: null};
    }
    catch (error) {
        return handleError(error);
    }
}

export async function signUpAction(email: string, password: string) {

    try {

        const {auth} = await createClient();

        const {data, error} = await auth.signUp({
            email,
            password
        });

        if(error) throw error;

        const userId = data.user?.id;

        await prisma.user.create({
            data: {
                id: userId!,
                email: email,
            }
        });

        if(!userId) throw new Error("User ID not found after sign up.");

        return {errMessage: null};
    }
    catch (error) {
        return handleError(error);
    }
}