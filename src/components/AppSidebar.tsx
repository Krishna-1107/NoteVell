import { getUser } from "@/auth/server"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Note } from "@/db/generated/client";
import { prisma } from "@/db/prisma";
import Link from "next/link";
import SidebarGroupContent from "./SidebarGroupContent";

export async function AppSidebar() {

    const user = await getUser();

    let notes : Note[] = [];

    if(user) {
        notes = await prisma.note.findMany({
            where : {
                authorId : user.id,
            },
            orderBy : {
                updatedAt : "desc",
            }
        });
    }

  return (
    <Sidebar className="z-500">
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup />
        <SidebarGroupLabel className="mb-2 mt-1 text-lg">
            {user ? ("Your Notes") : (
                    <p>
                        <Link href="/login">Login</Link>{" "}
                        to see your notes
                    </p>
                )
            }
        </SidebarGroupLabel>
        {user && <SidebarGroupContent notes={notes}/>}
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}