import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from './notes.service';
import { Note } from './note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes.component.html',
})
export class NotesComponent {
  notes: Note[] = [];
  newTitle = '';
  newContent = '';

  constructor(private notesService: NotesService) {
    this.loadNotes();
  }

  loadNotes() {
    this.notesService.getNotes().subscribe(notes => this.notes = notes);
  }

  addNote() {
    if (!this.newTitle || !this.newContent) return;
    this.notesService.addNote({ title: this.newTitle, content: this.newContent }).subscribe(note => {
      this.notes.push(note);
      this.newTitle = '';
      this.newContent = '';
    });
  }

  deleteNote(id: string) {
    this.notesService.deleteNote(id).subscribe(() => {
      this.notes = this.notes.filter(n => n.id !== id);
    });
  }
}
