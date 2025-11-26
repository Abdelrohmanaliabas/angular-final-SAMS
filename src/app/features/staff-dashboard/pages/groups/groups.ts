import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups {

  isFormOpen = false;
  isEditMode = false;
  searchText = '';

  newGroup = {
    name: '',
    category: '',
    description: '',
    members: 0,
    online: 0,
    img: ''
  };

  groupsList = [
    {
      name: 'Cuisine',
      category: 'Food',
      description: 'Food lovers group',
      members: 55,
      online: 22,
      img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1170&q=80',
    },
    {
      name: 'Art',
      category: 'Drawing',
      description: 'Artists community',
      members: 132,
      online: 4,
      img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1171&q=80',
    }
  ];

  filteredGroups = [...this.groupsList];

  /** ------------------------- OPEN PANEL ------------------------- */
  openForm(group?: any) {
    this.isFormOpen = true;

    if (group) {
      this.isEditMode = true;
      this.newGroup = { ...group };
    } else {
      this.isEditMode = false;
      this.newGroup = {
        name: '',
        category: '',
        description: '',
        members: 0,
        online: 0,
        img: ''
      };
    }
  }

  /** ------------------------- CLOSE PANEL ------------------------- */
  closeForm() {
    this.isFormOpen = false;
  }

  /** ------------------------- SAVE GROUP ------------------------- */
  saveGroup() {
    if (this.isEditMode) {
      const index = this.groupsList.findIndex(g => g.name === this.newGroup.name);
      if (index !== -1) {
        this.groupsList[index] = { ...this.newGroup };
      }
    } else {
      this.newGroup.img = 'https://via.placeholder.com/150';
      this.groupsList.push({ ...this.newGroup, members: 1, online: 0 });
    }

    this.filteredGroups = [...this.groupsList];
    this.closeForm();
  }

  /** ------------------------- DELETE GROUP ------------------------- */
  deleteGroup(name: string) {
    this.groupsList = this.groupsList.filter(g => g.name !== name);
    this.filteredGroups = [...this.groupsList];
  }

  /** ------------------------- SEARCH ------------------------- */
  search() {
    this.filteredGroups = this.groupsList.filter(g =>
      g.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      g.category.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
