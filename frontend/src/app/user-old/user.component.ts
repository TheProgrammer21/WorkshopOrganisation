import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  public user: User;

  constructor(private userService: UserService) {
    this.userService.getUser().subscribe(user => this.user = user);
  }

  ngOnInit() {
  }

}
