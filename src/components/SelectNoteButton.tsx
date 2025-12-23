import { Note } from '@/db/generated/client'
import useNote from '@/hooks/useNote';
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { SidebarMenuButton } from './ui/sidebar';
import Link from 'next/link';

type Prop = {
    note : Note,
}

function SelectNoteButton({note} : Prop) {

    const noteId = useSearchParams().get("noteId") || "";
    const {noteText : globalNoteText} = useNote();

    const [localNotetext, setLocalNotetext] = useState(note.text);
    const [shouldUseGlobalNoteText, setShouldUseGlobalNoteText] = useState(false);

    useEffect(() => {
        if(note.id == noteId) {
            setShouldUseGlobalNoteText(true);
        }
        else{
            setShouldUseGlobalNoteText(false);
        }
    }, [noteId, note.id]);

    useEffect(() => {
        if(shouldUseGlobalNoteText) {
            setLocalNotetext(globalNoteText);
        }
    }, [shouldUseGlobalNoteText, globalNoteText]);

    const blankNote = "";
    let noteText = localNotetext || blankNote;
    if(shouldUseGlobalNoteText) {
        noteText = globalNoteText || blankNote;
    }


  return (
    <SidebarMenuButton asChild className={`items-start gap-0 pr-12 ${note.id === noteId && "bg-sidebar-accent/50"}`}>
        <Link href={`/?noteId=${note.id}`} className='flex h-fit flex-col'>
            <p className="w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
                {noteText || <span className='text-muted-foreground'>EMPTY NOTE</span>}
            </p>
            <p className="text-muted-foreground text-xs">
                {note.updatedAt.toLocaleDateString()}
            </p>
        </Link>
    </SidebarMenuButton>
  )
}

export default SelectNoteButton