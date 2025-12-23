"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function createNoteAction(noteId: string) {

    try {

        const user = await getUser();

        if(!user) throw new Error("login to update notes");

        await prisma.note.create({
            data: {
                id: noteId,
                text: "",
                authorId: user.id,
            }
        });

        revalidatePath("/");

        return {errMessage : null};
    }
    catch (error) {
        return handleError(error);
    }
}

export async function updateNoteAction(noteId: string, text: string) {

    try {

        const user = await getUser();

        if(!user) throw new Error("login to update notes");

        await prisma.note.update({
            where : {id : noteId},
            data: {text},
        })

        return {errMessage : null};
    }
    catch (error) {
        return handleError(error);
    }
}

export async function deleteNoteAction(noteId: string) {

    try {

        const user = await getUser();

        if(!user) throw new Error("login to update notes");

        await prisma.note.delete({
            where : {id : noteId},
        })

        return {errMessage : null};
    }
    catch (error) {
        return handleError(error);
    }
}

// export async function askAIAboutNotesAction(questions : string[], responses : string[]) {

//     const user = await getUser();
//     if(!user) throw new Error("you must be logged in to ask AI questions");

//     const notes = await prisma.note.findMany({
//         where : {
//             authorId : user.id,
//         },
//         orderBy : {
//             updatedAt : "desc",
//         },
//         select : {
//             text : true,
//             createdAt : true,
//             updatedAt : true,
//         }
//     });

//     if(notes.length === 0) {
//         return "you don't have any notes yet.";
//     }

//     const formattedNotes = notes.map((note) => (
//         `
//         Text : ${note.text}
//         CreatedAt : ${note.createdAt}
//         UpdatedAt : ${note.updatedAt}
//         `.trim()
//     )).join("\n\n");

//     const systemInstruction = `
//       You are a helpful assistant that answers questions about a user's notes. 
//       Assume all questions are related to the user's notes. 
//       Make sure that your answers are not too verbose and you speak succinctly. 
//       Your responses MUST be formatted in clean, valid HTML with proper structure. 
//       Use tags like <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1> to <h6>, and <br> when appropriate. 
//       Do NOT wrap the entire response in a single <p> tag unless it's a single paragraph. 
//       Avoid inline styles, JavaScript, or custom attributes.
      
//       Here are the user's notes:
//       ${formattedNotes}
//     `;

//     try {
//         const model = genAI.getGenerativeModel({
//             model : "gemini-1.5-flash",
//             systemInstruction,
//         });

//         const history = [];

//         for(let i=0; i<questions.length-1; i++) {
//             history.push({
//                 role : "user",
//                 parts : [{text : questions[i]}],
//             });

//             if(responses[i]) {
//                 history.push({
//                     role : "model",
//                     parts : [{text : responses[i]}],
//                 });
//             }
//         }

//         const chat = model.startChat({history});

//         const currQuestion = questions[questions.length-1];
//         const result = await chat.sendMessage(currQuestion);

//         return result.response.text();
//     }
//     catch(error) {
//         console.log("gemini API error", error);
//         handleError(error);
//     }

// }

export async function askAIAboutNotesAction(questions: string[], responses: string[]) {
    console.log("--- STARTING AI REQUEST ---");
    
    // 1. Check API Key
    if (!process.env.GEMINI_API_KEY) {
        console.error("CRITICAL: GEMINI_API_KEY is missing from process.env");
        return "Error: Server misconfiguration (Missing API Key)";
    }
    console.log("API Key found:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");

    try {
        const user = await getUser();
        if (!user) {
            console.log("User not logged in");
            throw new Error("You must be logged in to ask AI questions");
        }

        const notes = await prisma.note.findMany({
            where: { authorId: user.id },
            orderBy: { updatedAt: "desc" },
            select: { text: true, createdAt: true, updatedAt: true }
        });

        console.log(`Found ${notes.length} notes for user.`);

        if (notes.length === 0) return "You don't have any notes yet.";

        // Fix: Added implicit return
        const formattedNotes = notes.map((note) => 
            `Text: ${note.text}\nDate: ${note.updatedAt}`
        ).join("\n\n");

        console.log("Notes formatted. Length:", formattedNotes.length);

        const systemInstruction = `
          You are a helpful assistant that answers questions about a user's notes.
          Assume all questions are related to the user's notes.
        
          FORMATTING RULES:
          - Use standard Markdown formatting.
          - Use bolding, lists, and headers where appropriate to make the text readable.
          - Keep answers succinct.
          ${formattedNotes}
        `;

        // 2. Initialize Model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction,
        });

        // 3. Build History
        const history = [];
        for (let i = 0; i < questions.length - 1; i++) {
            history.push({ role: "user", parts: [{ text: questions[i] }] });
            if (responses[i]) {
                history.push({ role: "model", parts: [{ text: responses[i] }] });
            }
        }

        // 4. Send Request
        const chat = model.startChat({ history });
        const currQuestion = questions[questions.length - 1];
        
        console.log("Sending question to Gemini:", currQuestion);
        
        const result = await chat.sendMessage(currQuestion);
        
        // 5. CRITICAL: Check for Safety Blocks
        // If the AI refuses to answer, response.text() will throw an error or be empty
        // We log the "finishReason" to see WHY it stopped.
        const response = await result.response;
        console.log("Finish Reason:", response.candidates?.[0]?.finishReason);
        console.log("Safety Ratings:", JSON.stringify(response.promptFeedback, null, 2));

        function cleanAIResponse(text: string): string {
            let cleaned = text.replace(/^```html\s*/i, "").replace(/```\s*$/, "");
            cleaned = cleaned.replace(/^```\s*/i, "");
            return cleaned.trim();
        }

        const text = response.text(); // This line crashes if blocked
        console.log("AI Response received successfully");
        
        return cleanAIResponse(text);

    } catch (error: any) {
        // 6. Log the REAL error
        console.error("!!! ERROR OCCURRED !!!");
        console.error(error);
        
        // Check if it's a safety block error
        if (error.message?.includes("candidate was blocked")) {
            return "<p>I cannot answer this question because it triggered my safety filters.</p>";
        }

        return "<p>I'm sorry, I'm having trouble connecting to the AI right now. Check the server logs.</p>";
    }
}