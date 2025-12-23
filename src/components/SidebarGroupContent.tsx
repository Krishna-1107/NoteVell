"use client";

import { Note } from '@/db/generated/client'
import {SidebarGroupContent as SidebarGroupContentShadCN, SidebarMenu, SidebarMenuItem} from './ui/sidebar'
import React, { useEffect, useMemo, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from './ui/input'
import Fuse from 'fuse.js'
import SelectNoteButton from './SelectNoteButton';
import DeleteNoteButton from './DeleteNoteButton';

type Props = {
    notes : Note[],
}

function SidebarGroupContent({notes} : Props) {

  const [searchText, setSearchText] = useState("");
  const [localNotes, setLocalNotes] = useState<Note[]>(notes);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const fuse = useMemo(() => {
    return new Fuse(localNotes, {
      keys: ['text'],
      threshold: 0.3,
    });
  }, [localNotes]);

  const filteredNotes = searchText ? fuse.search(searchText).map(result => result.item) : localNotes;

  const deleteNoteLocally = (noteId : string) => {
    setLocalNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId))
  }

  return (
    <SidebarGroupContentShadCN>
      <div className='relative flex items-center mx-2'>
        <SearchIcon  className='absolute left-2 size-4'/>
        <Input className='bg-muted pl-8'
        placeholder='search your notes...'
        value={searchText}
        onChange={(e) => {setSearchText(e.target.value)}}/>
      </div>
      <SidebarMenu className='mt-4'>
        {filteredNotes.map((note) => 
          <SidebarMenuItem key={note.id} className='group/item'>
            <SelectNoteButton note={note}/>
            <DeleteNoteButton noteId={note.id} deleteNoteLocally={deleteNoteLocally}/>
            </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroupContentShadCN>
  )
}

export default SidebarGroupContent