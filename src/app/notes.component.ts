import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NotesService } from './notes.service';
import { Note } from './note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {
  notes: Note[] = [];
  newTitle = '';
  newContent = '';
  isLoading = false;
  editingNoteId: string | null = null;
  editedTitle = '';
  editedContent = '';
  private destroy$ = new Subject<void>();

  constructor(private notesService: NotesService) {}

  ngOnInit() {
    this.loadNotes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotes() {
    this.isLoading = true;
    console.log('Getting notes data...');
    this.notesService.getNotes().pipe(takeUntil(this.destroy$)).subscribe({
      next: notes => {
        console.log('Loaded notes:', notes); // <-- verify all notes
        console.log('Result from getNotes:', notes);
        this.notes = notes;
        this.isLoading = false;
      },
      error: err => { console.error('Failed to load notes', err); this.isLoading = false; }
    });
  }

  addNote() {
    if (!this.newTitle.trim() && !this.newContent.trim()) return;
    const notePayload = {
      title: this.newTitle.trim(),
      content: this.newContent.trim()
    };
    this.notesService.addNote(notePayload).pipe(takeUntil(this.destroy$)).subscribe({
      next: note => {
        this.notes.push(note);
        this.newTitle = '';
        this.newContent = '';
      },
      error: err => console.error('Failed to add note', err)
    });
  }

  deleteNote(id: string) {
    this.notesService.deleteNote(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.notes = this.notes.filter(n => n.id !== id),
      error: err => console.error('Failed to delete note', err)
    });
  }

  startEdit(note: Note): void {
    this.editingNoteId = note.id;
    this.editedTitle = note.title;
    this.editedContent = note.content;
  }

  cancelEdit(): void {
    this.editingNoteId = null;
  }

  updateNote(): void {
    if (!this.editingNoteId) {
      return;
    }

    const notePayload: Partial<Note> = {
      title: this.editedTitle,
      content: this.editedContent,
    };

    this.notesService.updateNote(this.editingNoteId, notePayload).pipe(takeUntil(this.destroy$)).subscribe({
      next: updatedNote => {
        const index = this.notes.findIndex(n => n.id === this.editingNoteId);
        if (index !== -1) {
          this.notes[index] = updatedNote;
        }
        this.cancelEdit();
      },
      error: err => console.error('Failed to update note', err)
    });
  }
}
